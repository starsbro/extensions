// Privacy Policy Analyzer - ES6 Module Content Script
// Main entry point that imports and initializes all modules


import { PrivacyPolicyAnalyzer } from './privacy-analyzer.js';

// ============================================================================
// INITIALIZE THE ANALYZER
// ============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PrivacyPolicyAnalyzer();
    });
} else {
    new PrivacyPolicyAnalyzer();
}

