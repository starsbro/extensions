// Welcome page functionality

document.addEventListener('DOMContentLoaded', () => {

    // Try It Now button - opens demo privacy policy page
    const tryItBtn = document.getElementById('tryItBtn');
    if (tryItBtn) {
        tryItBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Open a demo privacy policy page
            chrome.tabs.create({
                url: 'https://policies.google.com/privacy'
            });
        });
    }

    // Settings button - opens extension options page
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.runtime.openOptionsPage();
        });
    }
});
