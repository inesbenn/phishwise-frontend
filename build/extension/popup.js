// extension/popup.js - Version simplifiée sans statistiques
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Popup Security Scanner chargé');

    // Éléments DOM
    const elements = {
        statusSection: document.getElementById('statusSection'),
        statusIcon: document.getElementById('statusIcon'),
        statusText: document.getElementById('statusText'),
        urlDisplay: document.getElementById('urlDisplay'),
        scanDetails: document.getElementById('scanDetails'),
        riskScore: document.getElementById('riskScore'),
        threatAlert: document.getElementById('threatAlert'),
        threatList: document.getElementById('threatList'),
        reanalyzeBtn: document.getElementById('reanalyzeBtn'),
        backBtn: document.getElementById('backBtn')
    };

    let currentUrl = '';
    let scanResult = null;

    // Initialiser
    await initializePopup();

    // Events
    elements.reanalyzeBtn.addEventListener('click', handleReanalyze);
    elements.backBtn.addEventListener('click', handleGoBack);

    async function initializePopup() {
        try {
            // Obtenir l'onglet actuel
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];

            if (!tab) {
                showError('Impossible d\'obtenir l\'onglet actuel');
                return;
            }

            currentUrl = tab.url;
            updateUrlDisplay(currentUrl);

            // Vérifier si URL système (à ignorer)
            if (isSystemUrl(currentUrl)) {
                setSystemUrlState();
                return;
            }

            // Vérifier si URL analysée
            const cachedResult = await chrome.runtime.sendMessage({
                action: 'getUrlAnalysis',
                url: currentUrl
            });

            if (cachedResult && !cachedResult.error) {
                displayAnalysisResult(cachedResult);
            } else {
                // Nouvelle analyse
                performAnalysis(currentUrl);
            }

        } catch (error) {
            console.error('Erreur initialisation:', error);
            showError('Erreur d\'initialisation');
        }
    }

    function isSystemUrl(url) {
        const systemUrls = [
            'chrome://',
            'chrome-extension://',
            'moz-extension://',
            'about:',
            'data:',
            'javascript:',
            'file://'
        ];
        
        return systemUrls.some(prefix => url.startsWith(prefix));
    }

    function setSystemUrlState() {
        elements.statusIcon.textContent = 'ℹ️';
        elements.statusText.textContent = 'Page Système';
        elements.statusText.style.color = '#6b7280';
        elements.statusSection.style.borderColor = '#6b7280';
        elements.reanalyzeBtn.style.display = 'none';
        elements.scanDetails.style.display = 'none';
    }

    async function performAnalysis(url) {
        setLoadingState();
        
        try {
            const result = await chrome.runtime.sendMessage({
                action: 'analyzeUrl',
                url: url
            });

            if (result && !result.error) {
                displayAnalysisResult(result);
            } else {
                setSafeState();
            }
        } catch (error) {
            console.error('Erreur analyse:', error);
            showError('Erreur lors de l\'analyse');
        }
    }

    function displayAnalysisResult(result) {
        scanResult = result;
        
        // Mettre à jour le statut selon le niveau de risque
        switch (result.riskLevel) {
            case 'high':
                setDangerState(result);
                break;
            case 'medium':
                setWarningState(result);
                break;
            default:
                setSafeState(result);
        }

        // Afficher les détails si nécessaire
        if (result.riskLevel !== 'low') {
            showScanDetails(result);
        }
    }

    function setLoadingState() {
        elements.statusIcon.textContent = '🔄';
        elements.statusText.textContent = 'Analyse en cours...';
        elements.statusSection.style.borderColor = '#6b7280';
        elements.statusText.style.color = '#6b7280';
        elements.reanalyzeBtn.disabled = true;
        elements.reanalyzeBtn.textContent = 'Analyse...';
        elements.scanDetails.style.display = 'none';
    }

    function setSafeState(result = null) {
        elements.statusIcon.textContent = '✅';
        elements.statusText.textContent = 'Site Sécurisé';
        updateStatusColors('#10b981'); // Vert
        elements.backBtn.style.display = 'none';
        resetAnalyzeButton();
        
        if (result) {
            elements.scanDetails.style.display = 'block';
            elements.riskScore.textContent = `${result.riskScore || 0}%`;
            elements.riskScore.style.color = '#10b981';
            elements.threatAlert.style.display = 'none';
        }
    }

    function setWarningState(result) {
        elements.statusIcon.textContent = '⚠️';
        elements.statusText.textContent = 'Site Suspect';
        updateStatusColors('#f59e0b'); // Orange
        elements.backBtn.style.display = 'none';
        resetAnalyzeButton();
    }

    function setDangerState(result) {
        elements.statusIcon.textContent = '🚨';
        elements.statusText.textContent = 'SITE DANGEREUX';
        updateStatusColors('#dc2626'); // Rouge
        elements.backBtn.style.display = 'inline-block';
        resetAnalyzeButton();
    }

    function updateStatusColors(color) {
        elements.statusSection.style.borderColor = color;
        elements.statusText.style.color = color;
    }

    function resetAnalyzeButton() {
        elements.reanalyzeBtn.disabled = false;
        elements.reanalyzeBtn.textContent = 'Réanalyser';
    }

    function showScanDetails(result) {
        if (!result) return;

        elements.scanDetails.style.display = 'block';
        elements.riskScore.textContent = `${result.riskScore || 0}%`;
        
        const riskColor = getRiskColor(result.riskLevel);
        elements.riskScore.style.color = riskColor;

        // Afficher menaces si niveau élevé ou moyen
        if ((result.riskLevel === 'high' || result.riskLevel === 'medium') && result.basicChecks) {
            const threats = result.basicChecks.filter(check => 
                check.severity === 'high' || check.severity === 'medium'
            );
            if (threats.length > 0) {
                showThreats(threats);
            }
        } else {
            elements.threatAlert.style.display = 'none';
        }
    }

    function showThreats(threats) {
        if (!threats || threats.length === 0) {
            elements.threatAlert.style.display = 'none';
            return;
        }

        elements.threatAlert.style.display = 'block';
        elements.threatList.innerHTML = '';

        // Afficher max 3 menaces principales
        threats.slice(0, 3).forEach(threat => {
            const item = document.createElement('div');
            item.className = 'threat-item';
            item.textContent = `• ${threat.message}`;
            elements.threatList.appendChild(item);
        });
    }

    function updateUrlDisplay(url) {
        try {
            if (isSystemUrl(url)) {
                elements.urlDisplay.textContent = 'Page système du navigateur';
                return;
            }
            
            const hostname = new URL(url).hostname;
            elements.urlDisplay.textContent = hostname;
        } catch {
            const truncated = url.length > 30 ? url.substring(0, 30) + '...' : url;
            elements.urlDisplay.textContent = truncated;
        }
    }

    function getRiskColor(riskLevel) {
        const colors = {
            high: '#dc2626',      // Rouge
            medium: '#f59e0b',    // Orange
            low: '#10b981'        // Vert
        };
        return colors[riskLevel] || '#6b7280';
    }

    function showError(message) {
        elements.statusIcon.textContent = '❌';
        elements.statusText.textContent = message;
        updateStatusColors('#dc2626');
        resetAnalyzeButton();
        elements.scanDetails.style.display = 'none';
    }

    async function handleReanalyze() {
        if (currentUrl && !isSystemUrl(currentUrl)) {
            await performAnalysis(currentUrl);
        }
    }

    function handleGoBack() {
        chrome.tabs.goBack();
    }
});

// Écouter les messages du service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'statusUpdate') {
        console.log('Status update:', message);
    }
});