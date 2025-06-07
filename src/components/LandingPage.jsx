import React, { useState, useEffect } from 'react';
import { Globe, Download, Shield, Eye, ArrowRight, ArrowLeft, Link, CheckCircle, AlertCircle, Copy, Grid, Star } from 'lucide-react';

const LandingPage = ({ campaignId, onNext, onBack, savedData = {} }) => {
  // Reset default styles
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  // Initialiser les états avec les données sauvegardées
  const [urlToClone, setUrlToClone] = useState(savedData.urlToClone || '');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneStatus, setCloneStatus] = useState(savedData.cloneStatus || null);
  const [previewUrl, setPreviewUrl] = useState(savedData.previewUrl || '');
  const [selectedTemplate, setSelectedTemplate] = useState(savedData.selectedTemplate || null);
  const [activeTab, setActiveTab] = useState(savedData.activeTab || 'clone');
  
  // Templates déjà clonés
  const templates = [
    {
      id: 1,
      name: "Page de connexion Office 365",
      url: "https://clone.phishwise.com/office365-login",
      thumbnail: "https://via.placeholder.com/300x200/1e40af/ffffff?text=Office+365",
      category: "Microsoft",
      popularity: 5,
      description: "Page de connexion Microsoft Office 365 classique"
    },
    {
      id: 2,
      name: "Gmail Login",
      url: "https://clone.phishwise.com/gmail-login",
      thumbnail: "https://via.placeholder.com/300x200/dc2626/ffffff?text=Gmail",
      category: "Google",
      popularity: 4,
      description: "Page de connexion Gmail avec authentification"
    },
    {
      id: 3,
      name: "Facebook Login",
      url: "https://clone.phishwise.com/facebook-login",
      thumbnail: "https://via.placeholder.com/300x200/1877f2/ffffff?text=Facebook",
      category: "Social Media",
      popularity: 3,
      description: "Page de connexion Facebook mobile et desktop"
    },
    {
      id: 4,
      name: "LinkedIn Login",
      url: "https://clone.phishwise.com/linkedin-login",
      thumbnail: "https://via.placeholder.com/300x200/0077b5/ffffff?text=LinkedIn",
      category: "Professional",
      popularity: 4,
      description: "Page de connexion LinkedIn professionnelle"
    },
    {
      id: 5,
      name: "Banking Portal",
      url: "https://clone.phishwise.com/bank-portal",
      thumbnail: "https://via.placeholder.com/300x200/059669/ffffff?text=Banking",
      category: "Finance",
      popularity: 2,
      description: "Portail bancaire générique avec authentification forte"
    },
    {
      id: 6,
      name: "Corporate VPN",
      url: "https://clone.phishwise.com/corporate-vpn",
      thumbnail: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=VPN",
      category: "Enterprise",
      popularity: 3,
      description: "Page de connexion VPN d'entreprise"
    }
  ];

  const handleCloneUrl = async () => {
    if (!urlToClone.trim()) return;
    
    setIsCloning(true);
    setCloneStatus(null);
    setSelectedTemplate(null);
    
    // Simulation du processus de clonage
    setTimeout(() => {
      setIsCloning(false);
      setCloneStatus('success');
      setPreviewUrl(`https://clone.phishwise.com/${Math.random().toString(36).substr(2, 9)}`);
    }, 3000);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCloneStatus('success');
    setPreviewUrl(template.url);
    setUrlToClone('');
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canProceed = cloneStatus === 'success' || selectedTemplate;

  const handleNext = () => {
    if (canProceed && onNext) {
      // Sauvegarder toutes les données avant de passer à l'étape suivante
      const formData = {
        urlToClone,
        cloneStatus,
        previewUrl,
        selectedTemplate,
        activeTab
      };
      onNext(null, formData);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
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
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              A
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
            <div className="flex items-center space-x-6 mb-10">
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

            {/* Onglets */}
            <div className="mb-10">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('clone');
                      setSelectedTemplate(null);
                    }}
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
                    onClick={() => {
                      setActiveTab('template');
                      setCloneStatus(null);
                      setUrlToClone('');
                    }}
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

            {/* Contenu des onglets */}
            {activeTab === 'clone' ? (
              /* Section URL à cloner */
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
                        disabled={isCloning}
                      />
                      <Link className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <button
                      onClick={handleCloneUrl}
                      disabled={!urlToClone.trim() || !isValidUrl(urlToClone) || isCloning}
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

                {/* Statut du clonage */}
                {cloneStatus && !selectedTemplate && (
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
                    {cloneStatus === 'success' && (
                      <button className="px-4 py-2 bg-white/10 text-white text-base rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Aperçu
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Section Templates */
              <div className="space-y-10">
                {/* Grille des templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`bg-white/5 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-105 ${
                        selectedTemplate?.id === template.id
                          ? 'border-cyan-400 shadow-lg shadow-cyan-400/20'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-40 object-cover rounded-t-xl"
                        />
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
                          <button className="text-cyan-400 text-base hover:text-cyan-300 transition-colors flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Aperçu
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Statut de sélection */}
                {selectedTemplate && (
                  <div className="flex items-center gap-4 p-6 rounded-xl bg-green-500/20 border border-green-500/30">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div className="flex-1">
                      <p className="font-medium text-lg text-green-300">Template sélectionné !</p>
                      <p className="text-green-400 text-base mt-1">
                        {selectedTemplate.name} - <span className="font-mono">{selectedTemplate.url}</span>
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-white/10 text-white text-base rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Aperçu
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Configuration Post-soumission */}
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
                {/* Actions automatiques */}
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
                      Téléchargement automatique du fichier de test (optionnel)
                    </p>
                  </div>
                </div>

                {/* Note explicative */}
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
                disabled={!canProceed}
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