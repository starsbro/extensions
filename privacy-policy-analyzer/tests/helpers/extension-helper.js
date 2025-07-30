import { expect } from '@playwright/test';

/**
 * Extension testing utilities for Privacy Policy Analyzer
 */
export class ExtensionHelper {
    constructor(page, context) {
        this.page = page;
        this.context = context;
        this.extensionId = null;
    }

    /**
     * Get the extension ID by finding the service worker
     */
    async getExtensionId() {
        if (this.extensionId) {
            return this.extensionId;
        }

        // Wait for extension to load
        await this.page.waitForTimeout(3000);

        // Try to get extension ID from service workers
        const serviceWorkers = this.context.serviceWorkers();
        for (const worker of serviceWorkers) {
            if (worker.url().includes('chrome-extension://')) {
                const url = worker.url();
                this.extensionId = url.match(/chrome-extension:\/\/([^\/]+)/)?.[1];
                break;
            }
        }

        // If not found, try to get it from background pages
        if (!this.extensionId) {
            const backgroundPages = this.context.backgroundPages();
            for (const bgPage of backgroundPages) {
                if (bgPage.url().includes('chrome-extension://')) {
                    const url = bgPage.url();
                    this.extensionId = url.match(/chrome-extension:\/\/([^\/]+)/)?.[1];
                    break;
                }
            }
        }

        // If still not found, navigate to extensions page and try to find it
        if (!this.extensionId) {
            try {
                const extensionsPage = await this.context.newPage();
                await extensionsPage.goto('chrome://extensions/');
                await extensionsPage.waitForTimeout(2000);

                // Look for our extension by name
                const extensionElements = await extensionsPage.$$('extensions-item');
                for (const element of extensionElements) {
                    const nameElement = await element.$('div[slot="name"]');
                    if (nameElement) {
                        const name = await nameElement.textContent();
                        if (name && name.includes('Privacy Policy Analyzer')) {
                            const id = await element.getAttribute('id');
                            if (id) {
                                this.extensionId = id;
                                break;
                            }
                        }
                    }
                }

                await extensionsPage.close();
            } catch (error) {
                // Chrome extensions page might not be accessible in test environment
            }
        }

        if (!this.extensionId) {
            throw new Error('Could not find extension ID. Make sure the extension is loaded.');
        }

        return this.extensionId;
    }

    /**
     * Open the extension popup
     */
    async openPopup() {
        const extensionId = await this.getExtensionId();
        const popupPage = await this.context.newPage();
        await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
        await popupPage.waitForLoadState('domcontentloaded');
        return popupPage;
    }

    /**
     * Open the extension options page
     */
    async openOptions() {
        const extensionId = await this.getExtensionId();
        const optionsPage = await this.context.newPage();
        await optionsPage.goto(`chrome-extension://${extensionId}/options.html`);
        await optionsPage.waitForLoadState('domcontentloaded');
        return optionsPage;
    }

    /**
     * Wait for content script to be injected
     */
    async waitForContentScript() {
        await this.page.waitForFunction(() => {
            return window.privacyAnalyzer !== undefined;
        }, { timeout: 10000 });
    }

