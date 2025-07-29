// Privacy Policy Analyzer - Options Script
class OptionsController {
    constructor() {
        this.form = document.getElementById('settingsForm');
        this.statusMessage = document.getElementById('statusMessage');
        this.clearDataBtn = document.getElementById('clearDataBtn');

        this.initializeEventListeners();
        this.testConnection();
    }

    async testConnection() {
        try {
            const response = await this.sendMessage({ action: 'ping' });

            // Now load settings
            this.loadSettings();
        } catch (error) {
            console.error('Connection test failed:', error);
            this.showStatus('Cannot connect to background script', 'error');
            this.loadDefaultSettings();
        }
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.saveSettings(e));
        this.clearDataBtn.addEventListener('click', () => this.clearAllData());

        // Show/hide API key field based on provider selection
        const aiProviderSelect = document.getElementById('aiProvider');
        const apiKeyGroup = document.getElementById('apiKeyGroup');
        const testApiKeyBtn = document.getElementById('testApiKey');

        aiProviderSelect.addEventListener('change', () => {
            const selectedProvider = aiProviderSelect.value;
            if (selectedProvider === 'built-in') {
                apiKeyGroup.style.display = 'none';
            } else {
                apiKeyGroup.style.display = 'block';
            }
        });

        testApiKeyBtn.addEventListener('click', () => this.testApiKey());
    }

    async loadSettings() {
        try {
            const response = await this.sendMessage({ action: 'getSettings' });

            if (response && response.success) {
                this.populateForm(response.settings);
                this.showStatus('Settings loaded successfully', 'success');
            } else {
                console.error('Settings load failed:', response);
                this.showStatus('Failed to load settings', 'error');
                this.loadDefaultSettings(); // Fallback to defaults
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            this.showStatus(`Error loading settings: ${error.message || 'Unknown error'}`, 'error');
            this.loadDefaultSettings(); // Fallback to defaults
        }
    }

    loadDefaultSettings() {
        // Load default settings if communication fails
        const defaultSettings = {
            autoAnalyze: true,
            showPrompts: true,
            analysisDepth: 'standard',
            highlightSeverity: ['high', 'medium'],
            aiProvider: 'built-in',
            apiKey: ''
        };
        this.populateForm(defaultSettings);
        this.showStatus('Loaded default settings (communication error with background script)', 'error');
    }

    populateForm(settings) {

        try {
            // Toggle switches with fallback defaults
            const autoAnalyzeEl = document.getElementById('autoAnalyze');
            if (autoAnalyzeEl) {
                autoAnalyzeEl.checked = settings.autoAnalyze !== undefined ? settings.autoAnalyze : true;
            }

            const showPromptsEl = document.getElementById('showPrompts');
            if (showPromptsEl) {
                showPromptsEl.checked = settings.showPrompts !== undefined ? settings.showPrompts : true;
            }

            // Select dropdowns with fallback defaults
            const analysisDepthEl = document.getElementById('analysisDepth');
            if (analysisDepthEl) {
                analysisDepthEl.value = settings.analysisDepth || 'standard';
            }

            const aiProviderEl = document.getElementById('aiProvider');
            if (aiProviderEl) {
                aiProviderEl.value = settings.aiProvider || 'built-in';
                // Trigger change event to show/hide API key field
                aiProviderEl.dispatchEvent(new Event('change'));
            }

            const apiKeyEl = document.getElementById('apiKey');
            if (apiKeyEl) {
                apiKeyEl.value = settings.apiKey || '';
            }

            // Checkbox groups with fallback defaults
            const highlightSeverity = settings.highlightSeverity || ['high', 'medium'];
            const highlightCheckboxes = ['highlightHigh', 'highlightMedium', 'highlightLow'];

            highlightCheckboxes.forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox) {
                    const value = checkbox.value;
                    checkbox.checked = highlightSeverity.includes(value);
                }
            });

        } catch (error) {
            console.error('Error populating form:', error);
            this.showStatus('Error displaying settings', 'error');
        }
    }

    async saveSettings(e) {
        e.preventDefault();

        try {
            const settings = this.collectFormData();
            const response = await this.sendMessage({
                action: 'saveSettings',
                settings: settings
            });

            if (response.success) {
                this.showStatus('Settings saved successfully!', 'success');
            } else {
                this.showStatus('Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Error saving settings', 'error');
        }
    }

    collectFormData() {
        const highlightSeverity = [];
        const highlightCheckboxes = ['highlightHigh', 'highlightMedium', 'highlightLow'];

        highlightCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox.checked) {
                highlightSeverity.push(checkbox.value);
            }
        });

        return {
            autoAnalyze: document.getElementById('autoAnalyze').checked,
            showPrompts: document.getElementById('showPrompts').checked,
            analysisDepth: document.getElementById('analysisDepth').value,
            highlightSeverity: highlightSeverity,
            aiProvider: document.getElementById('aiProvider').value,
            apiKey: document.getElementById('apiKey').value
        };
    }

    async clearAllData() {
        if (!confirm('Are you sure you want to clear all analysis data? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await this.sendMessage({ action: 'clearAllData' });

            if (response.success) {
                this.showStatus(`Cleared ${response.clearedKeys} analysis records`, 'success');
            } else {
                this.showStatus('Failed to clear data', 'error');
            }
        } catch (error) {
            console.error('Error clearing data:', error);
            this.showStatus('Error clearing data', 'error');
        }
    }

    async testApiKey() {
        const apiKey = document.getElementById('apiKey').value;
        const aiProvider = document.getElementById('aiProvider').value;

        if (!apiKey) {
            this.showStatus('Please enter an API key to test', 'error');
            return;
        }

        this.showStatus('Testing API key...', 'info');

        try {
            const response = await this.sendMessage({
                action: 'testApiKey',
                apiKey: apiKey,
                provider: aiProvider
            });

            if (response.success) {
                this.showStatus('API key is valid!', 'success');
            } else {
                this.showStatus(`API key test failed: ${response.error}`, 'error');
            }
        } catch (error) {
            this.showStatus(`API key test failed: ${error.message}`, 'error');
        }
    }

    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message status-${type}`;
        this.statusMessage.style.display = 'block';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.statusMessage.style.display = 'none';
        }, 3000);
    }

    sendMessage(message) {
        return new Promise((resolve, reject) => {

            if (!chrome.runtime) {
                reject(new Error('Chrome runtime not available'));
                return;
            }

            chrome.runtime.sendMessage(message, (response) => {

                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message || 'Communication error'));
                } else if (!response) {
                    reject(new Error('No response from background script'));
                } else {
                    resolve(response);
                }
            });
        });
    }
}

// Initialize options when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OptionsController();
});
