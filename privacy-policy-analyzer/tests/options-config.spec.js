const { test, expect } = require('@playwright/test');
const path = require('path');

const extensionPath = path.join(__dirname, '..');

test.describe('Extension Options Page', () => {
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
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    test.afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    test('should open and configure options page', async () => {
        const optionsPage = await context.newPage();
        await optionsPage.goto(`chrome-extension://${extensionId}/options.html`);
        await optionsPage.waitForSelector('#aiProvider', { timeout: 10000 });

        // Check current AI provider setting
        const aiProvider = await optionsPage.locator('#aiProvider').inputValue();

        // Test changing provider to Gemini
        await optionsPage.locator('#aiProvider').selectOption('gemini');
        await optionsPage.waitForSelector('#apiKey', { state: 'visible', timeout: 5000 });

        expect(await optionsPage.locator('#apiKey').isVisible()).toBe(true);

        await optionsPage.close();
    });
});
