// Message routing and handling
import { SettingsManager } from './settings-manager.js';
import { StorageManager } from './storage-manager.js';
import { ApiTester } from './api-tester.js';

export class MessageHandler {
    static handleMessage(message, sender, sendResponse) {

        switch (message.action) {
            case 'ping':
                sendResponse({ success: true, message: 'Background script is running' });
                return false; // Synchronous response

            case 'getCurrentTabId':
                sendResponse({ tabId: sender.tab?.id });
                return false; // Synchronous response

            case 'analyzeUrl':
                StorageManager.analyzeUrl(message.url, sendResponse);
                return true; // Asynchronous response

            case 'getSettings':
                SettingsManager.getSettings(sendResponse);
                return true; // Asynchronous response

            case 'saveSettings':
                SettingsManager.saveSettings(message.settings, sendResponse);
                return true; // Asynchronous response

            case 'clearAllData':
                StorageManager.clearAllAnalysisData(sendResponse);
                return true; // Asynchronous response

            case 'testApiKey':
                ApiTester.testApiKey(message.apiKey, message.provider, sendResponse);
                return true; // Asynchronous response

            default:
                sendResponse({ error: 'Unknown action' });
                return false; // Synchronous response
        }
    }
}
