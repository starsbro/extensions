// Privacy Policy Analyzer - Main Privacy Analyzer Module
// Core analyzer class with UI and highlighting functionality

import { Utils } from './utils.js';
import { TextExtractor } from './text-extractor.js';
import { BuiltInAnalyzer } from './built-in-analyzer.js';
import { GeminiAnalyzer } from './gemini-analyzer.js';

export class PrivacyPolicyAnalyzer {
    constructor() {
        console.log('Privacy Policy Analyzer: PrivacyPolicyAnalyzer constructor called');
        this.analysisData = null;
        this.isAnalyzing = false;
        this.progressElement = null;

        this.init();
        console.log('Privacy Policy Analyzer: PrivacyPolicyAnalyzer initialized successfully');
    }

    init() {
        console.log('Privacy Policy Analyzer: init() method called');

        // Make analyzer available globally for popup communication
        window.privacyAnalyzer = this;
        console.log('Privacy Policy Analyzer: window.privacyAnalyzer set to:', this);
        console.log('Privacy Policy Analyzer: Verification - window.privacyAnalyzer exists:', typeof window.privacyAnalyzer !== 'undefined');

        // Register message listener multiple times to ensure it sticks
        this.registerMessageListener();

        // Also register after a delay in case something is interfering
        setTimeout(() => {
            this.registerMessageListener();
        }, 1000);

        // Report content detection status immediately
        this.reportContentStatus();
    }

    registerMessageListener() {
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            if (message.action === 'startAnalysis') {
                try {
                    await this.startAnalysis();
                    sendResponse({ success: true });
                } catch (error) {
                    console.error('Privacy Policy Analyzer: startAnalysis failed:', error);
                    sendResponse({ success: false, error: error.message });
                }
            } else if (message.action === 'showAnalysisPanel') {
                this.showAnalysisPanel();
                sendResponse({ success: true });
            } else if (message.action === 'checkContent') {
                const hasContent = TextExtractor.hasPrivacyContent();
                const response = { hasPrivacyContent: hasContent };
                sendResponse(response);
            }
            return true;
        }); console.log('Privacy Policy Analyzer: Message listener registered successfully');
    }

    reportContentStatus() {
        try {
            const hasContent = TextExtractor.hasPrivacyContent();
            chrome.runtime.sendMessage({
                action: 'contentDetected',
                hasPrivacyContent: hasContent,
                url: window.location.href
            }).catch(error => {
                // Background script might not be ready, ignore silently
            });
        } catch (error) {
            console.error('Error reporting content status:', error);
        }
    }

    async startAnalysis() {
        if (this.isAnalyzing) {
            return;
        }

        this.isAnalyzing = true;
        this.progressElement = Utils.showProgress();

        try {
            const textContent = TextExtractor.extractPolicyText();

            if (!textContent || textContent.length < 100) {
                throw new Error('Insufficient content for analysis');
            }

            const settings = await Utils.getSettings();

            // Analyze with the selected engine
            let analysis;

            if (settings.aiProvider === 'gemini' && settings.apiKey) {
                try {
                    analysis = await GeminiAnalyzer.analyze(textContent, settings);
                } catch (error) {
                    console.error('Gemini analysis failed, falling back to built-in:', error);
                    analysis = BuiltInAnalyzer.analyze(textContent);
                }
            } else {
                analysis = BuiltInAnalyzer.analyze(textContent);
            }

            // Store the complete unfiltered analysis for later use
            await this.storeResults(analysis);

            // Apply severity filter for display
            const filteredIssues = Utils.filterIssuesBySeverity(analysis.issues, settings.highlightSeverity);

            const filteredAnalysis = {
                ...analysis,
                issues: filteredIssues,
                summary: `Analyzed ${textContent.length} characters. Found ${filteredIssues.length} ${settings.highlightSeverity.length === 3 ? '' : settings.highlightSeverity.join('/')} severity concerns.`
            };

            // Store both in memory for immediate use
            this.analysisData = filteredAnalysis;
            Utils.hideProgress(this.progressElement);

        } catch (error) {
            console.error('Analysis failed:', error);
            await this.storeError(error);
            Utils.hideProgress(this.progressElement);
        }

        this.isAnalyzing = false;
    } async storeResults(analysis) {
        try {
            const tabId = await Utils.getCurrentTabId();
            await chrome.storage.local.set({
                [`analysis_${tabId}`]: {
                    ...analysis,
                    status: 'completed',
                    timestamp: Date.now(),
                    url: window.location.href
                }
            });
        } catch (error) {
            console.error('Failed to store results:', error);
        }
    }

    async storeError(error) {
        try {
            const tabId = await Utils.getCurrentTabId();
            await chrome.storage.local.set({
                [`analysis_${tabId}`]: {
                    status: 'error',
                    error: error.message,
                    timestamp: Date.now()
                }
            });
        } catch (tabError) {
            console.error('Failed to store error result:', tabError);
        }
    }

    async showAnalysisPanel() {
        // Check if panel already exists and just ensure it's visible
        const existingPanel = document.getElementById('privacy-analysis-panel');
        if (existingPanel) {
            this.ensurePanelVisible(existingPanel);
            return true;
        }

        // If we already have analysis data in memory, use it
        if (this.analysisData && this.analysisData.issues) {
            this.createAnalysisPanel(this.analysisData);
            return true;
        }

        // Try to load analysis data from storage
        try {
            const tabId = await Utils.getCurrentTabId();
            const result = await chrome.storage.local.get([`analysis_${tabId}`]);
            const storedAnalysis = result[`analysis_${tabId}`];

            if (storedAnalysis && storedAnalysis.status === 'completed' && storedAnalysis.issues) {
                // Apply current severity filter to stored data
                const settings = await Utils.getSettings();
                const filteredIssues = Utils.filterIssuesBySeverity(storedAnalysis.issues, settings.highlightSeverity);

                const filteredAnalysis = {
                    ...storedAnalysis,
                    issues: filteredIssues,
                    summary: `Analyzed ${storedAnalysis.issues.length} total issues. Showing ${filteredIssues.length} ${settings.highlightSeverity.join('/')} severity concerns.`
                };

                this.analysisData = filteredAnalysis;
                this.createAnalysisPanel(filteredAnalysis);
                return true;
            } else {
                alert('No analysis results found. Please run an analysis first by clicking "Analyze Page" in the extension popup.');
                return false;
            }
        } catch (error) {
            console.error('Error loading analysis data:', error);
            alert('Error loading analysis results. Please try running the analysis again.');
            return false;
        }
    }

    createAnalysisPanel(analysisData) {
        // Remove existing panel if any
        const existingPanel = document.getElementById('privacy-analysis-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // Always use floating panel for better visibility and interaction
        this.createFloatingPanel(analysisData);
    }

    createFloatingPanel(analysisData) {
        const panel = document.createElement('div');
        panel.id = 'privacy-analysis-panel';
        panel.className = 'privacy-analysis-panel floating';

        panel.innerHTML = `
            <div class="panel-header">
                <h3>Privacy Analysis Results</h3>
                <button class="panel-close-btn">×</button>
            </div>
            <div class="panel-content">
                <div class="analysis-summary">
                    <p><strong>Issues Found:</strong> ${analysisData.issues.length}</p>
                    <p><strong>Summary:</strong> ${analysisData.summary}</p>
                </div>
                <div class="issues-list">
                    ${this.renderIssuesList(analysisData.issues)}
                </div>
                <div class="recommendations">
                    <h4>Recommendations:</h4>
                    <ul>
                        ${analysisData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Set up event listeners
        this.setupPanelEventListeners(panel, analysisData);

        document.body.appendChild(panel);
    }

    setupPanelEventListeners(panel, analysisData) {
        // Close button
        const closeBtn = panel.querySelector('.panel-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                panel.remove();
                this.removeHighlights();
            });
        }

        // Make entire issue cards clickable
        panel.querySelectorAll('.issue-item').forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const issueIndex = parseInt(card.getAttribute('data-issue-index'));
                const issue = analysisData.issues[issueIndex];
                if (issue) {
                    // Directly highlight without showing panel (since panel is already visible)
                    this.highlightTextOnPage(issue);
                }
            });
        });
    }

    ensurePanelVisible(panel) {
        // Make sure the panel is visible
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
        }

        // For floating panels, ensure they're positioned correctly and visible
        if (panel.classList.contains('floating')) {
            // Reset any transforms or positioning issues
            panel.style.position = 'fixed';
            panel.style.top = '20px';
            panel.style.right = '20px';
            panel.style.zIndex = '10000';
            panel.style.visibility = 'visible';
            panel.style.opacity = '1';
        }

        // Add a visual indication that the panel is active
        panel.style.borderColor = '#2196F3';
        panel.style.boxShadow = '0 4px 20px rgba(33, 150, 243, 0.3)';

        // Remove the visual indication after 2 seconds
        setTimeout(() => {
            panel.style.borderColor = '#2196F3';
            panel.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        }, 2000);
    }

    renderIssuesList(issues) {
        if (issues.length === 0) {
            return '<p class="no-issues">✅ No major privacy concerns detected!</p>';
        }

        return issues.map((issue, index) => `
            <div class="issue-item ${issue.severity}" data-issue-index="${index}">
                <div class="issue-header">
                    <span class="severity-badge severity-${issue.severity}">${issue.severity.toUpperCase()}</span>
                    <span class="issue-title">${issue.title}</span>
                </div>
                <div class="issue-description">${issue.description}</div>
                <div class="issue-category"><strong>Category:</strong> ${issue.category}</div>
                <div class="issue-suggestion"><strong>Legal Suggestion:</strong> ${issue.legalSuggestion}</div>
                <div class="issue-context">
                    <strong>Found in text:</strong>
                    <div class="context-text">"${issue.matchedText}"</div>
                </div>
            </div>
        `).join('');
    }

    highlightTextOnPage(issue) {
        // Remove any existing highlights
        this.removeHighlights();

        if (!issue.matchedText) {
            return false;
        }

        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    // Skip script, style, and our analysis panel
                    if (node.parentElement.closest('script, style, #privacy-analysis-panel')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        // Find the text node containing our matched text
        const searchText = issue.matchedText.toLowerCase().trim();
        const normalizedSearchText = searchText.replace(/\s+/g, ' ');

        let foundNode = null;
        let foundIndex = -1;
        let bestMatch = null;
        let bestMatchScore = 0;

        // First try exact match
        for (const textNode of textNodes) {
            const nodeText = textNode.textContent.toLowerCase().trim().replace(/\s+/g, ' ');
            const index = nodeText.indexOf(normalizedSearchText);
            if (index !== -1) {
                foundNode = textNode;
                foundIndex = index;
                break;
            }
        }

        // If exact match failed, try partial matching with first few words
        if (!foundNode && normalizedSearchText.length > 20) {
            const firstWords = normalizedSearchText.split(' ').slice(0, 5).join(' ');

            for (const textNode of textNodes) {
                const nodeText = textNode.textContent.toLowerCase().trim().replace(/\s+/g, ' ');
                const index = nodeText.indexOf(firstWords);
                if (index !== -1) {
                    foundNode = textNode;
                    foundIndex = index;
                    break;
                }
            }
        }

        // If still no match, try fuzzy matching with individual words
        if (!foundNode) {
            const searchWords = normalizedSearchText.split(' ').filter(word => word.length > 3);

            for (const textNode of textNodes) {
                const nodeText = textNode.textContent.toLowerCase().trim().replace(/\s+/g, ' ');
                let matchCount = 0;

                for (const word of searchWords.slice(0, 5)) {
                    if (nodeText.includes(word)) {
                        matchCount++;
                    }
                }

                const matchScore = matchCount / Math.min(searchWords.length, 5);
                if (matchScore > bestMatchScore && matchScore >= 0.6) {
                    bestMatch = textNode;
                    bestMatchScore = matchScore;
                }
            }

            if (bestMatch) {
                foundNode = bestMatch;
                foundIndex = 0;
            }
        }

        if (foundNode) {
            try {
                const range = document.createRange();
                let matchLength = issue.matchedText.length;
                if (bestMatchScore > 0) {
                    matchLength = Math.min(foundNode.textContent.length - foundIndex, matchLength * 1.5);
                }

                const maxLength = foundNode.textContent.length - foundIndex;
                matchLength = Math.min(matchLength, maxLength);

                range.setStart(foundNode, foundIndex);
                range.setEnd(foundNode, foundIndex + matchLength);

                const highlight = document.createElement('span');
                highlight.className = 'privacy-highlight';
                highlight.style.cssText = `
                    background-color: #ffeb3b !important;
                    padding: 2px 4px !important;
                    border-radius: 3px !important;
                    box-shadow: 0 0 8px rgba(255, 235, 59, 0.6) !important;
                    position: relative !important;
                    animation: highlightPulse 2s ease-in-out !important;
                    z-index: 1000 !important;
                `;

                range.surroundContents(highlight);

                highlight.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });

                return true;

            } catch (error) {
                console.error('Error highlighting text:', error);

                try {
                    const parentElement = foundNode.parentElement;
                    if (parentElement) {
                        parentElement.style.cssText += `
                            background-color: #ffeb3b !important;
                            padding: 4px !important;
                            border-radius: 4px !important;
                            box-shadow: 0 0 8px rgba(255, 235, 59, 0.6) !important;
                            position: relative !important;
                            z-index: 1000 !important;
                        `;
                        parentElement.classList.add('privacy-highlight-parent');

                        parentElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });

                        return true;
                    }
                } catch (altError) {
                    console.error('Alternative highlighting also failed:', altError);
                }

                try {
                    foundNode.parentElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    return true;
                } catch (scrollError) {
                    console.error('Fallback scroll also failed:', scrollError);
                    return false;
                }
            }
        } else {
            console.warn('Could not find text to highlight on page');
            return false;
        }
    }

    removeHighlights() {
        // Remove span-based highlights
        const highlights = document.querySelectorAll('.privacy-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });

        // Remove parent element highlights
        const parentHighlights = document.querySelectorAll('.privacy-highlight-parent');
        parentHighlights.forEach(element => {
            element.classList.remove('privacy-highlight-parent');
            const style = element.style;
            style.backgroundColor = '';
            style.padding = '';
            style.borderRadius = '';
            style.boxShadow = '';
            style.position = '';
            style.zIndex = '';

            if (!style.cssText.trim()) {
                element.removeAttribute('style');
            }
        });
    }
}
