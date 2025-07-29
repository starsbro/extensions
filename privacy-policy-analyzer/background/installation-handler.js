// Installation and update handling
export class InstallationHandler {
    static handleInstallation(details) {
        if (details.reason === 'install') {

            // Set default settings
            chrome.storage.sync.set({
                autoAnalyze: true,
                showPrompts: true,
                analysisDepth: 'standard',
                highlightSeverity: ['high', 'medium'],
                aiProvider: 'built-in',
                apiKey: ''
            });

            // Open welcome page
            chrome.tabs.create({
                url: chrome.runtime.getURL('welcome.html')
            });
        } else if (details.reason === 'update') {
            // Handle any migration logic here if needed
        }
    }
}
