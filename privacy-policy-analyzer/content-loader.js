// Content Script Loader
// This file loads the ES6 module-based content script

console.log('Privacy Policy Analyzer: Content loader starting...');

// Load the main content script as an ES6 module
(async () => {
    try {
        console.log('Privacy Policy Analyzer: Attempting to load main content script...');
        const module = await import(chrome.runtime.getURL("./scripts/content-main.js"));
        console.log('Privacy Policy Analyzer: Main content script loaded successfully');
    } catch (error) {
        console.error("Privacy Policy Analyzer: Error loading ES6 content module:", error);
        console.trace();

        // Fallback: try to load the fallback script
        try {
            console.log('Privacy Policy Analyzer: Attempting fallback content script...');
            const fallbackModule = await import(chrome.runtime.getURL("./scripts/content-fallback.js"));
            console.log('Privacy Policy Analyzer: Fallback content script loaded successfully');
        } catch (fallbackError) {
            console.error("Privacy Policy Analyzer: Error loading fallback content script:", fallbackError);
            console.trace();
        }
    }
})();
