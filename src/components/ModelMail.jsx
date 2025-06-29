import React, { useState, useEffect, useCallback } from 'react';
// Assurez-vous que le chemin vers votre fichier utils/countries est correct
import { countries as staticCountries } from '../utils/countries'; 

import { Globe, FileText, Plus, X, ChevronLeft, ChevronRight, Calendar, TrendingUp, ExternalLink, Eye, Mail, Edit3, Upload, Sparkles, Copy, Download, User, Trash2 } from 'lucide-react';

// Importez TOUTES les fonctions API nécessaires depuis votre fichier src/api/campaigns.js
import {
  getNewsThemes,
  getNewsCountries,
  fetchCampaignNews,
  saveSelectedNews,
  // generateAISuggestions, // Non utilisé directement dans ModelMail.jsx pour le moment, mais peut être utile
  getCampaignStep2Data,
  updateCampaignStep2Data, 
  generateEmailTemplates as apiGenerateEmailTemplates, // Renommé pour éviter le conflit de nom
  getEmailTemplates,
  selectEmailTemplate, // Pour la sélection d'un template unique
  // generateCustomTemplate, // Vous devrez implémenter un bouton/formulaire pour cette fonction
  deleteEmailTemplate,
  previewEmailTemplate,
} from '../api/campaigns'; 

// --- Helper Functions for News Detail Modal (from your original code) ---
// Fonction pour formater le contenu de l'actualité avec priorité aux données NewsAPI
const formatNewsContent = (newsItem) => {
  if (!newsItem) return 'Contenu non disponible';
 if (newsItem.content && newsItem.content !== '[Removed]') {
    return newsItem.content;
  }
 if (newsItem.description && newsItem.description.length > (newsItem.excerpt?.length || 0)) {
    return newsItem.description;
  }
  // 'fullContent' est une propriété qui pourrait venir de données mockées ou enrichies localement si l'API ne fournit pas tout
  if (newsItem.fullContent) { 
    return newsItem.fullContent;
  }
 return newsItem.excerpt || newsItem.description || 'Contenu non disponible';
};

// Fonction pour obtenir l'image avec fallback
const getNewsImage = (newsItem) => {
  return newsItem?.urlToImage || newsItem?.imageUrl || null;
};

// Fonction pour obtenir le lien de l'article
const getNewsLink = (newsItem) => {
  return newsItem?.url || newsItem?.link || null;
};

// Fonction pour formater la date
const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
 try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

// Fonction pour obtenir les informations d'auteur
const getAuthorInfo = (newsItem) => {
  return newsItem?.author || 'Auteur non spécifié';
};
// --- End Helper Functions ---


