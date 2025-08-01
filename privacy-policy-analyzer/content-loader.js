// Content Script Loader
// This file loads the ES6 module-based content script

// Load the main content script as an ES6 module
(async () => {
    try {
        const module = await import(chrome.runtime.getURL("./scripts/content-main.js"));
    } catch (error) {
        console.error("Privacy Policy Analyzer: Error loading ES6 content module:", error);
        console.trace();

        // Fallback: try to load the fallback script
        try {
            const fallbackModule = await import(chrome.runtime.getURL("./scripts/content-fallback.js"));
        } catch (fallbackError) {
            console.error("Privacy Policy Analyzer: Error loading fallback content script:", fallbackError);
            console.trace();
        }
    }
})();
