import { test, expect } from '@playwright/test';
import { ExtensionHelper } from './helpers/extension-helper.js';

test.describe('Extension Loading and Basic Functionality', () => {
    let extensionHelper;

    test.beforeEach(async ({ page, context }) => {
        extensionHelper = new ExtensionHelper(page, context);
    });

    test('should load extension successfully', async ({ page, context }) => {
        // Wait for extension to load
        await page.goto('chrome://extensions/');
        await page.waitForTimeout(2000);

        // Check if extension is loaded
        const isLoaded = await extensionHelper.isExtensionLoaded();
        expect(isLoaded).toBe(true);

        const extensionId = await extensionHelper.getExtensionId();
        expect(extensionId).toBeTruthy();
        expect(extensionId.length).toBe(32); // Chrome extension IDs are 32 characters
    });

    test('should open popup successfully', async ({ page }) => {
        const popup = await extensionHelper.openPopup();

        // Check popup elements
        await expect(popup.locator('h1')).toContainText('Privacy Policy Analyzer');
        await expect(popup.locator('[data-action="analyze"]')).toBeVisible();
        await expect(popup.locator('[data-action="show-results"]')).toBeVisible();

        await popup.close();
    });

    test('should open options page successfully', async ({ page }) => {
        const options = await extensionHelper.openOptions();

        // Check options page elements
        await expect(options.locator('h1')).toContainText('Settings');
        await expect(options.locator('#apiKey')).toBeVisible();
        await expect(options.locator('#aiProvider')).toBeVisible();

        await options.close();
    });

    test('should inject content script into pages', async ({ page }) => {
        await page.goto('https://example.com');

        // Wait for content script injection
        await extensionHelper.waitForContentScript();

        // Check if global analyzer is available
        const analyzerExists = await page.evaluate(() => {
            return typeof window.privacyAnalyzer !== 'undefined';
        });

        expect(analyzerExists).toBe(true);
    });

    test('should load CSS styles correctly', async ({ page }) => {
        await page.goto('https://example.com');
        await page.waitForLoadState('domcontentloaded');

        // Check if CSS is injected by creating a test element
        const cssLoaded = await page.evaluate(() => {
            const testDiv = document.createElement('div');
            testDiv.className = 'privacy-analysis-panel';
            testDiv.style.display = 'none';
            document.body.appendChild(testDiv);

            const computed = window.getComputedStyle(testDiv);
            const hasCustomStyles = computed.position === 'fixed' ||
                computed.zIndex === '10000' ||
                computed.backgroundColor !== 'rgba(0, 0, 0, 0)';

            document.body.removeChild(testDiv);
            return hasCustomStyles;
        });

        expect(cssLoaded).toBe(true);
    });

    test('should handle extension icon click', async ({ page }) => {
        await page.goto('https://policies.google.com/privacy');

        const popup = await extensionHelper.clickExtensionIcon();
        await expect(popup.locator('[data-action="analyze"]')).toBeVisible();
        await popup.close();
    });
});