const ModelMail = ({ campaignId, onNext, onBack, savedData = {} }) => {
  // Vérification si campaignId est fourni
  if (!campaignId) {
    console.error("ModelMail: campaignId n'est pas fourni. Le composant ne fonctionnera pas correctement.");
    // Vous pouvez ajouter une gestion d'erreur plus visible ici (ex: retourner null ou un message)
    // return <div>Erreur: ID de campagne manquant.</div>;
  }

  // --- State Management ---
  const [selectedCountry, setSelectedCountry] = useState(savedData.selectedCountry || 'fr');
  const [selectedTheme, setSelectedTheme] = useState(savedData.selectedTheme || 'cybersecurity');
  // selectedNews va stocker les objets actualités complets pour la persistance locale du frontend
  // et pour l'envoi au backend lors de saveSelectedNews
  const [selectedNews, setSelectedNews] = useState(savedData.selectedNews || []); 
  
  // emailTemplates contient TOUS les templates (générés et importés) récupérés du backend
  const [emailTemplates, setEmailTemplates] = useState(savedData.emailTemplates || []); 
  // selectedTemplates contient les IDs des templates ACTUELLEMENT sélectionnés pour la campagne
  const [selectedTemplates, setSelectedTemplates] = useState(savedData.selectedTemplates || []); 

  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewEmail, setPreviewEmail] = useState(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false); // Pour la génération IA des templates
  const [activeTab, setActiveTab] = useState(savedData.activeTab || 'news'); // Sauvegarder l'onglet actif

  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [availableNews, setAvailableNews] = useState([]); // Actualités disponibles de l'API News
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false); // Nouveau loading state pour les templates
  const [showNewsDetailModal, setShowNewsDetailModal] = useState(false);
  const [selectedNewsDetail, setSelectedNewsDetail] = useState(null);
  const [isLoadingNewsDetail, setIsLoadingNewsDetail] = useState(false); // Pour le cas où on fetch le détail

  // --- Effects ---

  // Effet pour réinitialiser les styles par défaut du corps/html
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  // Chargement initial des données de référence (pays, thèmes) depuis le backend
  useEffect(() => {
    // Récupération des pays
    getNewsCountries()
      .then(response => {
        if (response.success) {
          setAvailableCountries(response.data);
        } else {
          console.error('API Error: getNewsCountries', response);
          setAvailableCountries(staticCountries); // Fallback vers les pays statiques si l'API échoue
        }
      })
      .catch(err => {
        console.error('Fetch Error: getNewsCountries', err);
        setAvailableCountries(staticCountries); // Fallback sur erreur réseau ou autre
      });

    // Récupération des thèmes
    getNewsThemes()
      .then(response => {
        if (response.success) {
          setAvailableThemes(response.data);
        } else {
          console.error('API Error: getNewsThemes', response);
          // Pas de fallback statique ici, si les thèmes sont censés être dynamiques
        }
      })
      .catch(console.error);
  }, []);

  // Chargement des actualités disponibles basées sur les filtres et la campagne ID
  useEffect(() => {
    // S'assure que campaignId et les filtres sont définis avant de faire l'appel API
    if (!campaignId || !selectedCountry || !selectedTheme) return;

    const fetchNews = async () => {
      setIsLoadingNews(true);
      try {
        const response = await fetchCampaignNews(campaignId, {
          country: selectedCountry,
          theme: selectedTheme,
          credibility: 0, // Valeur par défaut pour la crédibilité, à ajuster si configurable
          limit: 20 // Limite le nombre de résultats pour ne pas surcharger
        });
        if (response.success && response.data?.news) {
          setAvailableNews(response.data.news);
          // Note: selectedNews est mis à jour par getCampaignStep2Data lors du chargement initial
          // ou par toggleNewsSelection après une action utilisateur.
        } else {
          console.error('Failed to fetch campaign news:', response.message || response);
          setAvailableNews([]); // Vide la liste si la récupération échoue
        }
      } catch (err) {
        console.error('Error fetching campaign news:', err);
        setAvailableNews([]);
      } finally {
        setIsLoadingNews(false);
      }
    };
    fetchNews();
  }, [campaignId, selectedCountry, selectedTheme]);

  // Chargement des données sauvegardées des étapes 2 et 3 de la campagne
  // S'exécute une seule fois au chargement du composant si campaignId est présent
  useEffect(() => {
    if (!campaignId) return;

    const loadCampaignSavedData = async () => {
      // Charger les données de l'étape 2 (filtres, actualités sélectionnées)
      try {
        const responseStep2 = await getCampaignStep2Data(campaignId);
        if (responseStep2.success && responseStep2.data) {
          if (responseStep2.data.filters) {
            setSelectedCountry(responseStep2.data.filters.country || 'fr');
            setSelectedTheme(response2.data.filters.theme || 'cybersecurity');
          }
          // Stocke les actualités complètes sauvegardées dans le state `selectedNews`
          setSelectedNews(responseStep2.data.news || []);
        } else {
          console.warn("Failed to load Step 2 data for campaign:", campaignId, responseStep2.message || responseStep2);
        }
      } catch (err) {
        console.error("Error fetching Step 2 data:", err);
      }

      // Charger les données de l'étape 3 (templates d'emails)
      try {
        setIsLoadingTemplates(true);
        const responseStep3 = await getEmailTemplates(campaignId);
        if (responseStep3.success && responseStep3.data?.templates) {
          // --- DÉBUT DE LA MODIFICATION IMPORTANTE POUR LA ROBUSTESSE ---
          // S'assurer que les flags 'generated' et 'imported' sont des booléens
          const processedTemplates = (responseStep3.data.templates || []).map(template => {
            const isImported = typeof template.imported === 'boolean' ? template.imported : false;
            // Un template est généré si 'generated' est explicitement true, OU s'il n'est pas importé.
            const isGenerated = typeof template.generated === 'boolean' ? template.generated : !isImported;
            
            // LOG DÉTAILLÉ DE CHAQUE TEMPLATE PENDANT LE TRAITEMENT
            console.log(`DEBUG: Processing template ${template.id || template.subject}: raw.generated=${template.generated}, raw.imported=${template.imported}, processed.generated=${isGenerated}, processed.imported=${isImported}`);

            return {
              ...template,
              generated: isGenerated, 
              imported: isImported 
            };
          });
          setEmailTemplates(processedTemplates);
          // --- FIN DE LA MODIFICATION IMPORTANTE ---

          // Si le backend stocke UN SEUL template sélectionné (selectedTemplate), on peut l'initialiser ici
          // Si le frontend gère la multi-sélection, cette logique doit être adaptée
          if (responseStep3.data.selectedTemplate) {
            setSelectedTemplates([responseStep3.data.selectedTemplate]);
          } else {
            setSelectedTemplates([]); // Aucune sélection initiale
          }
           console.log("Templates chargés depuis le backend:", processedTemplates); // LOG IMPORTANT
        } else {
          console.warn("Failed to load Step 3 data (templates) for campaign:", campaignId, responseStep3.message || responseStep3);
          setEmailTemplates([]); // S'assure que la liste est vide si la récupération échoue
        }
      } catch (err) {
        console.error("Error fetching Step 3 data (templates):", err);
        setEmailTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    loadCampaignSavedData();
  }, [campaignId]); // Déclenche ce useEffect uniquement quand campaignId change


  // --- Handlers ---

  /**
   * Toggles the selection of a news item.
   * Updates local state and persists to backend via `saveSelectedNews`.
   * @param {object} newsItem - The full news item object to toggle.
   */
  const toggleNewsSelection = async (newsItem) => {
    // Vérifie si l'actualité est déjà sélectionnée en comparant l'ID
    const isSelected = selectedNews.some(n => n.id === newsItem.id);
    let newList;
    if (isSelected) {
      newList = selectedNews.filter(n => n.id !== newsItem.id);
    } else {
      newList = [...selectedNews, newsItem];
    }
    setSelectedNews(newList);

   try {
      // Envoie la liste COMPLETE des actualités sélectionnées au backend
      // Le backend gérera la sauvegarde ou la mise à jour
      await saveSelectedNews(campaignId, newList);
      console.log('Actualités sélectionnées sauvegardées dans le backend.');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des actualités sélectionnées vers le backend:', err);
      // Optionnel: Revenir à l'état précédent si la sauvegarde échoue
      // setSelectedNews(prevSelectedNews);
      alert('Erreur lors de la sauvegarde de la sélection d\'actualités.');
    }
  };

 /**
   * Toggles the selection of an email template.
   * Manages local state for multi-selection.
   * IMPORTANT: The backend API `selectEmailTemplate` handles SINGLE selection.
   * If your frontend needs to send MULTIPLE selected template IDs to the backend,
   * you'll need to adapt the backend schema and API endpoint (e.g., PUT /campaigns/:campaignId/selected-templates).
   * For now, this function only manages the frontend state.
   * @param {string} templateId - The ID of the template to toggle.
   */
  const toggleTemplateSelection = useCallback((templateId) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
    // Pas d'appel API direct ici pour la multi-sélection.
    // La sélection finale sera envoyée via `handleNext`.
  }, []);

  /**
   * Generates email templates based on selected news via backend API.
   * Calls the `apiGenerateEmailTemplates` function.
   */
  const generateEmailTemplates = async () => {
    if (selectedNews.length === 0) {
      alert('Veuillez sélectionner au moins une actualité pour générer un modèle.');
      return;
    }

    setIsGenerating(true);
    try {
      // Appelle la fonction API du frontend qui contacte votre backend GroqService
      const response = await apiGenerateEmailTemplates(campaignId, true, {}); 
      if (response.success && response.data?.templates) {
        // Le backend renvoie la liste complète des templates (générés + existants si fusionnés)
        // --- DÉBUT DE LA MODIFICATION IMPORTANTE POUR LA ROBUSTESSE ---
        // S'assurer que les flags 'generated' et 'imported' sont des booléens lors de la mise à jour
        const processedTemplates = (response.data.templates || []).map(template => {
            const isImported = typeof template.imported === 'boolean' ? template.imported : false;
            const isGenerated = typeof template.generated === 'boolean' ? template.generated : !isImported;
            
            // LOG DÉTAILLÉ DE CHAQUE TEMPLATE PENDANT LE TRAITEMENT
            console.log(`DEBUG: Generating template ${template.id || template.subject}: raw.generated=${template.generated}, raw.imported=${template.imported}, processed.generated=${isGenerated}, processed.imported=${isImported}`);

            return {
              ...template,
              generated: isGenerated, 
              imported: isImported 
            };
        });
        setEmailTemplates(processedTemplates); 
        // --- FIN DE LA MODIFICATION IMPORTANTE ---
        setActiveTab('templates'); // Passe à l'onglet des templates après génération
        console.log('Modèles d\'emails générés via le backend et état mis à jour.');
      } else {
        alert('Échec de la génération des modèles d\'emails. ' + (response.message || ''));
        console.error('API Error: apiGenerateEmailTemplates', response);
      }
    } catch (err) {
      console.error('Erreur de récupération: apiGenerateEmailTemplates', err);
      alert('Une erreur est survenue lors de la génération des modèles. Vérifiez la console.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Sets the email to be previewed and shows the preview modal, fetching preview from backend.
   * The backend will generate the HTML with personalized data.
   * @param {object} template - The template object to preview.
   */
  const previewTemplate = async (template) => {
    try {
      // Appelle l'API de prévisualisation avec des données de test
      const response = await previewEmailTemplate(campaignId, template.id, {
        firstName: 'Utilisateur',
        lastName: 'Test',
        position: 'Développeur',
        email: 'test@example.com'
      });
      if (response.success && response.data?.template?.preview_html) {
        // Met à jour le state `previewEmail` avec le HTML prévisualisé
        setPreviewEmail({ ...template, body: response.data.template.preview_html });
        setShowEmailPreview(true);
      } else {
        alert('Échec de la prévisualisation du modèle. ' + (response.message || ''));
        console.error('API Error: previewEmailTemplate', response);
      }
    } catch (err) {
      console.error('Erreur de récupération: previewEmailTemplate', err);
      alert('Une erreur est survenue lors de la prévisualisation.');
    }
  };

  /**
   * Sets the template to be edited and shows the editor modal.
   * Note: This currently only prepares the local state for editing.
   * Saving the changes (via `saveTemplate`) would require a backend endpoint
   * to update a specific template if persistence is desired.
   * @param {object} template - The template object to edit.
   */
  const editTemplate = (template) => {
    setEditingTemplate({ ...template }); // Crée une copie superficielle pour éviter la mutation directe
    setShowTemplateEditor(true);
  };

  /**
   * Saves the currently editing template back into the emailTemplates state (locally).
   * TODO: Implement backend API call to persist changes to an individual template.
   */
  const saveTemplate = async () => {
    if (!editingTemplate) return;

    // Mise à jour de l'état local du frontend
    setEmailTemplates(prev =>
      prev.map(t => t.id === editingTemplate.id ? { 
        ...editingTemplate, 
        lastModified: new Date().toISOString(),
        // Assurez-vous que les champs sont conformes à votre schéma Mongoose (content_html au lieu de body)
        content_html: editingTemplate.content_html || editingTemplate.body,
        content_text: editingTemplate.content_text || formatNewsContent(editingTemplate.content_html || editingTemplate.body), // Générer le texte brut si non fourni
        type: editingTemplate.type || editingTemplate.category || 'generic', // Assurez la cohérence du champ type
      } : t)
    );

    // IMPORTANT: Pour persister cette modification, vous avez besoin d'un endpoint PUT/PATCH dans le backend
    // qui met à jour un template spécifique. Actuellement, votre backend n'a pas cet endpoint générique.
    // Il faudrait ajouter un `static async updateEmailTemplate(req, res)` dans ModelMailController.js
    // puis appeler `await updateEmailTemplate(campaignId, editingTemplate.id, editingTemplate);` ici.
    console.warn('Template saved locally. Consider adding a backend API call to persist changes.');

    setShowTemplateEditor(false);
    setEditingTemplate(null);
  };

  /**
   * Duplicates an existing email template. This is currently a client-side operation.
   * TODO: If persistence of duplicated templates is needed, a backend API call is required.
   * @param {object} template - The template object to duplicate.
   */
  const duplicateTemplate = useCallback((template) => {
    const duplicated = {
      ...template,
      id: `copy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Nouvel ID unique
      name: `${template.name || template.subject} (Copie)`, // Renomme la copie
      subject: `${template.subject} (Copie)`,
      generated: false, // Une copie n'est plus "générée" automatiquement par l'IA
      imported: template.imported, // Conserve le statut "importé" si c'était le cas
      created_at: new Date().toISOString(), // Utilise created_at pour la date de création de la copie
      lastModified: new Date().toISOString() // Met à jour la date de dernière modification
    };
    setEmailTemplates(prev => [...prev, duplicated]);
    console.warn('Template duplicated locally. Consider adding a backend API call to persist duplications.');
    // TODO: Si vous voulez persister les duplications, vous devrez appeler un endpoint API ici.
    // Ex: await createTemplate(campaignId, duplicated);
  }, []);

  /**
   * Removes a template from the list. Calls backend API for deletion.
   * @param {string} idToRemove - The ID of the template to remove.
   */
  const removeTemplate = async (idToRemove) => {
    try {
      // Appelle l'API backend pour supprimer le template
      await deleteEmailTemplate(campaignId, idToRemove);
      
      // Filtre le template des IDs sélectionnés si nécessaire
      setSelectedTemplates(prevSelected => prevSelected.filter(id => id !== idToRemove));
      // Met à jour l'état local après suppression réussie du backend
      setEmailTemplates(prev => prev.filter(template => template.id !== idToRemove));
      console.log('Modèle supprimé du backend et de l\'état local.');
    } catch (err) {
      console.error('Erreur lors de la suppression du modèle depuis le backend:', err);
      alert('Une erreur est survenue lors de la suppression du modèle.');
    }
  };

  /**
   * Handles the progression to the next step in the wizard.
   * Saves ALL relevant step data to the backend before navigating.
   */
  const handleNext = async () => {
    if (selectedTemplates.length === 0) {
      alert('Veuillez sélectionner au moins un modèle d\'email pour continuer.');
      return;
    }

    try {
      // 1. Sauvegarder les filtres et actualités sélectionnées de l'étape 2
      // `updateCampaignStep2Data` est appelé ici pour s'assurer que les dernières sélections
      // et filtres sont enregistrés, même s'ils ont déjà été envoyés par `toggleNewsSelection`.
      await updateCampaignStep2Data(campaignId, {
        filters: {
          country: selectedCountry,
          theme: selectedTheme,
          credibility: 0 // Assurez-vous que cette valeur est cohérente
        },
        news: selectedNews, // Envoie la liste complète des actualités sélectionnées
        // suggestions: suggestions // Si vous les gérez et voulez les persister
      });

      // 2. Sauvegarder la sélection des templates de l'étape 3
      // Votre backend `selectEmailTemplate` gère une sélection UNIQUE.
      // Si `selectedTemplates` est un TABLEAU (pour la multi-sélection frontend),
      // vous devrez adapter cette logique ou votre backend pour qu'il accepte un tableau d'IDs.
      // Pour l'instant, on n'envoie que le premier template sélectionné, ou aucun.
      const firstSelectedTemplateId = selectedTemplates.length > 0 ? selectedTemplates[0] : null;
      if (firstSelectedTemplateId) {
        await selectEmailTemplate(campaignId, firstSelectedTemplateId);
        console.log(`Template ${firstSelectedTemplateId} sélectionné dans le backend.`);
      } else {
        // Logique pour désélectionner si aucun template n'est sélectionné,
        // si votre backend supporte la désélection explicite.
      }
      
      console.log('Données Actualités & Modèles sauvegardées dans le backend avant de passer à l\'étape suivante.');

      if (onNext) {
        // Passe les données actuelles au composant parent si nécessaire
        onNext(null, { 
          selectedCountry, 
          selectedTheme, 
          selectedNews, 
          emailTemplates, 
          selectedTemplates, 
          activeTab 
        }); 
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde finale des données de campagne pour la navigation:', error);
      alert('Une erreur est survenue lors de la sauvegarde de l\'étape actuelle.');
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
   * This is currently a client-side operation.
   * TODO: Implement backend API call to persist imported templates.
   * @param {Event} event - The file input change event.
   */
  const handleFileImport = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        let importedBody = fileContent;
        let importedSubject = `Modèle importé: ${file.name}`;
        let importedCategory = 'Importé';
        let importedFromName = 'Modèle Importé';

       if (file.type === 'application/json' || file.name.endsWith('.json')) {
          try {
          const jsonData = JSON.parse(fileContent);
            importedSubject = jsonData.subject || importedSubject;
            importedBody = jsonData.body || importedBody;
            importedFromName = jsonData.fromName || importedFromName;
            importedCategory = jsonData.category || importedCategory;
          } catch (error) {
            console.error("Erreur lors de l'analyse du fichier JSON:", error);
            alert("Erreur lors de la lecture du fichier JSON. Assurez-vous qu'il est bien formaté.");
            return;
          }
        }

        const newTemplate = {
          id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // ID unique
          name: file.name, // Utilise le nom du fichier comme nom de template
          subject: importedSubject,
          from: `imported_${Date.now()}@template.com`, // Adresse 'from' unique pour l'importation
          fromName: importedFromName,
          category: importedCategory, // Ancien champ category, map to type if needed
          type: importedCategory, // Utilise le même champ pour type
          body: importedBody, // Ancien champ body, map to content_html if needed
          content_html: importedBody, // Correspond au champ content_html du backend
          content_text: formatNewsContent(importedBody), // Génère le texte brut
          generated: false, // N'est pas généré par l'IA
          imported: true, // Est un template importé
          created_at: new Date().toISOString(), // Date de création
          lastModified: new Date().toISOString() // Date de dernière modification
        };
        setEmailTemplates(prev => [...prev, newTemplate]);
        setActiveTab('templates'); // Passe à l'onglet des templates après importation
        console.warn('Modèle importé localement. Pensez à ajouter un appel API pour persister les templates importés.');
      };
      reader.readAsText(file);
    }
    // Réinitialise la valeur de l'input de fichier pour permettre la sélection du même fichier à nouveau
    event.target.value = ''; 
  }, []);

  // --- NOUVELLE FONCTION POUR OUVRIR LA MODALE DE DÉTAIL D'ACTUALITÉ ---
  const showNewsDetail = useCallback((newsItem) => {
    setSelectedNewsDetail(newsItem);
    setShowNewsDetailModal(true);
    // Ici, vous n'avez normalement pas besoin de re-fetch les détails
    // car les objets news déjà dans `availableNews` ou `selectedNews`
    // devraient contenir toutes les infos nécessaires.
  }, []);

  // Filtrer les templates pour l'affichage (générés vs importés)
  // Ces variables sont recalculées à chaque rendu si emailTemplates change
  // MODIFICATION ICI: Considérez un template comme généré s'il n'est pas explicitement importé.
  const generatedTemplates = emailTemplates.filter(t => !t.imported); 
  const importedTemplatesForDisplay = emailTemplates.filter(t => t.imported);

  // --- LOGS DE DIAGNOSTIC IMPORTANTS ---
  console.log("DEBUG: emailTemplates (état brut):", emailTemplates);
  console.log("DEBUG: generatedTemplates (filtrés):", generatedTemplates);
  console.log("DEBUG: importedTemplatesForDisplay (filtrés):", importedTemplatesForDisplay);
  console.log("DEBUG: selectedTemplates (IDs sélectionnées):", selectedTemplates);


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
                      {/* Affichage des pays disponibles, avec fallback */}
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
                      {/* Affichage des thèmes disponibles */}
                      {Array.isArray(availableThemes) && availableThemes.map(theme => (
                        <option key={theme.id} value={theme.id} className="bg-slate-800">
                          {theme.icon} {theme.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-end">
                    <button
                      onClick={generateEmailTemplates} // Appelle la fonction mise à jour (API backend)
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
                    availableNews.length === 0 ? (
                      <div className="col-span-full text-center text-gray-400 text-lg">
                        Aucune actualité trouvée pour les filtres sélectionnés.
                      </div>
                    ) : (
                      availableNews.map(news => (
                        <div
                          key={news.id || news.url} // Utilise news.id si disponible, sinon news.url comme clé unique
                          className={`p-6 rounded-xl border transition-all duration-300 ${
                            selectedNews.some(n => n.id === news.id) // Vérifie si l'actualité est sélectionnée par son ID
                              ? 'border-cyan-400 bg-cyan-500/10'
                              : 'border-white/20 bg-white/5 hover:bg-white/10 hover:scale-[1.02]'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h5 className="text-white font-medium text-lg mb-2">{news.title}</h5>
                              <p className="text-gray-300 text-base">{news.excerpt || news.description}</p>
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
                            <span>{news.source?.name || news.source || 'Source inconnue'}</span>
                            <span className="flex items-center space-x-2">
                              <Calendar className="inline-block w-4 h-4 mr-1" /> {formatDate(news.publishedAt || news.date)}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Empêche la propagation du clic sur la carte
                                  showNewsDetail(news);
                                }}
                                className="ml-3 p-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all duration-200 hover:scale-110"
                                title="Voir les détails"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {/* Case à cocher pour la sélection */}
                              <div
                                className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                                  selectedNews.some(n => n.id === news.id)
                                    ? 'bg-cyan-400 border-cyan-400'
                                    : 'border-white/30'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation(); // Empêche la propagation du clic sur la carte
                                  toggleNewsSelection(news); // Passe l'objet actualité complet
                                }}
                              >
                                {selectedNews.some(n => n.id === news.id) && (
                                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                )}
                              </div>
                            </span>
                          </div>
                        </div>
                      ))
                    )
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

                {isLoadingTemplates ? (
                  <div className="text-center text-white text-lg">Chargement des modèles...</div>
                ) : emailTemplates.length === 0 ? (
                    <div className="text-center text-gray-400 text-lg">
                      Aucun modèle d'email disponible. Veuillez générer des modèles depuis l'onglet "Actualités" ou importer un fichier.
                    </div>
                  ) : (
                    <>
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
                                        <span className="text-base text-gray-400">De: {template.fromName || 'N/A'}</span>
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                          template.type === 'security_alert' ? 'bg-red-500/20 text-red-300' :
                                          template.type === 'system_notification' ? 'bg-blue-500/20 text-blue-300' :
                                          template.type === 'urgent_update' ? 'bg-yellow-500/20 text-yellow-300' :
                                          template.type === 'verification' ? 'bg-purple-500/20 text-purple-300' :
                                          'bg-gray-500/20 text-gray-300'
                                        }`}>
                                          {template.type}
                                        </span>
                                        {template.sophistication_level && (
                                          <span className="text-sm text-gray-400">
                                            Sophistication: {template.sophistication_level}
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
                                      onClick={() => removeTemplate(template.id)}
                                      className="p-3 text-red-400 rounded-lg transition-all duration-200 hover:bg-red-500/20 hover:scale-110"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-400">
                                  Modifié: {new Date(template.created_at || template.lastModified).toLocaleDateString('fr-FR')}
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
                                      {/* Utilise 'name' pour l'affichage si disponible, sinon 'subject' */}
                                      <h6 className="text-white font-medium text-lg">{template.name || template.subject}</h6>
                                      <div className="flex flex-wrap items-center space-x-3 mt-2">
                                        <span className="text-base text-gray-400">De: {template.fromName || 'N/A'}</span>
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                          {template.category || template.type || 'Importé'}
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
                                      onClick={() => removeTemplate(template.id)}
                                      className="p-3 text-red-400 rounded-lg transition-all duration-200 hover:bg-red-500/20 hover:scale-110"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-400">
                                  Modifié: {new Date(template.created_at || template.lastModified).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
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
                  dangerouslySetInnerHTML={{ __html: previewEmail.body }} // Utilise previewEmail.body pour le HTML
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
                  // Utilise editingTemplate.subject qui est le champ de la BDD
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Name field (ajouté pour les templates importés ou les copies) */}
              {(editingTemplate.imported || !editingTemplate.generated) && (
                <div>
                  <label htmlFor="edit-name" className="block text-gray-700 text-sm font-bold mb-2">Nom du modèle (pour l'affichage):</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editingTemplate.name || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              {/* Category/Type field */}
              <div>
                <label htmlFor="edit-category" className="block text-gray-700 text-sm font-bold mb-2">Type de modèle:</label>
                <input
                  id="edit-category"
                  type="text"
                  // Assure la cohérence entre 'type' du backend et 'category' de l'ancien frontend si besoin
                  value={editingTemplate.type || editingTemplate.category || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, type: e.target.value, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Sophistication Level (pour les templates générés, ou si pertinent pour les autres) */}
              {editingTemplate.generated && (
                <div>
                  <label htmlFor="edit-sophistication" className="block text-gray-700 text-sm font-bold mb-2">Niveau de Sophistication:</label>
                  <select
                    id="edit-sophistication"
                    value={editingTemplate.sophistication_level || 'medium'}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, sophistication_level: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              )}
              {/* HTML Content field */}
              <div>
                <label htmlFor="edit-body" className="block text-gray-700 text-sm font-bold mb-2">Contenu HTML:</label>
                <textarea
                  id="edit-body"
                  // Utilise content_html (du backend) ou body (de l'ancien state frontend si persisté)
                  value={editingTemplate.content_html || editingTemplate.body || ''}
                  onChange={(e) => setEditingTemplate({ 
                    ...editingTemplate, 
                    content_html: e.target.value, 
                    body: e.target.value // Garde body pour la compatibilité si utilisé ailleurs
                  })}
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

      {/* News Detail Modal */}
      {showNewsDetailModal && selectedNewsDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-5/6 flex flex-col overflow-hidden">
            {/* Header de la modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Détail de l'Actualité</h3>
              </div>
              <button 
                onClick={() => setShowNewsDetailModal(false)} 
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenu de la modal */}
            <div className="flex-1 overflow-auto">
              {isLoadingNewsDetail ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des détails...</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Image principale */}
                  {getNewsImage(selectedNewsDetail) && (
                    <div className="relative">
                      <img 
                        src={getNewsImage(selectedNewsDetail)} 
                        alt={selectedNewsDetail.title} 
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.style.display = 'none'; // Masquer l'image si elle ne charge pas
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-lg">
                        <div className="text-white text-sm">
                          Source: {selectedNewsDetail.source?.name || selectedNewsDetail.source || 'Source inconnue'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Titre principal */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
                      {selectedNewsDetail.title}
                    </h1>
                  </div>

                  {/* Métadonnées */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          <strong>Date:</strong> {formatDate(selectedNewsDetail.publishedAt || selectedNewsDetail.date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          <strong>Source:</strong> {selectedNewsDetail.source?.name || selectedNewsDetail.source || 'Source inconnue'}
                        </span>
                      </div>

                      {selectedNewsDetail.author && (
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            <strong>Auteur:</strong> {getAuthorInfo(selectedNewsDetail)}
                          </span>
                        </div>
                      )}

                      {selectedNewsDetail.credibility && (
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedNewsDetail.credibility >= 8 ? 'bg-green-500' :
                            selectedNewsDetail.credibility >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-gray-600">
                            <strong>Crédibilité:</strong> {selectedNewsDetail.credibility}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description/Excerpt si différent du contenu principal */}
                  {selectedNewsDetail.description && formatNewsContent(selectedNewsDetail) !== selectedNewsDetail.description && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Résumé</h3>
                      <p className="text-gray-700 leading-relaxed italic">
                        {selectedNewsDetail.description}
                      </p>
                    </div>
                  )}

                  {/* Contenu principal */}
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Contenu de l'article</h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      {formatNewsContent(selectedNewsDetail)}
                    </div>
                  </div>

                  {/* Tags/Catégories si disponibles */}
                  {selectedNewsDetail.category && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Catégorie</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                          {selectedNewsDetail.category}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Informations techniques pour NewsAPI */}
                  {(selectedNewsDetail.urlToImage || selectedNewsDetail.publishedAt || selectedNewsDetail.source?.id) && (
                    <details className="bg-gray-50 p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                        Informations techniques
                      </summary>
                      <div className="mt-3 space-y-2 text-sm text-gray-600">
                        {selectedNewsDetail.publishedAt && (
                          <div><strong>Date de publication:</strong> {selectedNewsDetail.publishedAt}</div>
                        )}
                        {selectedNewsDetail.urlToImage && (
                          <div><strong>URL de l'image:</strong> 
                            <a href={selectedNewsDetail.urlToImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                              Voir l'image
                            </a>
                          </div>
                        )}
                        {selectedNewsDetail.source?.id && (
                          <div><strong>ID Source:</strong> {selectedNewsDetail.source.id}</div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Footer de la modal */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {/* Bouton pour sélectionner/désélectionner l'actualité */}
                <button
                  onClick={() => toggleNewsSelection(selectedNewsDetail)} // Passe l'objet actualité complet
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    selectedNews.some(n => n.id === selectedNewsDetail.id) // Vérifie si l'actualité est sélectionnée par son ID
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedNews.some(n => n.id === selectedNewsDetail.id)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-400'
                  }`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>{selectedNews.some(n => n.id === selectedNewsDetail.id) ? 'Sélectionnée' : 'Sélectionner'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {/* Lien vers l'article original */}
                {getNewsLink(selectedNewsDetail) && (
                  <a
                    href={getNewsLink(selectedNewsDetail)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                  >
                    <span>Lire l'article complet</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                
                {/* Bouton fermer */}
                <button
                  onClick={() => setShowNewsDetailModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
   </div>
  );
};

export default ModelMail;
