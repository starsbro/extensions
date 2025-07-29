// Privacy Policy Analyzer - Popup Script
class PopupController {
    constructor() {
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.viewResultsBtn = document.getElementById('viewResultsBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.status = document.getElementById('status');
        this.results = document.getElementById('results');
        this.loading = document.getElementById('loading');
        this.issueCount = document.getElementById('issueCount');

        this.initializeEventListeners();
        this.loadCurrentStatus();
    }

    // Filter issues based on user's severity preferences
    async filterIssuesBySeverity(issues) {
        try {
            const settings = await this.getSettings();
            const highlightSeverity = settings.highlightSeverity || ['high', 'medium'];

            if (!highlightSeverity || highlightSeverity.length === 0) {
                return issues.filter(issue => issue.severity === 'high' || issue.severity === 'medium');
            }

            return issues.filter(issue => highlightSeverity.includes(issue.severity));
        } catch (error) {
            console.error('Error filtering issues:', error);
            // Fallback to high and medium if settings can't be loaded
            return issues.filter(issue => issue.severity === 'high' || issue.severity === 'medium');
        }
    }

    // Get user settings
    async getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                highlightSeverity: ['high', 'medium']
            }, (settings) => {
                resolve(settings);
            });
        });
    }

    initializeEventListeners() {
        this.analyzeBtn.addEventListener('click', () => {
            this.analyzeCurrentPage();
        });
        this.viewResultsBtn.addEventListener('click', () => this.showAnalysisPanel());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
    }

    async loadCurrentStatus() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Check if current page can be analyzed
            if (this.isRestrictedUrl(tab.url)) {
                this.updateStatus('Navigate to a website to analyze privacy policies', 'scanning');
                this.analyzeBtn.disabled = true;
                return;
            }

            const result = await chrome.storage.local.get([`analysis_${tab.id}`]);
            const analysis = result[`analysis_${tab.id}`];

            if (analysis) {
                await this.displayResults(analysis);
            } else {
                this.updateStatus('Ready to analyze privacy policies', 'scanning');
            }

            // Enable analyze button for valid URLs
            this.analyzeBtn.disabled = false;

        } catch (error) {
            console.error('Error loading status:', error);
            this.updateStatus('Error loading status', 'error');
        }
    }

    async analyzeCurrentPage() {
        try {
            this.showLoading(true);
            this.analyzeBtn.disabled = true;
            this.updateStatus('Starting analysis...', 'scanning');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Check if the current URL is a restricted Chrome page
            if (this.isRestrictedUrl(tab.url)) {
                this.updateStatus('Cannot analyze Chrome internal pages', 'error');
                this.showLoading(false);
                this.analyzeBtn.disabled = false;
                return;
            }


            // Try to communicate with existing content script with retry logic
            let retryCount = 0;
            const maxRetries = 3;

            while (retryCount < maxRetries) {
                try {
                    await chrome.tabs.sendMessage(tab.id, { action: 'startAnalysis' });
                    break;
                } catch (error) {
                    retryCount++;

                    if (retryCount >= maxRetries) {
                        // If all retries failed, try injecting fallback content script
                        try {
                            await chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                files: ['content-fallback.js']
                            });

                            // Wait for fallback script to initialize
                            await new Promise(resolve => setTimeout(resolve, 1000));

                            // Try to start analysis with fallback
                            await chrome.tabs.sendMessage(tab.id, { action: 'startAnalysis' });
                            break;
                        } catch (fallbackError) {
                            throw new Error('Content script not available. Please refresh the page and try again.');
                        }
                    }

                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // Listen for analysis completion
            this.waitForAnalysisComplete(tab.id);

        } catch (error) {
            console.error('Analysis error:', error);
            console.error('Error details:', error.message);

            // Provide specific error messages based on the error type
            if (error.message && error.message.includes('chrome://')) {
                this.updateStatus('Cannot analyze Chrome internal pages. Please navigate to a website.', 'error');
            } else if (error.message && error.message.includes('extension://')) {
                this.updateStatus('Cannot analyze extension pages', 'error');
            } else if (error.message && error.message.includes('Cannot access')) {
                this.updateStatus('Cannot access this page. Try a different website.', 'error');
            } else if (error.message && error.message.includes('Content script not available')) {
                this.updateStatus('Please refresh the page and try again.', 'error');
            } else if (error.message && error.message.includes('Receiving end does not exist')) {
                this.updateStatus('Please refresh the page and try again.', 'error');
            } else {
                this.updateStatus('Analysis failed. Please try again.', 'error');
            }

            this.showLoading(false);
            this.analyzeBtn.disabled = false;
        }
    }

    waitForAnalysisComplete(tabId) {
        this.updateStatus('Analyzing page content...', 'scanning');

        const checkInterval = setInterval(async () => {
            try {
                const result = await chrome.storage.local.get([`analysis_${tabId}`]);
                const analysis = result[`analysis_${tabId}`];

                if (analysis && analysis.status === 'completed') {
                    clearInterval(checkInterval);
                    await this.displayResults(analysis);
                    this.showLoading(false);
                    this.analyzeBtn.disabled = false;
                } else if (analysis && analysis.status === 'error') {
                    clearInterval(checkInterval);
                    this.updateStatus('Analysis failed', 'error');
                    this.showLoading(false);
                    this.analyzeBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error checking analysis status:', error);
                clearInterval(checkInterval);
                this.updateStatus('Analysis failed', 'error');
                this.showLoading(false);
                this.analyzeBtn.disabled = false;
            }
        }, 1000);

        // Timeout after 30 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            if (this.loading.style.display !== 'none') {
                this.updateStatus('Analysis timeout', 'error');
                this.showLoading(false);
                this.analyzeBtn.disabled = false;
            }
        }, 30000);
    }

    async displayResults(analysis) {
        try {
            // Filter issues based on user's severity preferences
            const filteredIssues = await this.filterIssuesBySeverity(analysis.issues || []);
            const issueCount = filteredIssues.length;
            const totalIssues = analysis.issues ? analysis.issues.length : 0;

            if (issueCount > 0) {
                const severityInfo = issueCount !== totalIssues ? ` (${issueCount} of ${totalIssues} shown)` : '';
                this.updateStatus(`Found ${issueCount} potential privacy concerns${severityInfo}`, 'found');
                this.issueCount.textContent = `${issueCount} issues found`;
                this.results.style.display = 'block';
                this.viewResultsBtn.style.display = 'block';
            } else {
                this.updateStatus('No significant privacy concerns detected', 'safe');
                this.results.style.display = 'none';
                this.viewResultsBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error displaying results:', error);
            // Fallback to original behavior
            const issueCount = analysis.issues ? analysis.issues.length : 0;
            if (issueCount > 0) {
                this.updateStatus(`Found ${issueCount} potential privacy concerns`, 'found');
                this.issueCount.textContent = `${issueCount} issues found`;
                this.results.style.display = 'block';
                this.viewResultsBtn.style.display = 'block';
            } else {
                this.updateStatus('No significant privacy concerns detected', 'safe');
                this.results.style.display = 'none';
                this.viewResultsBtn.style.display = 'none';
            }
        }
    }

    async showAnalysisPanel() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // First try using message passing (more reliable)
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'showAnalysisPanel' });
                if (response && response.success) {
                    window.close();
                    return;
                }
            } catch (messageError) {
            }

            // Fallback to direct execution
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    if (window.privacyAnalyzer) {
                        window.privacyAnalyzer.showAnalysisPanel();
                    } else {
                        alert('Content script not loaded. Please refresh the page and try again.');
                    }
                }
            });
            window.close();
        } catch (error) {
            console.error('Error showing analysis panel:', error);
            alert('Error showing analysis results. Please refresh the page and try again.');
        }
    }

    openSettings() {
        chrome.runtime.openOptionsPage();
    }

    updateStatus(message, type) {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
    }

    showLoading(show) {
        this.loading.style.display = show ? 'block' : 'none';
        const controls = document.querySelector('.controls');
        controls.style.display = show ? 'none' : 'flex';
    }

    isRestrictedUrl(url) {
        // Check for Chrome internal pages and other restricted URLs
        if (!url) return true;

        const restrictedPrefixes = [
            'chrome://',
            'chrome-extension://',
            'chrome-search://',
            'chrome-devtools://',
            'moz-extension://',
            'edge://',
            'opera://',
            'brave://',
            'about:',
            'file://',
            'data:',
            'javascript:',
            'blob:',
            'ftp:',
            'view-source:'
        ];

        return restrictedPrefixes.some(prefix => url.startsWith(prefix));
    }

    isAnalyzableUrl(url) {
        // Check if URL is likely to be analyzable (basic web pages)
        try {
            const urlObj = new URL(url);

            // Must be http or https
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return false;
            }

            // Skip common non-content pages
            const skipDomains = [
                'localhost',
                '127.0.0.1',
                '0.0.0.0'
            ];

            // Allow localhost for development but warn
            if (skipDomains.some(domain => urlObj.hostname.includes(domain))) {
                return true; // Allow but may not have meaningful content
            }

            return true;
        } catch (error) {
            return false;
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});
