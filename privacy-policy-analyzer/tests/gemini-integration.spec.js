const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const extensionPath = path.join(__dirname, '..');

test.describe('Gemini API Integration Test', () => {
    let browser, context;
    const extensionId = 'fhlgakpcnflpcnenlhfmieelkigbgkkk';

    test.beforeAll(async ({ playwright }) => {
        browser = await playwright.chromium.launchPersistentContext('', {
            headless: false,
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`,
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        context = browser;

        // Wait for extension to load
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    test.afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    test('should configure Gemini and test AI analysis', async () => {
        // Configure Gemini API Key
        const optionsPage = await context.newPage();
        await optionsPage.goto(`chrome-extension://${extensionId}/options.html`);
        await optionsPage.waitForSelector('#aiProvider', { timeout: 10000 });

        // Set to Gemini
        await optionsPage.locator('#aiProvider').selectOption('gemini');
        await optionsPage.waitForSelector('#apiKey', { state: 'visible', timeout: 5000 });

        // Get API key from environment variable
        const geminiApiKey = process.env.GEMINI_API_KEY || 'your-api-key-here';

        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is required for this test');
        }

        await optionsPage.locator('#apiKey').fill(geminiApiKey);
        await optionsPage.locator('button[type="submit"]').click();

        await optionsPage.waitForSelector('.status-message', { timeout: 10000 });
        await optionsPage.close();

        // Test AI analysis
        const testPage = await context.newPage();
        await testPage.goto('https://www.economistgroup.com/privacy-policy');
        await testPage.waitForLoadState('networkidle');

        // Wait for content script to initialize
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Open popup
        const popup = await context.newPage();
        await popup.goto(`chrome-extension://${extensionId}/popup.html`);
        await popup.waitForSelector('#analyzeBtn', { timeout: 10000 });

        const buttonEnabled = await popup.locator('#analyzeBtn').isEnabled();
        expect(buttonEnabled).toBe(true);

        // Start analysis
        await popup.locator('#analyzeBtn').click();

        // Wait for analysis to complete
        await popup.waitForSelector('#results', { state: 'visible', timeout: 120000 });

        const resultsText = await popup.locator('#results').textContent();

        // Verify analysis completed successfully
        expect(resultsText.length).toBeGreaterThan(0);
        expect(resultsText).toContain('issues found');

        // Test View Results button if available
        const viewResultsBtn = popup.locator('#viewResultsBtn');
        const viewResultsVisible = await viewResultsBtn.isVisible();

        if (viewResultsVisible) {
            await viewResultsBtn.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await popup.close();
        await testPage.close();
    });
});
