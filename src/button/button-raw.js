addBookmarkletPopupElement();
addScript();

// Helper functions
function addScript() {
    // If exist -> Not add script
    const url = '__BOOKMARKLET_URL__/lib.js?v=2.91';
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length; i--;) {
        if (scripts[i].src == url) return;
    }

    const bmScript = document.createElement('script');
    bmScript.src = url;
    document.body.appendChild(bmScript);
}

function addBookmarkletPopupElement() {
    // Check if exist -> Remove old and add the new one
    const tags = document.getElementsByTagName('wba-bookmarklet');
    for (let i = tags.length; i--;) {
        tags[i].remove();
    }

    let bmTag = document.createElement('wba-bookmarklet');
    bmTag.setAttribute('uuid', '__WBA_SHOP_ID__');
    document.body.appendChild(bmTag);
}
