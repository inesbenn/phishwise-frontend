import React, { useState, useEffect } from 'react';
import { countries as staticCountries } from '../utils/countries';
import { Globe, FileText, Plus, X, ChevronLeft, ChevronRight, Calendar, TrendingUp, ExternalLink, Eye, Mail, Edit3, Upload, Sparkles, Copy, Download, User, Trash2 } from 'lucide-react';
import {
  getNewsThemes,
  getNewsCountries,
  fetchCampaignNews,
  saveSelectedNews,
  generateAISuggestions,
  getCampaignStep2Data,
  updateCampaignStep2Data
} from '../api/campaigns';

const ModelMail = ({ campaignId, onNext, onBack, savedData = {} }) => {
  // State management for various UI elements and data
  const [selectedCountry, setSelectedCountry] = useState(savedData.selectedCountry || 'fr');
  const [selectedTheme, setSelectedTheme] = useState(savedData.selectedTheme || 'cybersecurity');
  const [selectedNews, setSelectedNews] = useState(savedData.selectedNews || []);
  const [emailTemplates, setEmailTemplates] = useState(savedData.emailTemplates || []); // Consolidated state for all email templates
  const [selectedTemplates, setSelectedTemplates] = useState(savedData.selectedTemplates || []);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewEmail, setPreviewEmail] = useState(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState(savedData.activeTab || 'news'); // Sauvegarder l'onglet actif

  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [availableNews, setAvailableNews]       = useState([]);
  const [isLoadingNews, setIsLoadingNews]       = useState(false);
  // Effect to reset default body/html styles on mount for consistent background
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

useEffect(() => {
  getNewsCountries()
    .then(response => {
      if (response.success) {
        setAvailableCountries(response.data);
      } else {
        console.error('newsCountries error', response);
        setAvailableCountries(staticCountries);
      }
    })
    .catch(err => {
      console.error('newsCountries failed, fallback', err);
      setAvailableCountries(staticCountries);
    });

  getNewsThemes()
    .then(response => {
      if (response.success) {
        setAvailableThemes(response.data);
      } else {
        console.error('newsThemes error', response);
      }
    })
    .catch(console.error);
}, []);


useEffect(() => {
  if (!campaignId) return;
  setIsLoadingNews(true);

  fetchCampaignNews(campaignId, {
    country: selectedCountry,
    theme:   selectedTheme,
    credibility: 0,
    limit: 20
  })
    .then(response => {
      if (response.success) {
        setAvailableNews(response.data.news);
      } else {
        console.error('fetchCampaignNews error', response);
      }
    })
    .catch(err => console.error('fetchCampaignNews error', err))
    .finally(() => setIsLoadingNews(false));
}, [campaignId, selectedCountry, selectedTheme]);


useEffect(() => {
  if (!campaignId) return;
  getCampaignStep2Data(campaignId)
    .then(response => {
      if (response.success) {
        const { filters, news } = response.data;
        setSelectedCountry(filters.country);
        setSelectedTheme(filters.theme);
        setSelectedNews(news.map(n => n.id));
        setAvailableNews(news);
      }
    })
    .catch(console.error);
}, [campaignId]);





  // Static data for countries, themes, and mock news/templates
  /*const countries = [
    { code: 'tn', name: 'Tunisie', flag: '🇹🇳' },
    { code: 'fr', name: 'France', flag: '🇫🇷' },
    { code: 'us', name: 'États-Unis', flag: '🇺🇸' },
    { code: 'de', name: 'Allemagne', flag: '🇩🇪' },
    { code: 'gb', name: 'Royaume-Uni', flag: '🇬🇧' }
  ];*/

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

  const mockGeneratedEmailTemplates = [
    {
      id: 1,
      newsId: 1,
      subject: "🚨 Alerte sécurité bancaire : Vérification de compte requise",
      from: "securite@ma-banque.com",
      fromName: "Service Sécurité Bancaire",
      category: "Urgent",
      credibilityLevel: "Élevé",
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
      `,
      generated: true,
      imported: false,
      lastModified: new Date().toISOString()
    },
    {
      id: 2,
      newsId: 2,
      subject: "Microsoft Security Alert : Mise à jour critique disponible",
      from: "security@microsoft.com",
      fromName: "Microsoft Security Team",
      category: "Technique",
      credibilityLevel: "Très élevé",
      body: `
        <div style="font-family: Segoe UI, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0078d4; color: white; padding: 20px;">
            <h1 style="margin: 0; font-size: 24px;">Microsoft Security Alert</h1>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e5e5;">
            <p>Bonjour,</p>
            <p>Notre équipe de sécurité a identifié des vulnérabilités critiques dans plusieurs produits Microsoft. Une mise à jour immédiate est nécessaire.</p>
            <div style="background: #fff4ce; padding: 15px; margin: 15px 0; border-left: 4px solid #ffb900;">
              <strong>Action immédiate requise :</strong><br>
              Installez la mise à jour de sécurité avant le 10 juin 2025
            </div>
            <div style="text-align: center; margin: 20px 0;">
              <a href="#" style="background: #0078d4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
                INSTALLER LA MISE À JOUR
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">
              Microsoft Security Team<br>
              support@microsoft.com
            </p>
          </div>
        </div>
      `,
      generated: true,
      imported: false,
      lastModified: new Date().toISOString()
    }
  ];

  // Initialize emailTemplates with mock generated templates on component mount ONLY if no saved data
  useEffect(() => {
    if (!savedData.emailTemplates || savedData.emailTemplates.length === 0) {
      setEmailTemplates(mockGeneratedEmailTemplates);
    }
  }, []);

  /**
   * Toggles the selection of a news item.
   * @param {number} newsId - The ID of the news item to toggle.
   */
  const toggleNewsSelection = async (newsId) => {
  // Calcul de la nouvelle liste de sélection
  const newList = selectedNews.includes(newsId)
    ? selectedNews.filter(id => id !== newsId)
    : [...selectedNews, newsId];

  // Mise à jour du state local
  setSelectedNews(newList);

  // Préparation des objets à envoyer au backend
  const newsObjects = newList.map(id =>
    availableNews.find(n => n.id === id)
  );

  // Envoi de la sélection au serveur
  try {
    await saveSelectedNews(campaignId, newsObjects);
  } catch (err) {
    console.error('Erreur lors de saveSelectedNews :', err);
  }
};


  /**
   * Toggles the selection of an email template.
   * @param {number} templateId - The ID of the template to toggle.
   */
  const toggleTemplateSelection = (templateId) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  /**
   * Simulates the generation of email templates based on selected news.
   * This function includes a delay to mimic an API call.
   */
  const generateEmailTemplates = async () => {
    if (selectedNews.length === 0) {
      alert('Veuillez sélectionner au moins une actualité pour générer un modèle.');
      return;
    }

    setIsGenerating(true);

    // Simulate API call with a delay
    setTimeout(() => {
      const newTemplates = selectedNews.map(newsId => {
        const news = mockNews.find(n => n.id === newsId);
        // Check if a generated template for this newsId already exists
        const existingTemplate = emailTemplates.find(t => t.newsId === newsId && t.generated);

        if (existingTemplate) {
          // If it exists, return the existing one to prevent duplicates for the same news
          return existingTemplate;
        }

        // Generate a new template based on the news
        return {
          id: Date.now() + Math.random(), // Unique ID
          newsId: newsId,
          subject: `Urgent: ${news.title.substring(0, 50)}...`,
          from: "info@service-securite.com", // Default 'from' for generated
          fromName: "Service Sécurité", // Default 'fromName' for generated
          category: "Généré",
          credibilityLevel: "Moyen",
          body: `<p>Template généré automatiquement basé sur: <strong>${news.title}</strong></p><p>${news.excerpt}</p><p>Pour plus d'informations, visitez <a href="#">notre site</a>.</p>`,
          generated: true,
          imported: false,
          lastModified: new Date().toISOString()
        };
      });

      setEmailTemplates(prev => {
        // Filter out old generated templates that correspond to selected news,
        // then add the newly generated ones. This handles regeneration gracefully.
        const filteredPrev = prev.filter(t => !selectedNews.includes(t.newsId) || !t.generated);
        return [...filteredPrev, ...newTemplates];
      });

      setIsGenerating(false);
      setActiveTab('templates'); // Switch to templates tab after generation
    }, 2000);
  };

  /**
   * Sets the email to be previewed and shows the preview modal.
   * @param {object} template - The template object to preview.
   */
  const previewTemplate = (template) => {
    setPreviewEmail(template);
    setShowEmailPreview(true);
  };

  /**
   * Sets the template to be edited and shows the editor modal.
   * @param {object} template - The template object to edit.
   */
  const editTemplate = (template) => {
    setEditingTemplate({ ...template }); // Create a shallow copy to avoid direct state mutation
    setShowTemplateEditor(true);
  };

  /**
   * Saves the currently editing template back into the emailTemplates state.
   */
  const saveTemplate = () => {
    if (!editingTemplate) return;

    setEmailTemplates(prev =>
      prev.map(t => t.id === editingTemplate.id ? { ...editingTemplate, lastModified: new Date().toISOString() } : t)
    );

    setShowTemplateEditor(false);
    setEditingTemplate(null);
  };

  /**
   * Duplicates an existing email template.
   * @param {object} template - The template object to duplicate.
   */
  const duplicateTemplate = (template) => {
    const duplicated = {
      ...template,
      id: Date.now() + Math.random(), // New unique ID
      subject: `${template.subject} (Copie)`,
      lastModified: new Date().toISOString()
    };
    setEmailTemplates(prev => [...prev, duplicated]);
  };

  /**
   * Removes a template from the list.
   * Note: In a real application, consider a confirmation modal before deleting.
   * @param {number} idToRemove - The ID of the template to remove.
   */
  const removeTemplate = (idToRemove) => {
    // Filter out the template from selectedTemplates if it was selected
    setSelectedTemplates(prevSelected => prevSelected.filter(id => id !== idToRemove));
    // Filter out the template from emailTemplates
    setEmailTemplates(prev => prev.filter(template => template.id !== idToRemove));
  };

  /**
   * Handles the progression to the next step in the wizard.
   */
  const handleNext = () => {
    if (selectedTemplates.length === 0) {
      alert('Veuillez sélectionner au moins un modèle d\'email pour continuer.');
      return;
    }

    // Sauvegarder TOUTES les données de l'étape
    const wizardData = {
      selectedCountry,
      selectedTheme,
      selectedNews,
      emailTemplates, // Sauvegarder TOUS les modèles (générés ET importés)
      selectedTemplates,
      activeTab // Sauvegarder l'onglet actif
    };

    console.log('Données Actualités & Modèles sauvegardées:', wizardData);

    if (onNext) {
      onNext(null, wizardData); // Passer les données à sauvegarder
    }
  };

  /**
   * Handles going back to the previous step in the wizard.
   */
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  /**
   * Handles the import of an email template from a file.
   * Supports HTML, TXT, and JSON files.
   * @param {Event} event - The file input change event.
   */
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        let importedBody = fileContent;
        let importedSubject = `Modèle importé: ${file.name}`;
        let importedCategory = 'Importé';
        let importedFromName = 'Modèle Importé';

        // Attempt to parse JSON if the file type suggests it
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          try {
            const jsonData = JSON.parse(fileContent);
            // Allow overriding default values if present in JSON
            importedSubject = jsonData.subject || importedSubject;
            importedBody = jsonData.body || importedBody;
            importedFromName = jsonData.fromName || importedFromName;
            importedCategory = jsonData.category || importedCategory;
          } catch (error) {
            console.error("Error parsing JSON file:", error);
            alert("Erreur lors de la lecture du fichier JSON. Assurez-vous qu'il est bien formaté.");
            return;
          }
        }

        const newTemplate = {
          id: Date.now() + Math.random(),
          name: file.name, // Use file name as template name
          subject: importedSubject,
          from: `imported_${Date.now()}@template.com`, // Unique 'from' address
          fromName: importedFromName,
          category: importedCategory,
          body: importedBody,
          generated: false,
          imported: true,
          lastModified: new Date().toISOString()
        };
        setEmailTemplates(prev => [...prev, newTemplate]);
        setActiveTab('templates'); // Switch to templates tab after import
      };
      reader.readAsText(file);
    }
    // Clear the file input value to allow selecting the same file again
    event.target.value = '';
  };

  // Filter templates for display in respective sections
  const generatedTemplates = emailTemplates.filter(t => t.generated);
  const importedTemplatesForDisplay = emailTemplates.filter(t => t.imported);

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
            {/* User Avatar Placeholder */}
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              <User className="w-6 h-6" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="w-full px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Création de Campagne</h2>
              <span className="text-lg text-gray-300">Étape 3 sur 7</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-3 rounded-full w-[42.86%] transition-all duration-500"></div>
            </div>
            <div className="grid grid-cols-7 gap-4 mt-4 text-sm text-gray-400">
              {['Paramètres', 'Cibles', 'Modèles', "Page d'atterrissage", 'SMTP', 'Formation', 'Finaliser'].map((step, i) => (
                <span
                  key={step}
                  className={`text-center font-medium ${i <= 2 ? 'text-cyan-400' : ''}`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* Main Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-10">
            <div className="flex items-center space-x-6 mb-10">
              <div className="p-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Actualités & Modèles d'Emails</h3>
                <p className="text-lg text-gray-300">Sélectionnez des actualités et générez/personnalisez vos modèles d'emails</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8">
              <button
                onClick={() => setActiveTab('news')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'news'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5" />
                  <span>Actualités</span>
                  {selectedNews.length > 0 && (
                    <span className="bg-cyan-400 text-white text-xs px-2 py-1 rounded-full">
                      {selectedNews.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'templates'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <span>Modèles</span>
                  {selectedTemplates.length > 0 && (
                    <span className="bg-purple-400 text-white text-xs px-2 py-1 rounded-full">
                      {selectedTemplates.length}
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* News Tab Content */}
            {activeTab === 'news' && (
              <div className="space-y-8">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label htmlFor="country-select" className="block text-gray-300 text-lg mb-3">Pays</label>
                    <select
                      id="country-select"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-4 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all duration-200"
                    >
                      {Array.isArray(availableCountries) && availableCountries.map(country => (
                        <option key={country.code} value={country.code} className="bg-slate-800">
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="theme-select" className="block text-gray-300 text-lg mb-3">Thème</label>
                    <select
                      id="theme-select"
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="w-full px-4 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all duration-200"
                    >
                      {availableThemes.map(theme => (
                        <option key={theme.id} value={theme.id} className="bg-slate-800">
                          {theme.icon} {theme.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-end">
                    <button
                      onClick={generateEmailTemplates}
                      disabled={selectedNews.length === 0 || isGenerating}
                      className={`w-full px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-4 ${
                        selectedNews.length === 0 || isGenerating
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg font-medium hover:scale-105'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Génération...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          <span>Générer Modèles ({selectedNews.length})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

               {/* News Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {isLoadingNews ? (
    <div className="col-span-full text-center text-white text-lg">
      Chargement des actualités…
    </div>
  ) : (
    availableNews.map(news => (
      <div
        key={news.id}
        onClick={() => toggleNewsSelection(news.id)}
        className={`p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
          selectedNews.includes(news.id)
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-white/20 bg-white/5 hover:bg-white/10 hover:scale-[1.02]'
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h5 className="text-white font-medium text-lg mb-2">{news.title}</h5>
            <p className="text-gray-300 text-base">{news.excerpt}</p>
          </div>
          <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
            <span
              className={`w-3 h-3 rounded-full ${
                news.credibility >= 8
                  ? 'bg-green-400'
                  : news.credibility >= 5
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
              }`}
            ></span>
            <span className="text-sm text-gray-400">{news.credibility}/10</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-400 mt-4">
          <span>{news.source}</span>
          <span>
            <Calendar className="inline-block w-4 h-4 mr-1" /> {news.date}
          </span>
        </div>
      </div>
    ))
  )}
</div>

              </div>
            )}

            {/* Templates Tab Content */}
            {activeTab === 'templates' && (
              <div className="space-y-8">
                {/* Template Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <h4 className="text-white font-medium text-xl">Modèles d'Emails</h4>
                    <span className="text-gray-400 text-base">
                      {emailTemplates.length} disponible(s) • {selectedTemplates.length} sélectionné(s)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="template-import"
                      accept=".html,.txt,.json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                    <label
                      htmlFor="template-import"
                      className="px-6 py-3 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all duration-300 cursor-pointer flex items-center space-x-3 hover:scale-105"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Importer</span>
                    </label>
                  </div>
                </div>

                {/* Generated Templates */}
                {generatedTemplates.length > 0 && (
                  <div>
                    <h5 className="text-white font-medium mb-4 text-xl">Modèles Générés</h5>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {generatedTemplates.map(template => (
                        <div
                          key={template.id}
                          className={`p-6 rounded-xl border transition-all duration-300 ${
                            selectedTemplates.includes(template.id)
                              ? 'border-green-400 bg-green-500/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/10 hover:scale-[1.02]'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div
                              onClick={() => toggleTemplateSelection(template.id)}
                              className="flex items-start space-x-3 flex-1 cursor-pointer"
                            >
                              <div className={`w-5 h-5 rounded-full border-2 transition-all mt-1 flex-shrink-0 ${
                                selectedTemplates.includes(template.id)
                                  ? 'bg-green-400 border-green-400'
                                  : 'border-white/30'
                              }`}>
                                {selectedTemplates.includes(template.id) && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h6 className="text-white font-medium text-lg">{template.subject}</h6>
                                <div className="flex flex-wrap items-center space-x-3 mt-2">
                                  <span className="text-base text-gray-400">De: {template.fromName}</span>
                                  <span className={`px-3 py-1 rounded-full text-sm ${
                                    template.category === 'Urgent' ? 'bg-red-500/20 text-red-300' :
                                    template.category === 'Technique' ? 'bg-blue-500/20 text-blue-300' :
                                    'bg-gray-500/20 text-gray-300'
                                  }`}>
                                    {template.category}
                                  </span>
                                  {template.credibilityLevel && (
                                    <span className="text-sm text-gray-400">
                                      Crédibilité: {template.credibilityLevel}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-6 flex-shrink-0">
                              <button
                                onClick={() => previewTemplate(template)}
                                className="p-3 text-cyan-400 rounded-lg transition-all duration-200 hover:bg-cyan-500/20 hover:scale-110"
                                title="Aperçu"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => editTemplate(template)}
                                className="p-3 text-yellow-400 rounded-lg transition-all duration-200 hover:bg-yellow-500/20 hover:scale-110"
                                title="Modifier"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => duplicateTemplate(template)}
                                className="p-3 text-green-400 rounded-lg transition-all duration-200 hover:bg-green-500/20 hover:scale-110"
                                title="Dupliquer"
                              >
                                <Copy className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => removeTemplate(template.id)} // Delete button
                                className="p-3 text-red-400 rounded-lg transition-all duration-200 hover:bg-red-500/20 hover:scale-110"
                                title="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            Modifié: {new Date(template.lastModified).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Imported Templates */}
                {importedTemplatesForDisplay.length > 0 && (
                  <div className="pt-8 border-t border-white/10 mt-8">
                    <h5 className="text-white font-medium mb-4 text-xl">Modèles Importés</h5>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {importedTemplatesForDisplay.map(template => (
                        <div
                          key={template.id}
                          className={`p-6 rounded-xl border transition-all duration-300 ${
                            selectedTemplates.includes(template.id)
                              ? 'border-green-400 bg-green-500/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/10 hover:scale-[1.02]'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div
                              onClick={() => toggleTemplateSelection(template.id)}
                              className="flex items-start space-x-3 flex-1 cursor-pointer"
                            >
                              <div className={`w-5 h-5 rounded-full border-2 transition-all mt-1 flex-shrink-0 ${
                                selectedTemplates.includes(template.id)
                                  ? 'bg-green-400 border-green-400'
                                  : 'border-white/30'
                              }`}>
                                {selectedTemplates.includes(template.id) && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h6 className="text-white font-medium text-lg">{template.name || template.subject}</h6>
                                <div className="flex flex-wrap items-center space-x-3 mt-2">
                                  <span className="text-base text-gray-400">De: {template.fromName}</span>
                                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                    {template.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-6 flex-shrink-0">
                              <button
                                onClick={() => previewTemplate(template)}
                                className="p-3 text-cyan-400 rounded-lg transition-all duration-200 hover:bg-cyan-500/20 hover:scale-110"
                                title="Aperçu"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => editTemplate(template)}
                                className="p-3 text-yellow-400 rounded-lg transition-all duration-200 hover:bg-yellow-500/20 hover:scale-110"
                                title="Modifier"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => duplicateTemplate(template)}
                                className="p-3 text-green-400 rounded-lg transition-all duration-200 hover:bg-green-500/20 hover:scale-110"
                                title="Dupliquer"
                              >
                                <Copy className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => removeTemplate(template.id)} // Delete button
                                className="p-3 text-red-400 rounded-lg transition-all duration-200 hover:bg-red-500/20 hover:scale-110"
                                title="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            Modifié: {new Date(template.lastModified).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-10 p-4 bg-white/5 rounded-2xl border border-white/10">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            <button
              onClick={handleNext}
              disabled={selectedTemplates.length === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                selectedTemplates.length === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium hover:scale-105'
              }`}
            >
              <span>Continuer</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full h-3/4 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800">Aperçu de l'Email</h3>
              <button onClick={() => setShowEmailPreview(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              {previewEmail && (
                <div
                  className="bg-white p-6 rounded-lg shadow-md"
                  dangerouslySetInnerHTML={{ __html: previewEmail.body }}
                />
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowEmailPreview(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      {showTemplateEditor && editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full h-5/6 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800">Modifier le Modèle</h3>
              <button onClick={() => setShowTemplateEditor(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-6 bg-gray-100">
              {/* Subject field */}
              <div>
                <label htmlFor="edit-subject" className="block text-gray-700 text-sm font-bold mb-2">Sujet:</label>
                <input
                  id="edit-subject"
                  type="text"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Category field */}
              <div>
                <label htmlFor="edit-category" className="block text-gray-700 text-sm font-bold mb-2">Catégorie:</label>
                <input
                  id="edit-category"
                  type="text"
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* HTML Content field */}
              <div>
                <label htmlFor="edit-body" className="block text-gray-700 text-sm font-bold mb-2">Contenu HTML:</label>
                <textarea
                  id="edit-body"
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  rows="15"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                ></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowTemplateEditor(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveTemplate}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelMail;
