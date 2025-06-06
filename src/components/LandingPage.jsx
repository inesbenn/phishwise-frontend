import React, { useState } from 'react';
import { Globe, Download, Shield, Eye, ArrowRight, ArrowLeft, Link, CheckCircle, AlertCircle, Copy, Grid, Star } from 'lucide-react';

const LandingPage = ({ campaignId, onNext, onBack }) => {
  const [urlToClone, setUrlToClone] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneStatus, setCloneStatus] = useState(null); // 'success', 'error', null
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('clone'); // 'clone' ou 'template'
  
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
      onNext();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              PhishWise
            </h1>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">
                Nouvelle Campagne
              </span>
          </div>
        </div>
      </header>

      {/* Zone de contenu */}
      <div className="flex-1 overflow-auto px-6 py-8">
        {/* Barre de progression */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">Création de Campagne</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-500" 
                   style={{ width: '57.14%' }}></div>
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-400">
              <span>Paramètres</span>
              <span>Cibles</span>
              <span>Modèles</span>
              <span className="text-cyan-400 font-medium">Landing</span>
              <span>SMTP</span>
              <span>Formation</span>
              <span>Finaliser</span>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab('clone');
                  setSelectedTemplate(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
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
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
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
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Landing Page Automatisée</h3>
                <p className="text-gray-300 text-sm">Clonez automatiquement une page web existante</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  URL à cloner <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={urlToClone}
                      onChange={(e) => setUrlToClone(e.target.value)}
                      placeholder="https://exemple.com/login"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      disabled={isCloning}
                    />
                    <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <button
                    onClick={handleCloneUrl}
                    disabled={!urlToClone.trim() || !isValidUrl(urlToClone) || isCloning}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-400 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  <p className="text-red-400 text-sm mt-2">Veuillez entrer une URL valide</p>
                )}
              </div>

              {/* Statut du clonage */}
              {cloneStatus && !selectedTemplate && (
                <div className={`flex items-center gap-3 p-4 rounded-lg ${
                  cloneStatus === 'success' 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  {cloneStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${cloneStatus === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                      {cloneStatus === 'success' ? 'Clonage réussi !' : 'Erreur de clonage'}
                    </p>
                    {cloneStatus === 'success' && previewUrl && (
                      <p className="text-green-400 text-sm">
                        Page disponible : <span className="font-mono">{previewUrl}</span>
                      </p>
                    )}
                  </div>
                  {cloneStatus === 'success' && (
                    <button className="px-3 py-1 bg-white/10 text-white text-sm rounded hover:bg-white/20 transition-colors flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Aperçu
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Section Templates */
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                <Grid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Templates Disponibles</h3>
                <p className="text-gray-300 text-sm">Sélectionnez un template déjà cloné et optimisé</p>
              </div>
            </div>

            {/* Grille des templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`bg-white/5 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-105 ${
                    selectedTemplate?.id === template.id
                      ? 'border-cyan-400 shadow-lg shadow-cyan-400/20'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {template.category}
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute inset-0 bg-cyan-400/20 rounded-t-lg flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-cyan-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="text-white font-medium mb-2">{template.name}</h4>
                    <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {renderStars(template.popularity)}
                      </div>
                      <button className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Aperçu
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Statut de sélection */}
            {selectedTemplate && (
              <div className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-green-500/20 border border-green-500/30">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <p className="font-medium text-green-300">Template sélectionné !</p>
                  <p className="text-green-400 text-sm">
                    {selectedTemplate.name} - <span className="font-mono">{selectedTemplate.url}</span>
                  </p>
                </div>
                <button className="px-3 py-1 bg-white/10 text-white text-sm rounded hover:bg-white/20 transition-colors flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  Aperçu
                </button>
              </div>
            )}
          </div>
        )}

        {/* Configuration Post-soumission */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Actions Post-soumission</h3>
              <p className="text-gray-300 text-sm">Configuration automatique des actions après soumission</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Actions automatiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-sm">1</span>
                  </div>
                  <h4 className="text-white font-medium">Collecte des données</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Capture automatique des identifiants et informations saisies
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 font-bold text-sm">2</span>
                  </div>
                  <h4 className="text-white font-medium">Redirection</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Redirection immédiate vers la page d'apprentissage
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Download className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="text-white font-medium">Téléchargement</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Téléchargement automatique du fichier de test (optionnel)
                </p>
              </div>
            </div>

            {/* Note explicative */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-amber-300 font-medium mb-1">Configuration automatique</h4>
                  <p className="text-amber-200 text-sm">
                    Ces actions sont configurées automatiquement lors du clonage ou de la sélection d'un template. 
                    Aucune configuration supplémentaire n'est requise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky bottom-0 bg-black/10 backdrop-blur-lg border-t border-white/10 px-6 py-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          
          <button 
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
              canProceed
                ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-white hover:shadow-lg'
                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            Suivant
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default LandingPage;