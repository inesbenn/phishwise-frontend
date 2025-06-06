import React, { useState } from 'react';
import { Globe, FileText, Plus, X, ChevronLeft, ChevronRight, Calendar, TrendingUp, ExternalLink, Eye } from 'lucide-react';

const ModelMail = ({ campaignId, onNext, onBack }) => {
  const [selectedCountry, setSelectedCountry] = useState('fr');
  const [selectedTheme, setSelectedTheme] = useState('cybersecurity');
  const [selectedNews, setSelectedNews] = useState([]);
  const [generatedSubjects, setGeneratedSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewEmail, setPreviewEmail] = useState(null);

  const countries = [
    { code: 'fr', name: 'France', flag: '🇫🇷' },
    { code: 'us', name: 'États-Unis', flag: '🇺🇸' },
    { code: 'de', name: 'Allemagne', flag: '🇩🇪' },
    { code: 'gb', name: 'Royaume-Uni', flag: '🇬🇧' }
  ];

  const themes = [
    { id: 'cybersecurity', name: 'Cybersécurité', icon: '🔒' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'tech', name: 'Technologie', icon: '💻' },
    { id: 'health', name: 'Santé', icon: '🏥' },
    { id: 'politics', name: 'Politique', icon: '🏛️' }
  ];

  const mockNews = [
    {
      id: 1,
      title: "Nouvelle cyberattaque majeure contre les institutions financières",
      excerpt: "Les experts en cybersécurité alertent sur une recrudescence des attaques...",
      source: "CyberNews",
      date: "2025-06-01",
      credibility: 9
    },
    {
      id: 2,
      title: "Microsoft annonce des mises à jour de sécurité critiques",
      excerpt: "Des vulnérabilités importantes ont été découvertes dans plusieurs produits...",
      source: "TechCrunch",
      date: "2025-06-01",
      credibility: 8
    },
    {
      id: 3,
      title: "Les entreprises françaises face aux nouvelles réglementations GDPR",
      excerpt: "De nouvelles directives européennes renforcent la protection des données...",
      source: "Les Échos",
      date: "2025-05-31",
      credibility: 9
    }
  ];

  const mockSubjectsTemplates = {
    1: [
      "🚨 Alerte sécurité bancaire : Vérification de compte requise",
      "Mise à jour de sécurité urgente suite aux cyberattaques",
      "Votre banque renforce sa sécurité - Action requise",
      "Confirmation d'identité nécessaire après incident de sécurité"
    ],
    2: [
      "Microsoft Security Alert : Mise à jour critique disponible",
      "Action requise : Vulnérabilité détectée sur votre système",
      "Mise à jour de sécurité Windows - Installation immédiate",
      "Votre licence Microsoft nécessite une vérification"
    ],
    3: [
      "Nouvelle politique GDPR : Consentement requis",
      "Mise à jour de vos préférences de confidentialité",
      "Conformité GDPR : Validez vos données personnelles",
      "Action requise pour la protection de vos données"
    ]
  };

  const mockEmailTemplates = {
    "🚨 Alerte sécurité bancaire : Vérification de compte requise": {
      subject: "🚨 Alerte sécurité bancaire : Vérification de compte requise",
      from: "securite@ma-banque.com",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #d32f2f; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">🚨 ALERTE SÉCURITÉ</h2>
          </div>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
            <p>Cher client,</p>
            <p>Suite aux récentes cyberattaques contre les institutions financières, nous devons vérifier immédiatement votre compte pour garantir sa sécurité.</p>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 4px;">
              <strong>⚠️ Action requise dans les 24h</strong><br>
              Votre compte sera temporairement suspendu si vous ne confirmez pas vos informations.
            </div>
            <div style="text-align: center; margin: 20px 0;">
              <a href="#" style="background: #d32f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
                VÉRIFIER MON COMPTE
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">
              Service Sécurité - Ma Banque<br>
              En cas de doute, contactez le 01.23.45.67.89
            </p>
          </div>
        </div>
      `
    }
  };

  const toggleNewsSelection = (newsId) => {
    setSelectedNews(prev => {
      const newSelection = prev.includes(newsId) 
        ? prev.filter(id => id !== newsId)
        : [...prev, newsId];
      
      if (newSelection.length !== prev.length) {
        setGeneratedSubjects([]);
        setSelectedSubjects([]);
      }
      
      return newSelection;
    });
  };

  const toggleSubjectSelection = (subject) => {
    setSelectedSubjects(prev => 
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const generateSubjects = () => {
    if (selectedNews.length === 0) {
      alert('Veuillez sélectionner au moins une actualité');
      return;
    }

    let allSubjects = [];
    selectedNews.forEach(newsId => {
      if (mockSubjectsTemplates[newsId]) {
        allSubjects = [...allSubjects, ...mockSubjectsTemplates[newsId]];
      }
    });

    const uniqueSubjects = [...new Set(allSubjects)];
    setGeneratedSubjects(uniqueSubjects);
    setSelectedSubjects([]);
  };

  const previewEmailTemplate = (subject) => {
    const template = mockEmailTemplates[subject];
    if (template) {
      setPreviewEmail(template);
      setShowEmailPreview(true);
    }
  };

  const handleNext = () => {
    if (selectedSubjects.length === 0) {
      alert('Veuillez sélectionner au moins un sujet');
      return;
    }
    
    // Ici vous pouvez sauvegarder les données sélectionnées
    const wizardData = {
      campaignId,
      selectedCountry,
      selectedTheme,
      selectedNews,
      selectedSubjects
    };
    
    console.log('Données de l\'étape Actualités & Sujets:', wizardData);
    
    // Appeler la fonction onNext du wizard
    if (onNext) {
      onNext();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              PhishWise
            </h1>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">
                Nouvelle Campagne
              </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Progress Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Création de Campagne</h2>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full" style={{width: '42.86%'}}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Paramètres</span>
            <span>Cibles</span>
            <span className="text-cyan-300">Modèles</span>
            <span>Landing</span>
            <span>SMTP</span>
            <span>Formation</span>
          </div>
        </div>

        {/* Main Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Actualités & Génération de Sujets</h3>
              <p className="text-gray-300">Sélectionnez des actualités pour générer des sujets de phishing</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Pays</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code} className="bg-slate-800">
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Thème</label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400"
              >
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id} className="bg-slate-800">
                    {theme.icon} {theme.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateSubjects}
                disabled={selectedNews.length === 0}
                className={`w-full px-4 py-2 rounded-lg transition-all ${
                  selectedNews.length === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                }`}
              >
                Générer Sujets ({selectedNews.length})
              </button>
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-white font-medium mb-4">Actualités disponibles</h4>
              <div className="space-y-3">
                {mockNews.map(news => (
                  <div
                    key={news.id}
                    onClick={() => toggleNewsSelection(news.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedNews.includes(news.id)
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="text-white font-medium text-sm">{news.title}</h5>
                        <p className="text-gray-300 text-xs mt-1">{news.excerpt}</p>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${news.credibility >= 8 ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                        <span className="text-xs text-gray-400">{news.credibility}/10</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{news.source}</span>
                      <span>{news.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Subjects */}
            {generatedSubjects.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">Sujets générés ({generatedSubjects.length})</h4>
                  <span className="text-cyan-300 text-sm">{selectedSubjects.length} sélectionné(s)</span>
                </div>
                <div className="space-y-3">
                  {generatedSubjects.map((subject, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border transition-all ${
                        selectedSubjects.includes(subject)
                          ? 'border-green-400 bg-green-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div 
                          onClick={() => toggleSubjectSelection(subject)}
                          className="flex items-center space-x-3 flex-1 cursor-pointer"
                        >
                          <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                            selectedSubjects.includes(subject)
                              ? 'bg-green-400 border-green-400'
                              : 'border-white/30'
                          }`}>
                            {selectedSubjects.includes(subject) && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <p className="text-white text-sm flex-1">{subject}</p>
                        </div>
                        {mockEmailTemplates[subject] && (
                          <button
                            onClick={() => previewEmailTemplate(subject)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            title="Aperçu de l'email"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedSubjects.length > 0 && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h5 className="text-green-300 font-medium mb-2">Prêt pour l'étape suivante :</h5>
                    <p className="text-gray-300 text-sm">
                      {selectedSubjects.length} sujet(s) sélectionné(s). Vous pourrez personnaliser les modèles d'emails à l'étape suivante.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {showEmailPreview && previewEmail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Aperçu de l'email généré</h3>
              <button
                onClick={() => setShowEmailPreview(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>De :</strong> {previewEmail.from}</div>
                  <div><strong>Sujet :</strong> {previewEmail.subject}</div>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: previewEmail.body }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-black/10 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center space-x-2 px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          <button
            onClick={handleNext}
            disabled={selectedSubjects.length === 0}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all ${
              selectedSubjects.length === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-500 hover:to-purple-500 text-white'
            }`}
          >
            <span>Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelMail;