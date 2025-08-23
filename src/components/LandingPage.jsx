import React, { useState, useEffect, useCallback } from 'react';
import { Globe, Download, Shield, Eye, ArrowRight, ArrowLeft, Link, CheckCircle, AlertCircle, Copy, Grid, Star, RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';
import {
  getLandingPageData,
  cloneUrl,
  selectLandingPageTemplate,
  getLandingPageTemplates,
  validateLandingPageStep
} from '../api/campaigns';

const LandingPage = ({ campaignId, onNext, onBack, savedData = {} }) => {
  console.log('=== PROPS REÇUES ===');
  console.log('campaignId:', campaignId);
  console.log('savedData:', savedData);

  // Reset default styles
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  // ========== FIX : Initialisation plus stricte des états ==========
  const [urlToClone, setUrlToClone] = useState(savedData.urlToClone || '');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneStatus, setCloneStatus] = useState(
    savedData.cloneStatus && savedData.cloneStatus !== 'pending' ? savedData.cloneStatus : null
  );
  const [previewUrl, setPreviewUrl] = useState(savedData.previewUrl || '');
  
  // ========== FIX : Initialisation plus stricte du selectedTemplate ==========
  const [selectedTemplate, setSelectedTemplate] = useState(
    savedData.selectedTemplate && savedData.activeTab === 'template' ? savedData.selectedTemplate : null
  );
  
  const [activeTab, setActiveTab] = useState(savedData.activeTab || 'clone');
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [error, setError] = useState(null);
  const [cloneProgress, setCloneProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [isSelectingTemplate, setIsSelectingTemplate] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  // ========== FIX : Nouveau state pour tracker les sélections manuelles ==========
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  console.log('=== ÉTATS INITIAUX ===');
  console.log('urlToClone initial:', urlToClone);
  console.log('cloneStatus initial:', cloneStatus);
  console.log('previewUrl initial:', previewUrl);
  console.log('selectedTemplate initial:', selectedTemplate);
  console.log('activeTab initial:', activeTab);
  console.log('isManualSelection initial:', isManualSelection);

  // Check backend connection
  const checkBackendConnection = useCallback(async () => {
    console.log('🔍 Vérification connexion backend...');
    try {
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Réponse health check:', response.status, response.ok);
      
      if (response.ok) {
        console.log('✅ Backend connecté');
        setConnectionStatus('connected');
        return true;
      } else {
        console.log('❌ Backend réponse non-ok:', response.status);
        setConnectionStatus('disconnected');
        return false;
      }
    } catch (error) {
      console.error('💥 Erreur connexion backend:', error);
      setConnectionStatus('disconnected');
      return false;
    }
  }, []);

  // Progress simulation for better UX
  useEffect(() => {
    let interval;
    if (isCloning || isSelectingTemplate) {
      setCloneProgress(0);
      interval = setInterval(() => {
        setCloneProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isCloning, isSelectingTemplate]);

  // Check connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, [checkBackendConnection]);

  // ========== FIX : Chargement des données avec gestion des états ==========
  useEffect(() => {
    const fetchData = async () => {
      console.log('=== CHARGEMENT DES DONNÉES ===');
      console.log('campaignId:', campaignId);
      
      if (!campaignId) {
        console.log('❌ campaignId manquant');
        setError("L'ID de la campagne est manquant.");
        setLoadingTemplates(false);
        return;
      }

      const isConnected = await checkBackendConnection();
      console.log('🔗 Backend connecté:', isConnected);
      
      if (!isConnected) {
        console.log('❌ Backend déconnecté');
        setError("Impossible de se connecter au serveur backend. Veuillez vérifier que le serveur est en cours d'exécution sur localhost:3000.");
        setLoadingTemplates(false);
        return;
      }

      try {
        console.log('📡 Appel getLandingPageTemplates...');
        const templatesResponse = await getLandingPageTemplates();
        console.log('📥 Réponse templates:', templatesResponse);
        
        if (templatesResponse.success) {
          setTemplates(templatesResponse.data);
        } else {
          console.log('❌ Erreur templates:', templatesResponse.message);
          setError(templatesResponse.message || "Erreur lors du chargement des templates.");
        }

        console.log('📡 Appel getLandingPageData...');
        const response = await getLandingPageData(campaignId);
        console.log('📥 Réponse getLandingPageData:', response);
        
        if (response.success && response.data && response.data.landingPageData) {
          const lpData = response.data.landingPageData;
          console.log('📋 Données landingPageData reçues:', lpData);
          
          if (lpData.originalUrl) {
            console.log('Setting urlToClone:', lpData.originalUrl);
            setUrlToClone(lpData.originalUrl);
          }
          
          if (lpData.status) {
            console.log('Setting cloneStatus:', lpData.status);
            if (lpData.status !== 'pending') {
              setCloneStatus(lpData.status);
            } else {
              console.log('⚠️ Statut pending ignoré pour éviter les erreurs d\'affichage');
              setCloneStatus(null);
            }
          }
          
          if (lpData.previewUrl) {
            console.log('Setting previewUrl:', lpData.previewUrl);
            setPreviewUrl(lpData.previewUrl);
          }
          
          // ========== FIX : Gestion plus stricte du selectedTemplate ==========
          if (lpData.selectedTemplate && lpData.type === 'template') {
            console.log('Setting selectedTemplate from backend:', lpData.selectedTemplate);
            setSelectedTemplate(lpData.selectedTemplate);
            // ========== FIX : Si les données viennent du backend, considérer comme sélection manuelle ==========
            setIsManualSelection(true);
          }
          
          if (lpData.type) {
            console.log('Setting activeTab:', lpData.type === 'template' ? 'template' : 'clone');
            setActiveTab(lpData.type === 'template' ? 'template' : 'clone');
          }
        } else {
          console.log('⚠️ Pas de données landingPageData:', response);
        }

        if (templatesResponse.success) {
          setError(null);
        }

      } catch (err) {
        console.error("💥 Erreur complète dans fetchData:", err);
        
        if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_RESET') {
          setError("Impossible de se connecter au serveur backend. Veuillez vérifier que le serveur est en cours d'exécution.");
        } else {
          setError("Impossible de charger les données. Veuillez réessayer.");
        }
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchData();
  }, [campaignId, checkBackendConnection]);

  const handleCloneUrl = async (isRetry = false) => {
    console.log('🚀 Début du clonage:', { campaignId, urlToClone });
    
    if (!urlToClone.trim() || !isValidUrl(urlToClone)) {
      setError("Veuillez entrer une URL valide.");
      return;
    }

    const isConnected = await checkBackendConnection();
    if (!isConnected) {
      setError("Impossible de se connecter au serveur backend. Veuillez vérifier que le serveur est en cours d'exécution sur localhost:3000.");
      return;
    }
    
    // ========== FIX : Marquer l'interaction utilisateur ==========
    setHasUserInteracted(true);
    
    setIsCloning(true);
    setCloneStatus(null);
    setSelectedTemplate(null);
    setError(null);
    setCloneProgress(0);
    setPreviewUrl('');
    setIsManualSelection(false);

    const baseTime = 30;
    const timeMultiplier = Math.min(retryCount + 1, 3);
    const currentEstimatedTime = baseTime * timeMultiplier;
    setEstimatedTime(currentEstimatedTime);

    try {
      console.log('📡 Appel API cloneUrl...');
      const response = await cloneUrl(campaignId, urlToClone);
      console.log('✅ Réponse API:', response);
      
      if (response.success) {
        setCloneProgress(100);
        setCloneStatus('success');
        setPreviewUrl(response.data.previewUrl);
        setRetryCount(0);
        console.log('🎉 Clonage réussi!');
      } else {
        console.log('❌ Échec API:', response.message);
        setCloneStatus('error');
        setError(response.message || "Échec du clonage de l'URL.");
      }
    } catch (err) {
      console.error("💥 Erreur complète:", err);
      setCloneStatus('error');

      if (err.code === 'ECONNABORTED' || err.name === 'TimeoutError') {
        setError(`Le clonage a pris trop de temps (timeout après ${Math.round(currentEstimatedTime)}s). Cette page est peut-être trop complexe ou le serveur est surchargé.`);
      } else if (err.code === 'ERR_NETWORK') {
        setError("Erreur réseau. Vérifiez votre connexion internet et que le serveur backend est accessible.");
      } else if (err.code === 'ERR_CONNECTION_RESET') {
        setError("La connexion au serveur a été interrompue. Cela peut être dû à:\n• Le serveur backend n'est pas démarré\n• La page à cloner est trop complexe\n• Un timeout côté serveur\n• Un problème de réseau");
      } else if (err.code === 'ERR_CONNECTION_REFUSED') {
        setError("Connexion refusée. Le serveur backend n'est pas accessible sur localhost:3000.");
      } else if (err.response?.status === 404) {
        setError("Endpoint non trouvé. Vérifiez l'URL de l'API ou la configuration du backend.");
      } else if (err.response?.status === 500) {
        setError("Erreur serveur interne. Vérifiez les logs du backend pour plus de détails.");
      } else if (err.response?.status === 503) {
        setError("Service temporairement indisponible. Le serveur est peut-être surchargé.");
      } else {
        setError("Une erreur inattendue est survenue lors du clonage. Vérifiez que le serveur backend est en cours d'exécution.");
      }

      if (!isRetry) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsCloning(false);
      setCloneProgress(0);
      setEstimatedTime(null);
    }
  };

  // ========== FIX : Fonction handleTemplateSelect mise à jour ==========
  const handleTemplateSelect = useCallback(async (templateId) => {
    if (isSelectingTemplate) return;
    console.log('🎯 Sélection MANUELLE du template avec ID:', templateId);

    const isConnected = await checkBackendConnection();
    if (!isConnected) {
      setError("Impossible de se connecter au serveur backend. Veuillez vérifier que le serveur est en cours d'exécution sur localhost:3000.");
      return;
    }

    // ========== FIX : Marquer l'interaction utilisateur ==========
    setHasUserInteracted(true);
    
    setUrlToClone('');
    setCloneStatus(null);
    setError(null);
    setIsSelectingTemplate(true);
    setCloneProgress(0);
    setPreviewUrl('');
    setSelectedTemplate(null);
    setIsManualSelection(false);

    try {
      const response = await selectLandingPageTemplate(campaignId, templateId);
      console.log('✅ Réponse de sélection:', response);

      if (response.success) {
        const selectedTemplateObject = templates.find(t => t.id === templateId);
        setSelectedTemplate(selectedTemplateObject);
        // ========== FIX : Marquer comme sélection manuelle ==========
        setIsManualSelection(true);
        setCloneStatus('success');
        const finalPreviewUrl = response.data?.previewUrl || selectedTemplateObject?.url;
        setPreviewUrl(finalPreviewUrl);
        setCloneProgress(100);
        console.log('🎉 Template sélectionné avec succès, preview URL:', finalPreviewUrl);
      } else {
        setCloneStatus('error');
        const errorMessage = response.message || "Échec de la sélection du template.";
        const detailedErrors = response.errors ? response.errors.map(err => `${err.param}: ${err.msg}`).join('\n') : '';
        setError(`${errorMessage}\n${detailedErrors}`);
        setSelectedTemplate(null);
        setIsManualSelection(false);
      }
    } catch (err) {
      console.error("💥 Erreur lors de la sélection du template:", err);
      setCloneStatus('error');
      setSelectedTemplate(null);
      setIsManualSelection(false);

      if (err.response && err.response.data && err.response.data.errors) {
        const detailedErrors = err.response.data.errors.map(errorItem => `${errorItem.param}: ${errorItem.msg}`).join('\n');
        setError(`Une erreur de validation est survenue:\n${detailedErrors}`);
        console.error("Détails des erreurs de validation du backend:", err.response.data.errors);
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_RESET') {
        setError("Impossible de se connecter au serveur backend. Veuillez vérifier que le serveur est en cours d'exécution.");
      } else {
        setError("Une erreur inattendue est survenue lors de la sélection du template.");
      }
    } finally {
      setIsSelectingTemplate(false);
      setCloneProgress(0);
    }
  }, [campaignId, isSelectingTemplate, checkBackendConnection, templates]);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canProceed = () => {
    if (activeTab === 'clone') {
      return cloneStatus === 'success' && previewUrl && !isCloning;
    } else if (activeTab === 'template') {
      return selectedTemplate && !isSelectingTemplate && (previewUrl || selectedTemplate?.url);
    }
    return false;
  };

  const handleNext = async () => {
    if (!canProceed()) {
      setError("Veuillez sélectionner une option avant de continuer.");
      return;
    }

    if (onNext) {
      try {
        const validationResponse = await validateLandingPageStep(campaignId);
        if (validationResponse.success) {
          const formData = {
            urlToClone,
            cloneStatus,
            previewUrl: previewUrl || (selectedTemplate ? selectedTemplate.url : ''),
            selectedTemplate,
            activeTab,
            isManualSelection,
            hasUserInteracted
          };
          onNext(null, formData);
        } else {
          setError(validationResponse.message || "La validation de l'étape a échoué.");
        }
      } catch (err) {
        console.error("Erreur lors de la validation:", err);
        setError("Une erreur inattendue est survenue lors de la validation.");
      }
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // ========== FIX : Fonction handleTabChange mise à jour ==========
  const handleTabChange = (newTab) => {
    console.log('🔄 Changement d\'onglet vers:', newTab);
    setActiveTab(newTab);
    setError(null);
    setCloneProgress(0);
    
    // ========== FIX : Reset des états lors du changement d'onglet ==========
    setIsManualSelection(false);
    
    if (newTab === 'clone') {
      setSelectedTemplate(null);
      setPreviewUrl('');
      setCloneStatus(null);
    } else if (newTab === 'template') {
      setUrlToClone('');
      setCloneStatus(null);
      setPreviewUrl('');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
      />
    ));
  };

  const renderProgressBar = () => {
    if (!isCloning && !isSelectingTemplate) return null;

    return (
      <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="animate-spin">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-white font-medium">
            {isCloning ? 'Clonage en cours...' : 'Sélection du template...'}
          </span>
          {estimatedTime && (
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>~{estimatedTime}s</span>
            </div>
          )}
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${cloneProgress}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {isCloning ? 'Les pages complexes peuvent prendre plus de temps à cloner...' : 'Configuration du template...'}
        </div>
      </div>
    );
  };

  const renderConnectionStatus = () => {
    if (connectionStatus === 'connected') return null;
    
    return (
      <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <WifiOff className="w-6 h-6 text-red-400" />
          <div>
            <p className="text-red-300 font-medium">Connexion au serveur impossible</p>
            <p className="text-red-200 text-sm mt-1">
              Vérifiez que le serveur backend est en cours d'exécution sur localhost:3000
            </p>
            <button
              onClick={checkBackendConnection}
              className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Vérifier la connexion
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getPreviewUrl = (template) => {
    if (selectedTemplate?.id === template.id && previewUrl) {
      return previewUrl;
    }
    return template.url;
  };

  if (loadingTemplates) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white text-xl">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <RefreshCw className="w-8 h-8 mx-auto" />
          </div>
          Chargement des pages d'atterrissage...
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto"
      style={{ margin: 0, padding: 0, top: 0, left: 0 }}
    >
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 w-full">
        <div className="w-full px-8 py-5">
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            <div className="flex items-center space-x-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                PhishWise
              </h1>
              <span className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-full text-base font-medium">
                Nouvelle Campagne
              </span>
           </div>
          </div>
        </div>
      </header>

      <div className="w-full px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Progress */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Création de Campagne</h2>
              <span className="text-lg text-gray-300">Étape 4 sur 7</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-3 rounded-full w-[57.14%] transition-all duration-500"></div>
            </div>

            <div className="grid grid-cols-7 gap-4 mt-4 text-sm text-gray-400">
              {['Paramètres', 'Cibles', 'Modèles', "Page d'atterrissage", 'SMTP', 'Formation', 'Finaliser'].map((step, i) => (
                <span
                  key={step}
                  className={`text-center font-medium ${i === 3 ? 'text-cyan-400' : ''}`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
 
          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-10">
            {/* Section Header */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="p-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Page d'Atterrissage</h3>
                <p className="text-lg text-gray-300">
                  Choisissez votre méthode de création de landing page
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mb-8 p-4 bg-orange-500/20 border border-orange-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-orange-300 font-medium text-lg mb-1">⚠️ Attention :</p>
                  <p className="text-orange-200 text-base leading-relaxed">
                    Choisissez une page clonée qui correspond au contenu de votre modèle d'email pour assurer la cohérence de la campagne.
                  </p>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            {renderConnectionStatus()}

            {/* Tabs */}
            <div className="mb-10">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTabChange('clone')}
                    className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all duration-200 ${
                      activeTab === 'clone'
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-white shadow-lg'
                        : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    Cloner une URL
                  </button>
                  <button
                    onClick={() => handleTabChange('template')}
                    className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all duration-200 ${
                      activeTab === 'template'
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-white shadow-lg'
                        : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Sélectionner un Template
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-4 p-4 mb-6 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300">
                <AlertCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-lg mb-2">Erreur</p>
                  <p className="text-base leading-relaxed whitespace-pre-line">{error}</p>
                  {retryCount > 0 && cloneStatus === 'error' && activeTab === 'clone' && retryCount < 3 && (
                    <button
                      onClick={() => handleCloneUrl(true)}
                      className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Réessayer ({retryCount}/3)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'clone' ? (
              <div className="space-y-10">
                <div>
                  <label className="block text-white text-xl font-medium mb-5">
                    URL à cloner *
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="url"
                        value={urlToClone}
                        onChange={(e) => setUrlToClone(e.target.value)}
                        placeholder="https://exemple.com/login"
                        className="w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                        disabled={isCloning || connectionStatus === 'disconnected'}
                      />
                      <Link className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <button
                      onClick={() => handleCloneUrl(false)}
                      disabled={!urlToClone.trim() || !isValidUrl(urlToClone) || isCloning || connectionStatus === 'disconnected'}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium text-base rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isCloning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Clonage...
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Cloner
                        </>
                      )}
                    </button>
                  </div>
                  {urlToClone && !isValidUrl(urlToClone) && (
                    <p className="text-red-400 text-base mt-4 flex items-center space-x-3">
                      <span className="text-xl">⚠️</span>
                      <span>Veuillez entrer une URL valide</span>
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                {renderProgressBar()}

                {/* Clone Status - Ne s'affiche que si il y a un statut valide */}
                {cloneStatus && !isCloning && (
                  <div className={`flex items-center gap-4 p-6 rounded-xl ${
                    cloneStatus === 'success'
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}>
                    {cloneStatus === 'success' ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium text-lg ${cloneStatus === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                        {cloneStatus === 'success' ? 'Clonage réussi !' : 'Erreur de clonage'}
                      </p>
                      {cloneStatus === 'success' && previewUrl && (
                        <p className="text-green-400 text-base mt-2">
                          Page disponible : <span className="font-mono">{previewUrl}</span>
                        </p>
                      )}
                    </div>
                    {cloneStatus === 'success' && previewUrl && (
                      <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/10 text-white text-base rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Aperçu
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Templates Section */
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      // MODIFICATION ICI: Passe template.id
                      onClick={() => !isSelectingTemplate && connectionStatus === 'connected' && handleTemplateSelect(template.id)}
                      className={`bg-white/5 rounded-xl border transition-all duration-200 hover:scale-105 ${
                        selectedTemplate?.id === template.id
                          ? 'border-cyan-400 shadow-lg shadow-cyan-400/20'
                          : 'border-white/20 hover:border-white/40'
                      } ${isSelectingTemplate || connectionStatus === 'disconnected' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl flex items-center justify-center">
                        <div className="text-gray-400 text-sm">Preview</div>
                        <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 text-white text-sm rounded-lg">
                          {template.category}
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <div className="absolute inset-0 bg-cyan-400/20 rounded-t-xl flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-cyan-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h4 className="text-white font-medium text-lg mb-3">{template.name}</h4>
                        <p className="text-gray-400 text-base mb-4">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {renderStars(template.popularity)}
                          </div>
                          <a
                            href={getPreviewUrl(template)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 text-base hover:text-cyan-300 transition-colors flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="w-4 h-4" />
                            Aperçu
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar for template selection */}
                {renderProgressBar()}

                {/* Template Selection Status */}
                {selectedTemplate && !isSelectingTemplate && (
                  <div className="flex items-center gap-4 p-6 rounded-xl bg-green-500/20 border border-green-500/30">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div className="flex-1">
                      <p className="font-medium text-lg text-green-300">Template sélectionné !</p>
                      <p className="text-green-400 text-base mt-1">
                        {selectedTemplate.name} - <span className="font-mono">{previewUrl || selectedTemplate.url}</span>
                      </p>
                    </div>
                    {(previewUrl || selectedTemplate.url) && (
                      <a
                        href={previewUrl || selectedTemplate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white/10 text-white text-base rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Aperçu
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Post-submission Configuration */}
            <div className="mt-16 pt-10 border-t border-white/10">
              <div className="flex items-center space-x-6 mb-8">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Actions Post-soumission</h4>
                  <p className="text-lg text-gray-300">Configuration automatique des actions après soumission</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-lg">1</span>
                      </div>
                      <h5 className="text-white font-medium text-lg">Collecte des données</h5>
                    </div>
                    <p className="text-gray-400 text-base">
                      Capture automatique des identifiants et informations saisies
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 font-bold text-lg">2</span>
                      </div>
                      <h5 className="text-white font-medium text-lg">Redirection</h5>
                    </div>
                    <p className="text-gray-400 text-base">
                      Redirection immédiate vers la page d'apprentissage
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Download className="w-5 h-5 text-purple-400" />
                      </div>
                      <h5 className="text-white font-medium text-lg">Téléchargement</h5>
                    </div>
                    <p className="text-gray-400 text-base">
                      Téléchargement automatique du fichier de test
                    </p>
                  </div>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-cyan-400 mt-1" />
                    <div>
                      <h5 className="text-cyan-300 font-medium text-lg mb-2">Configuration automatique</h5>
                      <p className="text-cyan-200 text-base leading-relaxed">
                        Ces actions sont configurées automatiquement lors du clonage ou de la sélection d'un template.
                        Aucune configuration supplémentaire n'est requise.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </div>
            {/* Navigation */}
            <div className="flex justify-between items-center mt-16 pt-10 border-t border-white/10">
              <button
                onClick={handleBack}
                className="flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 text-base font-medium hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 text-base font-medium"
              >
                <span>Suivant</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
