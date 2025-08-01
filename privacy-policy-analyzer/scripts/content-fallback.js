// Privacy Policy Analyzer - ES6 Module Fallback Content Script
// Simplified fallback script when main module fails


// ============================================================================
// SIMPLE UTILS MODULE
// ============================================================================
export class SimpleUtils {
    static generateIssueId(title) {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    static showProgress(message = 'Analyzing...') {
        let progress = document.getElementById('simple-progress');
        if (progress) {
            progress.querySelector('.progress-text').textContent = message;
            return progress;
        }

        progress = document.createElement('div');
        progress.id = 'simple-progress';
        progress.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background: #2196F3 !important;
            color: white !important;
            padding: 12px 16px !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
            z-index: 10001 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            font-size: 14px !important;
            max-width: 300px !important;
        `;
        progress.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 16px; height: 16px; border: 2px solid #fff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <span class="progress-text">${message}</span>
            </div>
        `;

        // Add spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(progress);
        return progress;
    }

    static hideProgress() {
        const progress = document.getElementById('simple-progress');
        if (progress) {
            progress.remove();
        }
    }
}

// ============================================================================
// SIMPLE TEXT EXTRACTOR MODULE
// ============================================================================
export class SimpleTextExtractor {
    static extractPolicyText() {
        // Simple text extraction
        const contentSelectors = [
            'main', '.content', '.policy-content', '.privacy-policy',
            '.terms-content', 'article', '.main-content', 'body'
        ];

        let content = '';
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                content = element.innerText || element.textContent;
                if (content.length > 500) break;
            }
        }

        return content.trim();
    }

    static hasPrivacyContent() {

        const text = document.body.textContent || document.body.innerText || '';
        const lowerText = text.toLowerCase();

        // Privacy indicators
        const privacyIndicators = [
            'privacy policy', 'privacy notice', 'data protection',
            'personal data', 'personal information', 'cookies',
            'data processing', 'data collection', 'privacy statement',
            'information we collect', 'how we use', 'data sharing',
            'third party', 'your rights', 'gdpr', 'data subject rights',
            'opt out', 'consent', 'legitimate interest'
        ];

        let matchCount = 0;
        const foundIndicators = [];

        for (const indicator of privacyIndicators) {
            if (lowerText.includes(indicator)) {
                matchCount++;
                foundIndicators.push(indicator);
            }
        }

        // URL and title boost
        const url = window.location.href.toLowerCase();
        const title = document.title.toLowerCase();

        if (url.includes('privacy') || url.includes('policy') ||
            title.includes('privacy') || title.includes('policy')) {
            matchCount += 2;
            foundIndicators.push('URL/title match');
        }

        // Check for privacy-related headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (const heading of headings) {
            const headingText = heading.textContent.toLowerCase();
            if (headingText.includes('privacy') || headingText.includes('policy')) {
                matchCount++;
                foundIndicators.push('privacy heading');
                break;
            }
        }

        const hasContent = matchCount >= 3;

        return hasContent;
    }
}

// ============================================================================
// SIMPLE ANALYZER MODULE
// ============================================================================
export class SimpleAnalyzer {
    static analyze(textContent) {
        const issues = [];
        const patterns = [
            {
                id: 'third_party_sharing',
                pattern: /(share|sell|provide|disclose).{0,30}(third.party|partner|affiliate)/gi,
                severity: 'high',
                title: 'Third-Party Data Sharing',
                description: 'Your data may be shared with third parties'
            },
            {
                id: 'indefinite_retention',
                pattern: /(retain|keep|store).{0,20}(indefinitely|permanently|forever)/gi,
                severity: 'high',
                title: 'Indefinite Data Retention',
                description: 'Data may be kept indefinitely'
            },
            {
                id: 'tracking_behavior',
                pattern: /(track|monitor|collect).{0,30}(behavior|activity|browsing)/gi,
                severity: 'medium',
                title: 'Behavior Tracking',
                description: 'Your online behavior is tracked'
            },
            {
                id: 'policy_changes',
                pattern: /(change|modify|update).{0,20}(policy|terms).{0,30}(notice|discretion)/gi,
                severity: 'medium',
                title: 'Policy Change Rights',
                description: 'Policy can be changed without consent'
            }
        ];

        patterns.forEach(pattern => {
            const matches = textContent.match(pattern.pattern);
            if (matches) {
                matches.forEach((match, index) => {
                    const startIndex = textContent.indexOf(match);
                    issues.push({
                        ...pattern,
                        matchedText: match,
                        position: startIndex,
                        context: textContent.substring(Math.max(0, startIndex - 100), startIndex + match.length + 100)
                    });
                });
            }
        });

        return {
            issues,
            summary: `Simple analysis found ${issues.length} potential concerns.`,
            recommendations: issues.length > 0
                ? ['Review highlighted sections carefully', 'Consider privacy implications']
                : ['No major concerns detected in basic analysis']
        };
    }
}

