// Privacy Policy Analyzer - ES6 Module Content Script
// Main entry point that imports and initializes all modules

console.log('Privacy Policy Analyzer: content-main.js starting...');

import { PrivacyPolicyAnalyzer } from './privacy-analyzer.js';

console.log('Privacy Policy Analyzer: privacy-analyzer.js imported successfully');

// ============================================================================
// INITIALIZE THE ANALYZER
// ============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    console.log('Privacy Policy Analyzer: DOM loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Privacy Policy Analyzer: DOMContentLoaded fired, initializing analyzer...');
        new PrivacyPolicyAnalyzer();
    });
} else {
    console.log('Privacy Policy Analyzer: DOM ready, initializing analyzer immediately...');
    new PrivacyPolicyAnalyzer();
}

