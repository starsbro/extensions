// Privacy Policy Analyzer - Main Background Script
import { InstallationHandler } from './background/installation-handler.js';
import { MessageHandler } from './background/message-handler.js';
import { StorageManager } from './background/storage-manager.js';

class BackgroundService {
    constructor() {
        this.initializeListeners();
    }

    initializeListeners() {

        // Handle extension installation and updates
        chrome.runtime.onInstalled.addListener((details) => {
            InstallationHandler.handleInstallation(details);
        });

        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            return MessageHandler.handleMessage(message, sender, sendResponse);
        });

        // Handle tab updates to clear old analysis data
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'loading') {
                StorageManager.clearAnalysisData(tabId);
            }
        });

        // Clean up storage when tabs are closed
        chrome.tabs.onRemoved.addListener((tabId) => {
            StorageManager.clearAnalysisData(tabId);
        });

    }
}

// Initialize the background service
new BackgroundService();
