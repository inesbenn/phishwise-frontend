// install.js - Script d'installation pour l'extension
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Security Scanner Extension installée', details);

    // Configuration initiale
    if (details.reason === 'install') {
        await handleFirstInstall();
    } else if (details.reason === 'update') {
        await handleUpdate(details.previousVersion);
    }
});

async function handleFirstInstall() {
    try {
        // Configuration par défaut
        const defaultConfig = {
            firstInstall: true,
            installDate: new Date().toISOString(),
            version: chrome.runtime.getManifest().version,
            settings: {
                autoScan: true,
                blockDangerous: true,
                showNotifications: true,
                analysisLevel: 'basic'
            }
        };

        // Sauvegarder la configuration
        await chrome.storage.sync.set({ securityConfig: defaultConfig });

        // Créer les règles de blocage dynamiques
        await setupBlockingRules();

        // Afficher la page de bienvenue
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome.html'),
            active: true
        });

        console.log('Installation initiale terminée');
    } catch (error) {
        console.error('Erreur installation:', error);
    }
}

async function handleUpdate(previousVersion) {
    try {
        console.log(`Mise à jour de ${previousVersion} vers ${chrome.runtime.getManifest().version}`);
        
        // Migrer les données si nécessaire
        await migrateData(previousVersion);
        
        // Mettre à jour les règles de blocage
        await setupBlockingRules();

        console.log('Mise à jour terminée');
    } catch (error) {
        console.error('Erreur mise à jour:', error);
    }
}

async function setupBlockingRules() {
    try {
        // Supprimer les anciennes règles
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const ruleIdsToRemove = existingRules.map(rule => rule.id);

        if (ruleIdsToRemove.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ruleIdsToRemove
            });
        }

        // Ajouter les nouvelles règles de blocage
        const blockingRules = [
            {
                id: 1000,
                priority: 1,
                action: { type: 'block' },
                condition: {
                    urlFilter: '*phishing*',
                    resourceTypes: ['main_frame']
                }
            },
            {
                id: 1001,
                priority: 1,
                action: { type: 'block' },
                condition: {
                    urlFilter: '*malware*',
                    resourceTypes: ['main_frame']
                }
            }
        ];

        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: blockingRules
        });

        console.log('Règles de blocage configurées');
    } catch (error) {
        console.error('Erreur configuration règles:', error);
    }
}

async function migrateData(previousVersion) {
    // Implémenter la migration des données si nécessaire
    const config = await chrome.storage.sync.get('securityConfig');
    
    if (config.securityConfig) {
        config.securityConfig.version = chrome.runtime.getManifest().version;
        config.securityConfig.lastUpdate = new Date().toISOString();
        await chrome.storage.sync.set({ securityConfig: config.securityConfig });
    }
}