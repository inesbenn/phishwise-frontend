// extension/background.js - Service Worker avec blocage renforcé
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
        
        // Vérifier si l'URL est déjà marquée comme dangereuse
        if (blockedUrls.has(details.url)) {
            console.log('🚨 URL BLOQUÉE (cache):', details.url);
            await redirectToBlockedPage(details.tabId, details.url);
            return;
        }

        // Analyse rapide
        const result = await analyzeUrl(details.url, details.tabId, true); // Mode prioritaire
        if (result && result.riskLevel === 'high') {
            // Bloquer immédiatement
            blockedUrls.add(details.url);
            await redirectToBlockedPage(details.tabId, details.url, result);
        }
    }
});

// Surveillance continue des onglets
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url && !isSystemUrl(tab.url)) {
        // Vérifier si l'URL est bloquée
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

// Rediriger vers la page de blocage
async function redirectToBlockedPage(tabId, blockedUrl, analysisResult = null) {
    try {
        // Créer l'URL de la page de blocage avec les paramètres
        const blockPageUrl = chrome.runtime.getURL('blocked.html') + 
            `?url=${encodeURIComponent(blockedUrl)}` +
            `&reason=${encodeURIComponent('malicious')}` +
            `&timestamp=${Date.now()}`;

        // Rediriger l'onglet vers la page de blocage
        await chrome.tabs.update(tabId, { url: blockPageUrl });

        // Changer l'icône en rouge
        await updateExtensionIcon(tabId, 'high');

        // Notification système
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
        // Fallback: injecter le script de blocage
        await injectBlockingScript(tabId, blockedUrl, analysisResult);
    }
}

// Script de blocage d'urgence (fallback)
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

// Fonction d'urgence pour bloquer la page
function emergencyBlock(url, analysisResult) {
    // Arrêter tout chargement
    window.stop();
    
    // Vider complètement la page
    document.open();
    document.write('');
    document.close();
    
    // Bloquer tous les événements
    document.addEventListener('click', e => e.stopImmediatePropagation(), true);
    document.addEventListener('keydown', e => e.stopImmediatePropagation(), true);
    document.addEventListener('scroll', e => e.preventDefault(), true);
    
    // Injecter la page de blocage
    document.documentElement.innerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>ACCÈS BLOQUÉ - Site Malveillant</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                overflow: hidden;
            }
            .container {
                background: rgba(255, 255, 255, 0.95);
                color: #1f2937;
                padding: 60px;
                border-radius: 24px;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
                text-align: center;
                max-width: 700px;
                margin: 20px;
                position: relative;
                animation: shake 0.5s ease-in-out;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            .danger-icon {
                font-size: 100px;
                margin-bottom: 30px;
                animation: pulse 1s ease-in-out infinite alternate;
                display: block;
            }
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.8; }
                100% { transform: scale(1.1); opacity: 1; }
            }
            .title {
                font-size: 48px;
                font-weight: 900;
                color: #dc2626;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 3px;
            }
            .subtitle {
                font-size: 28px;
                font-weight: 700;
                color: #991b1b;
                margin-bottom: 40px;
            }
            .url-box {
                background: #fee2e2;
                border: 3px solid #fecaca;
                border-radius: 16px;
                padding: 25px;
                margin: 30px 0;
                word-break: break-all;
            }
            .blocked-url {
                font-family: 'Courier New', monospace;
                font-size: 18px;
                font-weight: bold;
                color: #dc2626;
                background: white;
                padding: 15px;
                border-radius: 8px;
                border: 2px solid #dc2626;
            }
            .warning-text {
                font-size: 20px;
                margin: 30px 0;
                line-height: 1.6;
                color: #374151;
            }
            .actions {
                display: flex;
                gap: 20px;
                justify-content: center;
                margin-top: 40px;
                flex-wrap: wrap;
            }
            .btn {
                padding: 18px 36px;
                font-size: 18px;
                font-weight: 700;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                text-transform: uppercase;
                letter-spacing: 1px;
                min-width: 180px;
            }
            .btn-safe {
                background: linear-gradient(135deg, #059669, #047857);
                color: white;
            }
            .btn-safe:hover {
                background: linear-gradient(135deg, #047857, #065f46);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
            }
            .btn-close {
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
            }
            .btn-close:hover {
                background: linear-gradient(135deg, #4b5563, #374151);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(107, 114, 128, 0.4);
            }
            .details {
                background: #f3f4f6;
                border-radius: 12px;
                padding: 25px;
                margin: 30px 0;
                text-align: left;
            }
            .footer {
                margin-top: 40px;
                padding-top: 30px;
                border-top: 2px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="danger-icon">🛡️</div>
            <h1 class="title">ACCÈS BLOQUÉ</h1>
            <h2 class="subtitle">Site Web Malveillant Détecté</h2>
            
            <div class="url-box">
                <p style="font-weight: 600; margin-bottom: 15px; color: #dc2626;">URL BLOQUÉE :</p>
                <div class="blocked-url">${url}</div>
            </div>
            
            <p class="warning-text">
                <strong>⚠️ DANGER :</strong> Cette page a été identifiée comme malveillante et l'accès a été bloqué pour protéger votre sécurité et vos données personnelles.
            </p>
            
            <div class="details">
                <h3 style="color: #dc2626; margin-bottom: 15px; font-size: 18px;">🚨 Menaces détectées :</h3>
                <ul style="color: #374151; line-height: 1.8; padding-left: 25px;">
                    ${analysisResult.threats ? 
                        analysisResult.threats.map(threat => `<li>${threat}</li>`).join('') :
                        '<li>Site identifié comme malveillant</li>'
                    }
                </ul>
            </div>
            
            <div class="actions">
                <button class="btn btn-safe" onclick="goBack()">
                    🔒 RETOUR SÉCURISÉ
                </button>
                <button class="btn btn-close" onclick="closeTab()">
                    ❌ FERMER L'ONGLET
                </button>
            </div>
            
            <div class="footer">
                <p><strong>🛡️ Protégé par URL Security Scanner</strong></p>
                <p>Cette protection vous évite d'accéder à des contenus dangereux</p>
            </div>
        </div>
        
        <script>
            function goBack() {
                try {
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        window.location.href = 'about:blank';
                    }
                } catch (e) {
                    window.close();
                }
            }
            
            function closeTab() {
                try {
                    window.close();
                } catch (e) {
                    window.location.href = 'about:blank';
                }
            }
            
            // Empêcher la navigation
            window.addEventListener('beforeunload', function(e) {
                return 'Site bloqué pour votre sécurité';
            });
            
            // Désactiver le clic droit
            document.addEventListener('contextmenu', e => e.preventDefault());
            
            // Message de sécurité
            console.log('🛡️ Site bloqué par URL Security Scanner pour votre protection');
        </script>
    </body>
    </html>`;
    
    // Bloquer la navigation
    Object.defineProperty(window.location, 'href', {
        set: function(url) {
            console.log('Navigation bloquée vers:', url);
            return false;
        }
    });
}

// Analyse d'une URL avec mode prioritaire
async function analyzeUrl(url, tabId, priority = false) {
    try {
        if (isSystemUrl(url)) {
            return;
        }

        // Vérifier le cache
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

        // Appel à l'API backend
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

        // Envoyer le rapport au backend
        await sendUrlReport(url, result, tabId);

        // Si URL dangereuse, bloquer
        if (result.riskLevel === 'high') {
            blockedUrls.add(url);
            if (priority) {
                // En mode prioritaire, bloquer immédiatement
                await redirectToBlockedPage(tabId, url, result);
            } else {
                // Sinon, injecter le blocage
                await injectBlockingScript(tabId, url, result);
            }
        } else {
            // Mettre à jour l'icône selon le niveau de risque
            await updateExtensionIcon(tabId, result.riskLevel);
        }

        return result;

    } catch (error) {
        console.error('❌ Erreur analyse URL:', error);
        return null;
    }
}

// Envoyer le rapport au backend
async function sendUrlReport(url, analysisResult, tabId) {
    try {
        const report = {
            url: url,
            tabId: tabId,
            timestamp: new Date().toISOString(),
            riskLevel: analysisResult.riskLevel,
            riskScore: analysisResult.riskScore,
            blocked: analysisResult.riskLevel === 'high',
            userAgent: navigator.userAgent,
            analysisDetails: analysisResult
        };

        await fetch(`${API_BASE_URL}/url-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Extension-Version': '1.0.0'
            },
            body: JSON.stringify(report)
        });

        console.log('📊 Rapport envoyé au backend');
    } catch (error) {
        console.error('❌ Erreur envoi rapport:', error);
    }
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

        // Badge pour les sites à risque
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
            // Fonction pour débloquer manuellement une URL (pour tests)
            if (message.url) {
                blockedUrls.delete(message.url);
                sendResponse({ success: true, message: 'URL débloquée' });
            }
            break;

        case 'getBlockedUrls':
            sendResponse({ blockedUrls: Array.from(blockedUrls) });
            break;

        case 'reportThreat':
            sendUrlReport(message.url, message.analysisResult, sender.tab?.id)
                .then(() => sendResponse({ success: true }))
                .catch(error => sendResponse({ error: error.message }));
            return true;
    }
});

// Nettoyage du cache et des URLs bloquées périodique
setInterval(() => {
    const now = Date.now();
    
    // Nettoyer le cache
    for (const [key, value] of urlCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            urlCache.delete(key);
        }
    }
    
    // Optionnel: nettoyer les URLs bloquées anciennes (après 24h)
    // if (blockedUrls.size > 100) {
    //     blockedUrls.clear();
    // }
    
    console.log(`🧹 Cache nettoyé - URLs en cache: ${urlCache.size}, URLs bloquées: ${blockedUrls.size}`);
}, 10 * 60 * 1000); // Toutes les 10 minutes

// Logging initial
console.log('🛡️ Service Worker initialisé avec système de blocage renforcé');