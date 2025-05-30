import React, { useState } from 'react';
import { Search, Filter, RefreshCw, ArrowRight, Star, Clock, Globe, TrendingUp, ChevronLeft, Check, CheckCircle, AlertCircle } from 'lucide-react';

const NewsPage = ({ onNext, onBack }) => {
  const [selectedCountry, setSelectedCountry] = useState('fr');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [credibilityLevel, setCredibilityLevel] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);

  // Placeholder data
  const countries = [
    { code: 'fr', name: 'France', flag: '🇫🇷' },
    { code: 'us', name: 'États-Unis', flag: '🇺🇸' },
    { code: 'uk', name: 'Royaume-Uni', flag: '🇬🇧' },
    { code: 'de', name: 'Allemagne', flag: '🇩🇪' },
    { code: 'es', name: 'Espagne', flag: '🇪🇸' }
  ];

  const themes = [
    { id: 'all', name: 'Tous les sujets', icon: '📰' },
    { id: 'tech', name: 'Technologie', icon: '💻' },
    { id: 'politics', name: 'Politique', icon: '🏛️' },
    { id: 'economy', name: 'Économie', icon: '💰' },
    { id: 'health', name: 'Santé', icon: '🏥' },
    { id: 'environment', name: 'Environnement', icon: '🌱' },
    { id: 'sports', name: 'Sports', icon: '⚽' }
  ];

  const placeholderNews = [
    {
      id: 1,
      title: "L'intelligence artificielle révolutionne l'industrie pharmaceutique",
      excerpt: "Les dernières avancées en IA permettent d'accélérer la découverte de nouveaux médicaments et de réduire les coûts de développement...",
      source: "Le Figaro",
      credibility: 4,
      publishedAt: "2024-05-28T10:30:00Z",
      theme: "tech",
      country: "fr",
      type: "news"
    },
    {
      id: 2,
      title: "Nouvelle politique énergétique européenne adoptée",
      excerpt: "L'Union européenne annonce un plan ambitieux pour atteindre la neutralité carbone d'ici 2035, avec des investissements massifs...",
      source: "Les Échos",
      credibility: 5,
      publishedAt: "2024-05-28T09:15:00Z",
      theme: "environment",
      country: "fr",
      type: "news"
    },
    {
      id: 3,
      title: "Breakthrough in Quantum Computing Research",
      excerpt: "Scientists at MIT have achieved a new milestone in quantum error correction, bringing practical quantum computers closer to reality...",
      source: "TechCrunch",
      credibility: 4,
      publishedAt: "2024-05-28T08:45:00Z",
      theme: "tech",
      country: "us",
      type: "news"
    },
    {
      id: 4,
      title: "Réforme du système de santé français",
      excerpt: "Le gouvernement présente sa nouvelle stratégie pour moderniser le système de santé, incluant la télémédecine et l'IA...",
      source: "Le Monde",
      credibility: 5,
      publishedAt: "2024-05-28T07:20:00Z",
      theme: "health",
      country: "fr",
      type: "news"
    }
  ];

  const filteredNews = placeholderNews.filter(news => {
    const countryMatch = selectedCountry === 'all' || news.country === selectedCountry;
    const themeMatch = selectedTheme === 'all' || news.theme === selectedTheme;
    const credibilityMatch = news.credibility >= credibilityLevel;
    return countryMatch && themeMatch && credibilityMatch;
  });

  const getCredibilityColor = (level) => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCredibilityText = (level) => {
    if (level >= 4) return 'Haute';
    if (level >= 3) return 'Moyenne';
    return 'Faible';
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffInHours = Math.floor((now - published) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
  };

  // Génération de sujets basée sur l'actualité sélectionnée
  const generateTopicsFromNews = (newsItem) => {
    const topicsByTheme = {
      'tech': [
        {
          title: "Impact de l'IA sur l'emploi dans le secteur pharmaceutique",
          description: "Analyse des transformations du marché du travail liées à l'intelligence artificielle"
        },
        {
          title: "Éthique et régulation de l'intelligence artificielle en santé",
          description: "Enjeux éthiques et réglementaires de l'IA dans le développement de médicaments"
        },
        {
          title: "ROI des investissements en IA pharmaceutique",
          description: "Analyse coût-bénéfice des technologies d'IA dans la recherche médicale"
        },
        {
          title: "Collaboration homme-machine dans la recherche pharmaceutique",
          description: "Comment l'IA complète-t-elle l'expertise humaine dans la découverte de médicaments ?"
        }
      ],
      'environment': [
        {
          title: "Transition énergétique : défis et opportunités pour les entreprises",
          description: "Comment les entreprises s'adaptent aux nouvelles réglementations environnementales"
        },
        {
          title: "Financement de la neutralité carbone en Europe",
          description: "Analyse des mécanismes de financement pour atteindre la neutralité carbone"
        },
        {
          title: "Impact économique des politiques environnementales",
          description: "Conséquences économiques des nouvelles réglementations vertes"
        },
        {
          title: "Innovation technologique au service de l'environnement",
          description: "Technologies émergentes pour accélérer la transition écologique"
        }
      ],
      'health': [
        {
          title: "Télémédecine : l'avenir des consultations médicales",
          description: "Impact de la digitalisation sur les pratiques médicales traditionnelles"
        },
        {
          title: "IA et diagnostic médical : révolution ou évolution ?",
          description: "Comment l'intelligence artificielle transforme le diagnostic médical"
        },
        {
          title: "Accessibilité des soins de santé modernisés",
          description: "Enjeux d'équité dans l'accès aux nouvelles technologies médicales"
        },
        {
          title: "Formation des professionnels de santé à l'ère numérique",
          description: "Adaptation des formations médicales aux nouvelles technologies"
        }
      ],
      'politics': [
        {
          title: "Gouvernance numérique et démocratie participative",
          description: "Impact des technologies sur les processus démocratiques"
        },
        {
          title: "Souveraineté numérique et politiques publiques",
          description: "Enjeux de souveraineté dans l'ère du numérique"
        },
        {
          title: "Régulation internationale des nouvelles technologies",
          description: "Coopération internationale pour réguler l'innovation technologique"
        },
        {
          title: "Transparence et accountability dans les politiques publiques",
          description: "Comment les nouvelles technologies peuvent améliorer la transparence politique"
        }
      ],
      'economy': [
        {
          title: "Transformation numérique et compétitivité économique",
          description: "Impact de la digitalisation sur la compétitivité des entreprises"
        },
        {
          title: "Économie circulaire et modèles d'affaires durables",
          description: "Nouveaux modèles économiques pour un développement durable"
        },
        {
          title: "Fintech et transformation des services financiers",
          description: "Revolution des technologies financières et leurs impacts"
        },
        {
          title: "Commerce international à l'ère numérique",
          description: "Comment le numérique transforme les échanges commerciaux internationaux"
        }
      ]
    };

    const defaultTopics = [
      {
        title: "Analyse d'impact sociétal de l'actualité",
        description: "Étude des répercussions sociales et économiques de cette actualité"
      },
      {
        title: "Perspectives d'avenir et tendances émergentes",
        description: "Projection des évolutions futures liées à cette actualité"
      },
      {
        title: "Comparaison internationale des approches",
        description: "Analyse comparative des différentes approches nationales"
      },
      {
        title: "Enjeux éthiques et réglementaires",
        description: "Questions éthiques et défis réglementaires soulevés par cette actualité"
      }
    ];

    const themeTopics = topicsByTheme[newsItem.theme] || defaultTopics;
    
    return themeTopics.slice(0, 4).map((topic, index) => ({
      id: `topic-${newsItem.id}-${index}`,
      title: topic.title,
      description: topic.description,
      type: "topic",
      basedOnNews: newsItem.id
    }));
  };

  const generateTopics = async () => {
    if (!selectedNews) {
      alert('Veuillez d\'abord sélectionner une actualité pour générer des sujets contextuels.');
      return;
    }

    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      const topics = generateTopicsFromNews(selectedNews);
      setGeneratedTopics(topics);
      setIsGenerating(false);
    }, 2000);
  };

  const toggleNewsSelection = (news) => {
    if (selectedNews && selectedNews.id === news.id) {
      setSelectedNews(null);
      setGeneratedTopics([]); // Clear generated topics when deselecting news
    } else {
      setSelectedNews(news);
      setGeneratedTopics([]); // Clear previous topics when selecting new news
    }
    // Reset selected item if it was a topic
    if (selectedItem && selectedItem.type === 'topic') {
      setSelectedItem(null);
    }
  };

  const toggleTopicSelection = (topic) => {
    if (selectedItem && selectedItem.id === topic.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(topic);
    }
  };

  const isNewsSelected = (news) => {
    return selectedNews && selectedNews.id === news.id;
  };

  const isTopicSelected = (topic) => {
    return selectedItem && selectedItem.id === topic.id;
  };

  const handleNext = () => {
    if (!selectedNews) {
      alert('Veuillez sélectionner une actualité.');
      return;
    }
    if (!selectedItem) {
      alert('Veuillez sélectionner un sujet basé sur l\'actualité choisie.');
      return;
    }
    
    onNext({ 
      selectedNews: selectedNews,
      selectedSubject: selectedItem 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Actualités & Sujets</h1>
              <p className="text-gray-600">Sélectionnez une actualité puis générez des sujets d'analyse contextuels</p>
            </div>
          </div>
          
          {/* Selection Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedNews && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Actualité sélectionnée</span>
                </div>
                <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg">
                  <p className="font-medium text-sm">{selectedNews.title}</p>
                  <p className="text-xs text-blue-600 mt-1">Source: {selectedNews.source}</p>
                </div>
              </div>
            )}
            
            {selectedItem && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Sujet sélectionné</span>
                </div>
                <div className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg">
                  <p className="font-medium text-sm">{selectedItem.title}</p>
                  <p className="text-xs text-purple-600 mt-1">{selectedItem.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Process Flow Indicator */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedNews ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className={`font-medium ${selectedNews ? 'text-blue-600' : 'text-gray-500'}`}>
                Choisir une actualité
              </span>
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400" />
            
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${generatedTopics.length > 0 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className={`font-medium ${generatedTopics.length > 0 ? 'text-purple-600' : 'text-gray-500'}`}>
                Générer des sujets
              </span>
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400" />
            
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedItem ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <span className={`font-medium ${selectedItem ? 'text-green-600' : 'text-gray-500'}`}>
                Sélectionner un sujet
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Filtres</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Country Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Pays</label>
              <select 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les pays</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Thème</label>
              <select 
                value={selectedTheme} 
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.icon} {theme.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Credibility Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Niveau de crédibilité minimum
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={credibilityLevel}
                  onChange={(e) => setCredibilityLevel(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{credibilityLevel}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Étape 1: Choisissez une actualité</h2>
            {!selectedNews && (
              <AlertCircle className="w-5 h-5 text-orange-500" />
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNews.map(news => (
              <div 
                key={news.id} 
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border-2 ${
                  isNewsSelected(news) ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'
                }`}
                onClick={() => toggleNewsSelection(news)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{news.source}</span>
                      <div className={`flex items-center gap-1 ${getCredibilityColor(news.credibility)}`}>
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-medium">{getCredibilityText(news.credibility)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{formatTimeAgo(news.publishedAt)}</span>
                      </div>
                      {isNewsSelected(news) && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {news.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {news.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {themes.find(t => t.id === news.theme)?.icon} {themes.find(t => t.id === news.theme)?.name}
                      </span>
                    </div>
                    <button 
                      className={`text-sm font-medium flex items-center gap-1 ${
                        isNewsSelected(news) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNewsSelection(news);
                      }}
                    >
                      {isNewsSelected(news) ? 'Sélectionné' : 'Sélectionner'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No results message */}
        {filteredNews.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun article trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres pour voir plus de résultats.</p>
          </div>
        )}

        {/* Topic Generation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Étape 2: Génération de sujets contextuels</h2>
                <p className="text-gray-600 text-sm">
                  {selectedNews 
                    ? `Générer des sujets d'analyse basés sur : "${selectedNews.title.substring(0, 50)}..."`
                    : 'Sélectionnez d\'abord une actualité pour générer des sujets'
                  }
                </p>
              </div>
            </div>
            
            <button
              onClick={generateTopics}
              disabled={isGenerating || !selectedNews}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-colors ${
                selectedNews 
                  ? 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Génération...' : 'Générer des sujets'}
            </button>
          </div>

          {generatedTopics.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 mb-4">
                Sujets générés pour : <span className="text-purple-600">"{selectedNews.title}"</span>
              </h3>
              {generatedTopics.map((topic) => (
                <div 
                  key={topic.id} 
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isTopicSelected(topic) 
                      ? 'bg-purple-100 border-purple-300' 
                      : 'bg-purple-50 border-purple-100 hover:bg-purple-100'
                  }`}
                  onClick={() => toggleTopicSelection(topic)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium mb-1">{topic.title}</p>
                      <p className="text-gray-600 text-sm">{topic.description}</p>
                    </div>
                    {isTopicSelected(topic) && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center ml-4">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Précédent
          </button>
          
          <button 
            onClick={handleNext}
            disabled={!selectedNews || !selectedItem}
            className={`px-8 py-4 rounded-xl flex items-center gap-2 text-lg font-medium shadow-lg hover:shadow-xl transition-all ${
              selectedNews && selectedItem
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Suivant {selectedNews && selectedItem ? '(Actualité + Sujet sélectionnés)' : ''}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;