// ============================================================================
// SIMPLE PRIVACY POLICY ANALYZER CLASS
// ============================================================================
export class SimplePrivacyPolicyAnalyzer {
    constructor() {
        this.analysisData = null;
        this.isAnalyzing = false;

        this.init();
    }

    init() {
        // Make analyzer available globally
        window.privacyAnalyzer = this;

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'startAnalysis') {
                this.startAnalysis();
                sendResponse({ success: true });
            } else if (message.action === 'showAnalysisPanel') {
                this.showAnalysisPanel();
                sendResponse({ success: true });
            } else if (message.action === 'checkContent') {
                const hasContent = SimpleTextExtractor.hasPrivacyContent();
                sendResponse({ hasPrivacyContent: hasContent });
            }
            return true;
        });

    }

    async startAnalysis() {
        if (this.isAnalyzing) {
            return;
        }

        this.isAnalyzing = true;
        const progress = SimpleUtils.showProgress('Analyzing privacy policy...');

        try {
            const textContent = SimpleTextExtractor.extractPolicyText();

            if (!textContent || textContent.length < 100) {
                throw new Error('Insufficient content for analysis');
            }

            const analysis = SimpleAnalyzer.analyze(textContent);
            this.analysisData = analysis;

            // Store results
            try {
                const response = await new Promise((resolve) => {
                    chrome.runtime.sendMessage({ action: 'getCurrentTabId' }, resolve);
                });

                if (response && response.tabId) {
                    const storageData = {};
                    storageData[`analysis_${response.tabId}`] = {
                        ...analysis,
                        status: 'completed',
                        timestamp: Date.now(),
                        url: window.location.href
                    };
                    await chrome.storage.local.set(storageData);
                }
            } catch (error) {
                console.error('Failed to store simple analysis results:', error);
            }

            SimpleUtils.hideProgress();

        } catch (error) {
            console.error('Simple analysis failed:', error);
            SimpleUtils.hideProgress();
        }

        this.isAnalyzing = false;
    }

    async showAnalysisPanel() {

        // Check if panel already exists
        const existingPanel = document.getElementById('simple-privacy-panel');
        if (existingPanel) {
            existingPanel.style.display = 'block';
            return true;
        }

        // Use cached data if available
        if (this.analysisData) {
            this.createSimplePanel(this.analysisData);
            return true;
        }

        // Try to load from storage
        try {
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ action: 'getCurrentTabId' }, resolve);
            });

            if (response && response.tabId) {
                const result = await chrome.storage.local.get([`analysis_${response.tabId}`]);
                const storedAnalysis = result[`analysis_${response.tabId}`];

                if (storedAnalysis && storedAnalysis.status === 'completed') {
                    this.analysisData = storedAnalysis;
                    this.createSimplePanel(storedAnalysis);
                    return true;
                }
            }
        } catch (error) {
            console.error('Error loading simple analysis data:', error);
        }

        alert('No analysis results found. Please run an analysis first.');
        return false;
    }

    createSimplePanel(analysisData) {
        const panel = document.createElement('div');
        panel.id = 'simple-privacy-panel';
        panel.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            width: 350px !important;
            max-height: 70vh !important;
            background: white !important;
            border: 2px solid #2196F3 !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
            z-index: 10000 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            font-size: 14px !important;
            overflow: hidden !important;
        `;

        panel.innerHTML = `
            <div style="background: #2196F3; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px;"> Privacy Analysis</h3>
                <button id="simple-close-btn" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px;">×</button>
            </div>
            <div style="padding: 16px; overflow-y: auto; max-height: calc(70vh - 60px);">
                <div style="margin-bottom: 16px;">
                    <p><strong>Issues Found:</strong> ${analysisData.issues.length}</p>
                    <p style="margin: 8px 0; color: #666;">${analysisData.summary}</p>
                </div>
                ${this.renderSimpleIssues(analysisData.issues)}
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
                    <h4 style="margin: 0 0 8px 0;">Recommendations:</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${analysisData.recommendations.map(rec => `<li style="margin: 4px 0;">${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Close button
        panel.querySelector('#simple-close-btn').addEventListener('click', () => {
            panel.remove();
            this.removeSimpleHighlights();
        });

        // Issue click handlers
        panel.querySelectorAll('.simple-issue').forEach((issueElement, index) => {
            issueElement.addEventListener('click', () => {
                this.highlightSimpleText(analysisData.issues[index]);
            });
        });

        document.body.appendChild(panel);
    }

    renderSimpleIssues(issues) {
        if (issues.length === 0) {
            return '<p style="color: green;">No major concerns detected!</p>';
        }

        return issues.map((issue, index) => `
            <div class="simple-issue" style="
                margin: 8px 0;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                border-left: 4px solid ${issue.severity === 'high' ? '#f44336' : '#ff9800'};
            " onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='white'">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #333;">${issue.title}</strong>
                    <span style="
                        background: ${issue.severity === 'high' ? '#f44336' : '#ff9800'};
                        color: white;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-size: 11px;
                        font-weight: bold;
                    ">${issue.severity.toUpperCase()}</span>
                </div>
                <p style="margin: 4px 0; color: #666; font-size: 13px;">${issue.description}</p>
                <div style="font-size: 12px; color: #888; margin-top: 4px;">
                    Click to highlight on page
                </div>
            </div>
        `).join('');
    }

    highlightSimpleText(issue) {
        this.removeSimpleHighlights();

        if (!issue.matchedText) return;

        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    if (node.parentElement.closest('#simple-privacy-panel, script, style')) {
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

        const searchText = issue.matchedText.toLowerCase();
        for (const textNode of textNodes) {
            const nodeText = textNode.textContent.toLowerCase();
            const index = nodeText.indexOf(searchText);
            if (index !== -1) {
                try {
                    const range = document.createRange();
                    range.setStart(textNode, index);
                    range.setEnd(textNode, index + issue.matchedText.length);

                    const highlight = document.createElement('span');
                    highlight.className = 'simple-privacy-highlight';
                    highlight.style.cssText = `
                        background-color: #ffeb3b !important;
                        padding: 2px 4px !important;
                        border-radius: 3px !important;
                        box-shadow: 0 0 8px rgba(255, 235, 59, 0.8) !important;
                    `;

                    range.surroundContents(highlight);
                    highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    break;
                } catch (error) {
                    const parent = textNode.parentElement;
                    if (parent) {
                        parent.style.backgroundColor = '#ffeb3b';
                        parent.classList.add('simple-privacy-highlight-parent');
                        parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        break;
                    }
                }
            }
        }
    }

    removeSimpleHighlights() {
        // Remove span highlights
        const highlights = document.querySelectorAll('.simple-privacy-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });

        // Remove parent highlights
        const parentHighlights = document.querySelectorAll('.simple-privacy-highlight-parent');
        parentHighlights.forEach(element => {
            element.style.backgroundColor = '';
            element.classList.remove('simple-privacy-highlight-parent');
        });
    }
}

// ============================================================================
// INITIALIZE THE SIMPLE ANALYZER
// ============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SimplePrivacyPolicyAnalyzer();
    });
} else {
    new SimplePrivacyPolicyAnalyzer();
}