    /**
     * Check if extension is loaded
     */
    async isExtensionLoaded() {
        try {
            await this.getExtensionId();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Wait for analysis panel to appear
     */
    async waitForAnalysisPanel() {
        await this.page.waitForSelector('#privacy-analysis-panel', { timeout: 15000 });
    }

    /**
     * Get analysis panel content
     */
    async getAnalysisPanelContent() {
        const panel = await this.page.locator('#privacy-analysis-panel');
        await expect(panel).toBeVisible();

        const issues = await panel.locator('.issue-item').count();
        const summary = await panel.locator('.analysis-summary').textContent();

        return {
            issuesCount: issues,
            summary: summary?.trim() || '',
            panel
        };
    }

    /**
     * Click an issue to test highlighting
     */
    async clickIssue(issueIndex = 0) {
        const panel = await this.page.locator('#privacy-analysis-panel');
        const issues = panel.locator('.issue-item');
        await issues.nth(issueIndex).click();

        // Wait for highlighting to appear
        await this.page.waitForTimeout(1000);
    }

    /**
     * Check if text is highlighted
     */
    async isTextHighlighted() {
        const highlights = await this.page.locator('.privacy-highlight').count();
        return highlights > 0;
    }

    /**
     * Close analysis panel
     */
    async closeAnalysisPanel() {
        await this.page.click('#privacy-analysis-panel .panel-close-btn');
        await this.page.waitForSelector('#privacy-analysis-panel', { state: 'detached' });
    }

    /**
     * Simulate extension icon click (via popup)
     */
    async clickExtensionIcon() {
        return await this.openPopup();
    }

    /**
     * Test popup functionality
     */
    async testPopupAnalysis() {
        const popup = await this.openPopup();

        // Click analyze button
        await popup.click('[data-action="analyze"]');

        // Wait for analysis to complete
        await popup.waitForSelector('.analysis-complete', { timeout: 30000 });

        // Click view results
        await popup.click('[data-action="show-results"]');

        // Switch back to main page and wait for panel
        await this.page.bringToFront();
        await this.waitForAnalysisPanel();

        await popup.close();
    }
}

/**
 * Test data generator for privacy policies
 */
export class TestDataGenerator {
    static createPrivacyPolicyPage(concerns = []) {
        const defaultConcerns = [
            'We may share your personal information with third parties',
            'Your data will be stored indefinitely',
            'We may change this policy at any time without notice',
            'We use cookies to track your activity across websites'
        ];

        const concernsToUse = concerns.length > 0 ? concerns : defaultConcerns;

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Privacy Policy - Test Company</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <header>
          <h1>Privacy Policy</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>
        </header>
        
        <main>
          <h2>Our Privacy Policy</h2>
          <p>Last updated: ${new Date().toISOString().split('T')[0]}</p>
          
          <section>
            <h3>Data Collection</h3>
            <p>We collect personal information when you use our services.</p>
            <p>${concernsToUse[0]}</p>
          </section>
          
          <section>
            <h3>Data Storage</h3>
            <p>We store your information securely.</p>
            <p>${concernsToUse[1]}</p>
          </section>
          
          <section>
            <h3>Policy Changes</h3>
            <p>${concernsToUse[2]}</p>
          </section>
          
          <section>
            <h3>Cookies and Tracking</h3>
            <p>${concernsToUse[3]}</p>
          </section>
          
          <footer>
            <p>© 2024 Test Company. All rights reserved.</p>
          </footer>
        </main>
      </body>
      </html>
    `;
    }

    static createNonPrivacyPage() {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>About Us - Test Company</title>
      </head>
      <body>
        <h1>About Our Company</h1>
        <p>We are a technology company focused on innovation.</p>
        <p>Our team is dedicated to creating amazing products.</p>
      </body>
      </html>
    `;
    }
}

/**
 * Mock server for testing external requests
 */
export class MockServer {
    static geminiSuccessResponse = {
        candidates: [{
            content: {
                parts: [{
                    text: JSON.stringify({
                        issues: [
                            {
                                id: 'test_issue_1',
                                severity: 'high',
                                category: 'Data Sharing',
                                title: 'Third-Party Data Sharing',
                                description: 'Your data may be shared with third parties',
                                legalSuggestion: 'Review what specific data is shared and with whom',
                                matchedText: 'We may share your personal information with third parties'
                            }
                        ],
                        summary: 'Found 1 high-severity privacy concern',
                        recommendations: ['Review third-party sharing policies']
                    })
                }]
            }
        }]
    };

    static geminiErrorResponse = {
        error: {
            code: 400,
            message: 'Invalid API key',
            status: 'INVALID_ARGUMENT'
        }
    };
}
