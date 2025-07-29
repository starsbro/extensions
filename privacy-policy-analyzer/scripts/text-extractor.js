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
}
