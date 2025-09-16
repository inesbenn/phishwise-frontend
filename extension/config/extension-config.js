// config/extension-config.js - Configuration centrale de l'extension
const ExtensionConfig = {
    // Configuration API
    api: {
        baseUrl: 'http://localhost:3000/api',
        timeout: 10000,
        retries: 3
    },

    // Configuration du cache
    cache: {
        urlCacheDuration: 5 * 60 * 1000, // 5 minutes
        maxCacheSize: 1000,
        cleanupInterval: 10 * 60 * 1000 // 10 minutes
    },

    // Configuration de l'analyse
    analysis: {
        defaultLevel: 'basic',
        autoAnalyze: true,
        blockHighRisk: true,
        showWarningMediumRisk: true
    },

    // Configuration UI
    ui: {
        showNotifications: true,
        autoCloseAlerts: false,
        alertTimeout: 30000,
        theme: 'default'
    },

    // URLs à ignorer
    ignoredUrls: [
        'chrome://',
        'chrome-extension://',
        'moz-extension://',
        'about:',
        'data:',
        'javascript:',
        'file://',
        'localhost:3000' // Ne pas analyser notre propre backend
    ],

    // Patterns de domaines de confiance
    trustedDomains: [
        'google.com',
        'youtube.com',
        'github.com',
        'stackoverflow.com',
        'mozilla.org',
        'microsoft.com'
    ],

    // Configuration des seuils de risque
    riskThresholds: {
        low: { min: 0, max: 30, color: '#059669' },
        medium: { min: 31, max: 69, color: '#d97706' },
        high: { min: 70, max: 100, color: '#dc2626' }
    },

    // Messages d'alerte personnalisés
    alertMessages: {
        high: {
            title: 'DANGER !',
            subtitle: 'Site Web Malveillant Détecté',
            description: 'Cette URL a été identifiée comme potentiellement dangereuse.'
        },
        medium: {
            title: 'Attention',
            subtitle: 'Site Web Suspect',
            description: 'Cette URL présente des caractéristiques suspectes.'
        },
        blocked: {
            title: 'Accès Bloqué',
            subtitle: 'Site Malveillant Bloqué',
            description: 'L\'accès à ce site a été bloqué pour votre sécurité.'
        }
    },

    // Configuration des rapports
    reporting: {
        sendReports: true,
        includeUserAgent: true,
        includeGeoInfo: false, // Respecter la vie privée
        reportInterval: 1000 // Délai entre les rapports en ms
    },

    // Configuration du debugging
    debug: {
        enabled: true, // Désactiver en production
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        logToConsole: true,
        logToStorage: false
    }
};

// Fonction pour charger la configuration depuis le storage
async function loadConfig() {
    try {
        const stored = await chrome.storage.sync.get('extensionConfig');
        if (stored.extensionConfig) {
            return { ...ExtensionConfig, ...stored.extensionConfig };
        }
    } catch (error) {
        console.error('Erreur chargement config:', error);
    }
    return ExtensionConfig;
}

// Fonction pour sauvegarder la configuration
async function saveConfig(config) {
    try {
        await chrome.storage.sync.set({ 
            extensionConfig: config 
        });
        console.log('Configuration sauvegardée');
    } catch (error) {
        console.error('Erreur sauvegarde config:', error);
    }
}

// Fonction pour vérifier si une URL doit être ignorée
function shouldIgnoreUrl(url) {
    if (!url) return true;
    
    return ExtensionConfig.ignoredUrls.some(pattern => 
        url.toLowerCase().startsWith(pattern.toLowerCase())
    );
}

// Fonction pour vérifier si un domaine est de confiance
function isTrustedDomain(url) {
    try {
        const domain = new URL(url).hostname.toLowerCase();
        return ExtensionConfig.trustedDomains.some(trusted => 
            domain === trusted.toLowerCase() || 
            domain.endsWith('.' + trusted.toLowerCase())
        );
    } catch {
        return false;
    }
}

// Fonction pour obtenir la couleur selon le niveau de risque
function getRiskColor(riskLevel) {
    return ExtensionConfig.riskThresholds[riskLevel]?.color || '#6b7280';
}

// Fonction pour obtenir le message d'alerte
function getAlertMessage(type) {
    return ExtensionConfig.alertMessages[type] || ExtensionConfig.alertMessages.high;
}

// Logger avec niveaux
const Logger = {
    debug: (...args) => {
        if (ExtensionConfig.debug.enabled && 
            ['debug'].includes(ExtensionConfig.debug.logLevel)) {
            console.log('[DEBUG]', ...args);
        }
    },
    
    info: (...args) => {
        if (ExtensionConfig.debug.enabled && 
            ['debug', 'info'].includes(ExtensionConfig.debug.logLevel)) {
            console.log('[INFO]', ...args);
        }
    },
    
    warn: (...args) => {
        if (ExtensionConfig.debug.enabled && 
            ['debug', 'info', 'warn'].includes(ExtensionConfig.debug.logLevel)) {
            console.warn('[WARN]', ...args);
        }
    },
    
    error: (...args) => {
        if (ExtensionConfig.debug.enabled) {
            console.error('[ERROR]', ...args);
        }
    }
};

// Export pour utilisation dans les autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ExtensionConfig,
        loadConfig,
        saveConfig,
        shouldIgnoreUrl,
        isTrustedDomain,
        getRiskColor,
        getAlertMessage,
        Logger
    };
}