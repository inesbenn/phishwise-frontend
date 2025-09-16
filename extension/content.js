// extension/content.js - Script de contenu injecté dans chaque page
console.log('🔍 URL Security Scanner - Content script chargé');

// Surveiller les changements d'URL (SPAs)
let currentUrl = window.location.href;

// Observer les changements dans l'historique
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function() {
    originalPushState.apply(history, arguments);
    handleUrlChange();
};

history.replaceState = function() {
    originalReplaceState.apply(history, arguments);
    handleUrlChange();
};

window.addEventListener('popstate', handleUrlChange);

// Gérer les changements d'URL
function handleUrlChange() {
    const newUrl = window.location.href;
    if (newUrl !== currentUrl) {
        currentUrl = newUrl;
        console.log('🔄 Changement d\'URL détecté (SPA):', newUrl);
        
        // Envoyer au service worker pour analyse
        chrome.runtime.sendMessage({
            action: 'analyzeUrl',
            url: newUrl
        }).catch(err => console.log('Erreur envoi message:', err));
    }
}

// Intercepter les clics sur les liens
document.addEventListener('click', function(event) {
    const link = event.target.closest('a[href]');
    if (link && link.href) {
        console.log('🔗 Clic sur lien détecté:', link.href);
        
        // Analyser le lien avant navigation
        chrome.runtime.sendMessage({
            action: 'analyzeUrl',
            url: link.href
        }).catch(err => console.log('Erreur analyse lien:', err));
    }
}, true);

// Analyser l'URL actuelle au chargement
if (chrome.runtime) {
    chrome.runtime.sendMessage({
        action: 'analyzeUrl',
        url: window.location.href
    }).catch(err => console.log('Erreur analyse initial:', err));
}

console.log('✅ Content script initialisé pour:', window.location.href);