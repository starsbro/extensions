// Privacy Policy Analyzer - Text Extractor Module
// Text extraction and content parsing

export class TextExtractor {
    static extractPolicyText() {
        const clone = document.cloneNode(true);
        const elementsToRemove = clone.querySelectorAll('script, style, nav, header, footer, .sidebar, .advertisement');
        elementsToRemove.forEach(el => el.remove());

        const contentSelectors = [
            'main', '.content', '.policy-content', '.privacy-policy',
            '.terms-content', 'article', '.main-content'
        ];

        let content = '';
        for (const selector of contentSelectors) {
            const element = clone.querySelector(selector);
            if (element) {
                content = element.innerText;
                break;
            }
        }

        if (!content) {
            content = clone.body.innerText;
        }

        return content.trim();
    }

    static hasPrivacyContent() {
        try {
            const textContent = this.extractPolicyText();

            if (!textContent || textContent.length < 200) {
                return false;
            }

            // Check for privacy policy indicators
            const privacyIndicators = [
                'privacy policy', 'personal data', 'data collection', 'cookies',
                'personal information', 'data processing', 'data protection',
                'privacy notice', 'information we collect', 'how we use',
                'third party', 'data sharing', 'your rights', 'gdpr',
                'data subject rights', 'opt out', 'consent', 'legitimate interest'
            ];

            const lowerText = textContent.toLowerCase();
            let matchCount = 0;
            const foundIndicators = [];

            for (const indicator of privacyIndicators) {
                if (lowerText.includes(indicator)) {
                    matchCount++;
                    foundIndicators.push(indicator);
                }
            }


            // Require at least 3 privacy indicators for detection
            if (matchCount >= 3) {
                // Additional checks for more specific content
                const urlIndicators = window.location.href.toLowerCase();
                const titleIndicators = document.title.toLowerCase();


                // Boost score if URL or title suggests privacy policy
                if (urlIndicators.includes('privacy') || urlIndicators.includes('policy') ||
                    titleIndicators.includes('privacy') || titleIndicators.includes('policy')) {
                    matchCount += 2;
                }

                // Check for headings that suggest privacy policy
                const headings = document.querySelectorAll('h1, h2, h3');
                for (const heading of headings) {
                    const headingText = heading.textContent.toLowerCase();
                    if (headingText.includes('privacy') || headingText.includes('policy')) {
                        matchCount += 1;
                        break;
                    }
                }

                const result = matchCount >= 4;
                return result;
            }

            return false;
        } catch (error) {
            console.error('Privacy Policy Analyzer: Error detecting privacy content:', error);
            return false;
        }
    }
}
