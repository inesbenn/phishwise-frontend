// extension/background.js - Service Worker corrigé pour utiliser le système Incident
const API_BASE_URL = 'http://localhost:3000/api';

// Cache des URLs analysées et bloquées
const urlCache = new Map();
const blockedUrls = new Set();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

console.log('🚀 URL Security Scanner - Service Worker démarré avec blocage renforcé');

// Bloquer les URLs dangereuses AVANT la navigation
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (details.frameId === 0 && !isSystemUrl(details.url)) {
        console.log('🔍 Navigation interceptée (avant):', details.url); 
         
        if (blockedUrls.has(details.url)) {
            console.log('🚨 URL BLOQUÉE (cache):', details.url);
            await redirectToBlockedPage(details.tabId, details.url);
            return;
        }

        const result = await analyzeUrl(details.url, details.tabId, true);
        if (result && result.riskLevel === 'high') { 
            blockedUrls.add(details.url);
            await redirectToBlockedPage(details.tabId, details.url, result);
        }
    }
});

// Surveillance continue des onglets
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url && !isSystemUrl(tab.url)) { 
        if (blockedUrls.has(tab.url)) {
            console.log('🚨 Tentative d\'accès à URL bloquée:', tab.url);
            await redirectToBlockedPage(tabId, tab.url);
            return;
        }
    }
    
    if (changeInfo.status === 'complete' && tab.url && !isSystemUrl(tab.url)) {
        console.log('🔍 Page chargée, analyse post-navigation:', tab.url);
        await analyzeUrl(tab.url, tabId);
    }
}); 

// Analyse d'une URL avec mode prioritaire
async function analyzeUrl(url, tabId, priority = false) {
    try {
        if (isSystemUrl(url)) {
            return;
        } 
 
        const cacheKey = url;
        const cached = urlCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION && !priority) {
            console.log('📋 Résultat en cache pour:', url);
            if (cached.result.riskLevel === 'high') {
                blockedUrls.add(url);
                await redirectToBlockedPage(tabId, url, cached.result);
            }
            return cached.result;
        }

        console.log(`🔍 Analyse URL${priority ? ' (PRIORITAIRE)' : ''}:`, url);

        // Appel à l'API d'analyse (endpoint du scanner)
        const response = await fetch(`${API_BASE_URL}/check-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Extension-Version': '1.0.0'
            },
            body: JSON.stringify({
                url: url,
                analysisLevel: priority ? 'advanced' : 'basic'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Mettre en cache le résultat
        urlCache.set(cacheKey, {
            result: result,
            timestamp: Date.now()
        });

        console.log(`✅ Analyse terminée - Risque: ${result.riskLevel} (${result.riskScore}%)`);

        // CORRIGÉ : Envoyer le rapport au système Incident
        await sendIncidentReport(url, result, tabId); 
 
        if (result.riskLevel === 'high') {
            blockedUrls.add(url);
            if (priority) { 
                await redirectToBlockedPage(tabId, url, result);
            } else { 
                await injectBlockingScript(tabId, url, result);
            }
        } else { 
            await updateExtensionIcon(tabId, result.riskLevel);
        }

        return result;

    } catch (error) {
        console.error('❌ Erreur analyse URL:', error);
        return null;
    }
}

// CORRIGÉ : Envoyer le rapport au système Incident
async function sendIncidentReport(url, analysisResult, tabId) {
    try {
        // Transformer les données pour le modèle Incident
        const incidentData = { 
            url: url, 
            riskLevel: analysisResult.riskLevel,
            riskScore: analysisResult.riskScore,
            blocked: analysisResult.riskLevel === 'high',
            userAction: analysisResult.riskLevel === 'high' ? 'blocked' : 'warned',
            
            // Déterminer le type d'incident
            incidentType: determineIncidentType(url, analysisResult),
            
            // Transformer les basicChecks en threats
            threats: extractThreats(analysisResult),
            
            analysisDetails: {
                analysisLevel: analysisResult.analysisLevel || 'basic',
                basicChecks: analysisResult.basicChecks || [],
                scanDuration: analysisResult.scanDuration || 0
            },
            
            clientInfo: {
                tabId: tabId,
                extensionVersion: '1.0.0',
                userAgent: navigator.userAgent
            }
        };

        // ENDPOINT CORRECT
        const response = await fetch(`${API_BASE_URL}/incidents/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Extension-Version': '1.0.0'
            },
            body: JSON.stringify(incidentData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('📊 Incident enregistré avec succès:', result);
            return result;
        } else {
            const errorText = await response.text();
            console.error('❌ Erreur envoi incident:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

    } catch (error) {
        console.error('❌ Erreur réseau envoi incident:', error);
        throw error;
    }
}

// Fonction utilitaire pour déterminer le type d'incident
function determineIncidentType(url, analysisResult) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('phishing') || urlLower.includes('phish')) {
        return 'phishing';
    }
    if (urlLower.includes('malware') || urlLower.includes('virus')) {
        return 'malware';
    }
    if (urlLower.includes('scam') || urlLower.includes('fake')) {
        return 'scam';
    }
    
    try {
        const hostname = new URL(url).hostname;
        if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
            return 'ip_address_access';
        }
        
        if (hostname.match(/\.(tk|ml|ga|cf)$/)) {
            return 'suspicious_domain';
        }
    } catch (e) {
        // URL malformée
    }
    
    // Analyser les résultats d'analyse
    if (analysisResult && analysisResult.basicChecks) {
        for (const check of analysisResult.basicChecks) {
            if (check.type === 'phishing_pattern') return 'phishing';
            if (check.type === 'malware') return 'malware';
            if (check.type === 'suspicious_domain') return 'suspicious_domain';
            if (check.type === 'ip_address') return 'ip_address_access';
        }
    }
    
    return 'other';
}

