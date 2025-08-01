// Analysis data storage management
export class StorageManager {
    static clearAnalysisData(tabId) {
        chrome.storage.local.remove([`analysis_${tabId}`], () => {
            if (chrome.runtime.lastError) {
                console.error('Error clearing analysis data:', chrome.runtime.lastError);
            } else {
            }
        });
    }

    static clearAllAnalysisData(sendResponse) {

        chrome.storage.local.get(null, (data) => {
            if (chrome.runtime.lastError) {
                console.error('Storage get error:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }

            const analysisKeys = Object.keys(data).filter(key => key.startsWith('analysis_'));

            if (analysisKeys.length === 0) {
                sendResponse({ success: true, clearedKeys: 0 });
                return;
            }

            chrome.storage.local.remove(analysisKeys, () => {
                if (chrome.runtime.lastError) {
                    console.error('Storage remove error:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    sendResponse({ success: true, clearedKeys: analysisKeys.length });
                }
            });
        });
    }

    static analyzeUrl(url, sendResponse) {
        try {
            // This could be extended to analyze URLs without visiting them
            // For now, we'll just return basic URL analysis
            const analysis = {
                url: url,
                isPrivacyRelated: this.isPrivacyRelatedUrl(url),
                timestamp: Date.now()
            };

            sendResponse({ success: true, analysis });
        } catch (error) {
            console.error('URL analysis error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    static isPrivacyRelatedUrl(url) {
        const privacyIndicators = [
            'privacy',
            'policy',
            'terms',
            'legal',
            'cookies',
            'data-protection'
        ];

        const lowercaseUrl = url.toLowerCase();
        return privacyIndicators.some(indicator => lowercaseUrl.includes(indicator));
    }
}
