// Privacy Policy Analyzer - Utils Module
// Utility functions and helpers

export class Utils {
    static async getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                aiProvider: 'built-in',
                apiKey: '',
                analysisDepth: 'standard',
                autoDetect: true,
                highlightSeverity: ['high', 'medium']
            }, (settings) => {
                resolve(settings);
            });
        });
    }

    static async getCurrentTabId() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout getting tab ID'));
            }, 5000);

            chrome.runtime.sendMessage({ action: 'getCurrentTabId' }, (response) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else if (response && response.tabId) {
                    resolve(response.tabId);
                } else {
                    reject(new Error('No tab ID received'));
                }
            });
        });
    }

    static extractContext(text, startIndex, matchLength) {
        const contextLength = 200;
        const start = Math.max(0, startIndex - contextLength);
        const end = Math.min(text.length, startIndex + matchLength + contextLength);
        return text.substring(start, end).trim();
    }

    static generateIssueId(title) {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    static filterIssuesBySeverity(issues, highlightSeverity) {
        if (!highlightSeverity || highlightSeverity.length === 0) {
            return issues.filter(issue => issue.severity === 'high' || issue.severity === 'medium');
        }
        return issues.filter(issue => highlightSeverity.includes(issue.severity));
    }

    static showProgress(message = 'Analyzing privacy policy...') {
        const progress = document.createElement('div');
        progress.className = 'privacy-analysis-progress';
        progress.innerHTML = `
            <div class="progress-content">
                <div class="progress-spinner"></div>
                <div class="progress-text">${message}</div>
            </div>
        `;
        document.body.appendChild(progress);
        return progress;
    }

    static hideProgress(progressElement) {
        if (progressElement && progressElement.parentNode) {
            progressElement.remove();
        }
    }
}
