// Privacy Policy Analyzer - ES6 Module Content Script
import { PrivacyPolicyAnalyzer } from './privacy-analyzer.js';


// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Privacy Policy Analyzer: DOMContentLoaded fired, initializing analyzer...');
        new PrivacyPolicyAnalyzer();
    });
} else {
    console.log('Privacy Policy Analyzer: DOM ready, initializing analyzer immediately...');
    new PrivacyPolicyAnalyzer();
}