// Fonction utilitaire pour extraire les menaces
function extractThreats(analysisResult) {
    const threats = [];
    
    if (analysisResult && analysisResult.basicChecks) {
        analysisResult.basicChecks.forEach(check => {
            threats.push({
                type: check.type || 'unknown',
                severity: check.severity || 'medium',
                message: check.message || 'Menace détectée',
                details: check.details || {}
            });
        });
    }
    
    return threats;
}

// Rediriger vers la page de blocage
async function redirectToBlockedPage(tabId, blockedUrl, analysisResult = null) {
    try {
        const blockPageUrl = chrome.runtime.getURL('blocked.html') + 
            `?url=${encodeURIComponent(blockedUrl)}` +
            `&reason=${encodeURIComponent('malicious')}` +
            `&timestamp=${Date.now()}`;

        await chrome.tabs.update(tabId, { url: blockPageUrl });
        await updateExtensionIcon(tabId, 'high');

        if (chrome.notifications) {
            await chrome.notifications.create(`blocked-${Date.now()}`, {
                type: 'basic',
                iconUrl: 'icons/icon-48.png',
                title: 'ACCÈS BLOQUÉ',
                message: `Site malveillant bloqué: ${new URL(blockedUrl).hostname}`,
                priority: 2
            });
        }

        console.log('🛡️ Navigation bloquée et redirigée vers page sécurisée');
    } catch (error) {
        console.error('❌ Erreur redirection blocage:', error);
        await injectBlockingScript(tabId, blockedUrl, analysisResult);
    }
}

// Script de blocage d'urgence (code inchangé)
async function injectBlockingScript(tabId, url, analysisResult) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: emergencyBlock,
            args: [url, analysisResult || { threats: ['Site malveillant détecté'] }]
        });
    } catch (error) {
        console.error('❌ Erreur injection script blocage:', error);
    }
}

// Fonction d'urgence pour bloquer la page (code inchangé)
function emergencyBlock(url, analysisResult) {
    // ... (code identique à votre version originale)
    window.stop();
    document.open();
    document.write('');
    document.close();
    
    // ... reste du code de blocage d'urgence
}

// Mettre à jour l'icône de l'extension
async function updateExtensionIcon(tabId, riskLevel) {
    const iconPath = {
        'low': 'icons/icon-',
        'medium': 'icons/icon-', 
        'high': 'icons/icon-'
    };

    const basePath = iconPath[riskLevel] || iconPath['low'];

    try {
        await chrome.action.setIcon({
            tabId: tabId,
            path: {
                16: `${basePath}16.png`,
                32: `${basePath}32.png`,
                48: `${basePath}48.png`,
                128: `${basePath}128.png`
            }
        });
 
        if (riskLevel === 'high') {
            await chrome.action.setBadgeText({
                tabId: tabId,
                text: '!'
            });
            await chrome.action.setBadgeBackgroundColor({
                tabId: tabId,
                color: '#dc2626'
            });
        } else {
            await chrome.action.setBadgeText({
                tabId: tabId,
                text: ''
            });
        }
    } catch (error) {
        console.error('Erreur mise à jour icône:', error);
    }
}

// Vérifier si c'est une URL système à ignorer
function isSystemUrl(url) {
    const systemUrls = [
        'chrome://',
        'chrome-extension://',
        'moz-extension://',
        'about:',
        'data:',
        'javascript:',
        'file://',
        'localhost:3000'
    ];
    
    return systemUrls.some(prefix => url.startsWith(prefix));
}

// Messages des content scripts et popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Message reçu:', message);

    switch (message.action) {
        case 'analyzeUrl':
            analyzeUrl(message.url, sender.tab?.id)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ error: error.message }));
            return true;

        case 'getUrlAnalysis':
            const cached = urlCache.get(message.url);
            sendResponse(cached ? cached.result : null);
            break;
 
        case 'unblockUrl': 
            if (message.url) {
                blockedUrls.delete(message.url);
                sendResponse({ success: true, message: 'URL débloquée' });
            }
            break;

        case 'getBlockedUrls':
            sendResponse({ blockedUrls: Array.from(blockedUrls) });
            break;

        case 'reportThreat':
            sendIncidentReport(message.url, message.analysisResult, sender.tab?.id)
                .then(() => sendResponse({ success: true }))
                .catch(error => sendResponse({ error: error.message }));
            return true;
    }
});

// Nettoyage du cache périodique
setInterval(() => {
    const now = Date.now();
     
    for (const [key, value] of urlCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            urlCache.delete(key);
        }
    }
     
    console.log(`🧹 Cache nettoyé - URLs en cache: ${urlCache.size}, URLs bloquées: ${blockedUrls.size}`);
}, 10 * 60 * 1000);
 
console.log('🛡️ Service Worker initialisé avec système de blocage renforcé');