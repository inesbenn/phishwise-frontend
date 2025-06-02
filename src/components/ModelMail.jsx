import React, { useState } from 'react';
import { Globe, FileText, Plus, X, ChevronDown, Calendar, TrendingUp, ExternalLink } from 'lucide-react';

const ModelMail = () => {
  const [importMode, setImportMode] = useState('news'); // 'news' or 'template'
  const [selectedCountry, setSelectedCountry] = useState('fr');
  const [selectedTheme, setSelectedTheme] = useState('cybersecurity');
  const [selectedNews, setSelectedNews] = useState([]);
  const [generatedSubjects, setGeneratedSubjects] = useState([]);

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

  const mockSubjects = [
    "Mise à jour urgente de sécurité requise",
    "Vérification de votre compte suite à une activité suspecte",
    "Nouvelle politique de sécurité - Action requise",
    "Alerte sécurité : Accès non autorisé détecté"
  ];

  const toggleNewsSelection = (newsId) => {
    setSelectedNews(prev => 
      prev.includes(newsId) 
        ? prev.filter(id => id !== newsId)
        : [...prev, newsId]
    );
  };

  const generateSubjects = () => {
    setGeneratedSubjects(mockSubjects);
  };

  const handleNext = () => {
    console.log('Proceeding to Step 3 with:', {
      mode: importMode,
      selectedNews,
      generatedSubjects
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              PhishWise
            </h1>
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm">
              Nouvelle Campagne
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Progress Bar */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Étape 2 sur 7</h2>
              <span className="text-cyan-300 text-sm">28.56% complété</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full" style={{width: '28.56%'}}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Paramètres</span>
              <span>Cibles</span>
              <span className="text-cyan-300">Actualités</span>
              <span>Modèles</span>
              <span>Landing</span>
              <span>SMTP</span>
              <span>Formation</span>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Actualités & Sujets</h3>
                <p className="text-gray-300">Choisissez votre source de contenu</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setImportMode('news')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  importMode === 'news'
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <TrendingUp className="w-8 h-8 text-cyan-400 mb-2" />
                <h4 className="text-white font-medium">Actualités en temps réel</h4>
                <p className="text-gray-400 text-sm">Génération basée sur l'actualité</p>
              </button>

              <button
                onClick={() => setImportMode('template')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  importMode === 'template'
                    ? 'border-purple-400 bg-purple-500/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <FileText className="w-8 h-8 text-purple-400 mb-2" />
                <h4 className="text-white font-medium">Modèles existants</h4>
                <p className="text-gray-400 text-sm">Importer des emails prêts</p>
              </button>
            </div>
          </div>

          {/* News Mode */}
          {importMode === 'news' && (
            <>
              {/* Filters */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h4 className="text-white font-medium mb-4">Filtres d'actualités</h4>
                <div className="grid grid-cols-3 gap-4">
                  
                  {/* Country */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Pays</label>
                    <div className="relative">
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      >
                        {countries.map(country => (
                          <option key={country.code} value={country.code} className="bg-slate-800">
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Thème</label>
                    <div className="relative">
                      <select
                        value={selectedTheme}
                        onChange={(e) => setSelectedTheme(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      >
                        {themes.map(theme => (
                          <option key={theme.id} value={theme.id} className="bg-slate-800">
                            {theme.icon} {theme.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="flex items-end">
                    <button
                      onClick={generateSubjects}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      Générer Sujets
                    </button>
                  </div>
                </div>
              </div>

              {/* News List */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
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
                          <h5 className="text-white font-medium">{news.title}</h5>
                          <p className="text-gray-300 text-sm mt-1">{news.excerpt}</p>
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
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h4 className="text-white font-medium mb-4">Sujets générés ({generatedSubjects.length})</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {generatedSubjects.map((subject, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-white text-sm">{subject}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Template Mode */}
          {importMode === 'template' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h4 className="text-white font-medium mb-4">Importer des modèles d'emails</h4>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-2">Glissez vos fichiers ici</p>
                <p className="text-gray-400 text-sm mb-4">Formats supportés: .eml, .msg, .txt</p>
                <button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all">
                  Parcourir les fichiers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-black/10 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex justify-between">
          <button className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all">
            Retour
          </button>
          <button
            onClick={handleNext}
            disabled={importMode === 'news' && selectedNews.length === 0}
            className={`px-6 py-2 rounded-lg transition-all ${
              (importMode === 'news' && selectedNews.length === 0)
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-500 hover:to-purple-500 text-white'
            }`}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelMail;