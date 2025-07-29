// Settings storage and retrieval
export class SettingsManager {
    static getSettings(sendResponse) {

        const defaultSettings = {
            autoAnalyze: true,
            showPrompts: true,
            analysisDepth: 'standard',
            highlightSeverity: ['high', 'medium'],
            aiProvider: 'built-in',
            apiKey: ''
        };

        chrome.storage.sync.get(defaultSettings, (settings) => {
            if (chrome.runtime.lastError) {
                console.error('Storage error:', chrome.runtime.lastError);
                const errorResponse = { success: false, error: chrome.runtime.lastError.message };
                sendResponse(errorResponse);
            } else {
                const successResponse = { success: true, settings };
                sendResponse(successResponse);
            }
        });
    }

    static saveSettings(settings, sendResponse) {

        chrome.storage.sync.set(settings, () => {
            if (chrome.runtime.lastError) {
                console.error('Storage save error:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ success: true });
            }
        });
    }
}
