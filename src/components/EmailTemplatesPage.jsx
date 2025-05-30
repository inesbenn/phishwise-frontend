import React, { useState } from 'react';
import { 
  Mail, 
  Upload, 
  Wand2, 
  Eye, 
  ChevronLeft, 
  ArrowRight, 
  FileText, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  Edit3,
  Trash2,
  Plus,
  Save,
  X
} from 'lucide-react';

const EmailTemplatesPage = ({ onNext, onBack, selectedData }) => {
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [importedTemplates, setImportedTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailMode, setEmailMode] = useState('generate'); // 'generate' or 'import'
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedContent, setEditedContent] = useState('');

  // Templates d'exemple pré-chargés
  const predefinedTemplates = [
    {
      id: 'template-1',
      name: 'Newsletter Professionnelle',
      description: 'Template moderne pour newsletters d\'entreprise',
      category: 'Business',
      subject: 'Votre newsletter hebdomadaire',
      content: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <header style="background: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Newsletter</h1>
          </header>
          <main style="padding: 30px; background: white;">
            <h2 style="color: #2563eb;">Titre Principal</h2>
            <p>Contenu principal de votre newsletter...</p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Point Important</h3>
              <p>Informations clés à retenir...</p>
            </div>
          </main>
          <footer style="background: #1f2937; color: white; padding: 20px; text-align: center;">
            <p>© 2024 Votre Entreprise</p>
          </footer>
        </div>
      `,
      createdAt: '2024-05-20'
    },
    {
      id: 'template-2',
      name: 'Actualités Économiques',
      description: 'Template spécialisé pour l\'analyse économique',
      category: 'Analyse',
      subject: 'Analyse économique hebdomadaire',
      content: `
        <div style="max-width: 650px; margin: 0 auto; font-family: 'Segoe UI', sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px;">
            <h1 style="margin: 0; font-size: 28px;">Analyse Économique</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Insights et tendances du marché</p>
          </div>
          <div style="padding: 30px; background: white;">
            <div style="border-left: 4px solid #667eea; padding-left: 20px; margin-bottom: 25px;">
              <h2 style="color: #333; margin-top: 0;">Analyse Principale</h2>
              <p>Votre analyse détaillée ici...</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px;">
              <h3 style="color: #475569;">Points Clés</h3>
              <ul style="color: #64748b;">
                <li>Point d'analyse 1</li>
                <li>Point d'analyse 2</li>
                <li>Point d'analyse 3</li>
              </ul>
            </div>
          </div>
        </div>
      `,
      createdAt: '2024-05-18'
    }
  ];

  // Données par défaut si selectedData n'est pas fourni
  const defaultSelectedData = {
    selectedNews: {
      id: 1,
      title: "L'intelligence artificielle révolutionne l'industrie pharmaceutique",
      excerpt: "Les dernières avancées en IA permettent d'accélérer la découverte de nouveaux médicaments...",
      source: "Le Figaro",
      theme: "tech"
    },
    selectedSubject: {
      id: "topic-1-1",
      title: "Impact de l'IA sur l'emploi dans le secteur pharmaceutique",
      description: "Analyse des transformations du marché du travail liées à l'intelligence artificielle"
    }
  };

  // Récupération des données de l'étape 2 (actualité + sujet sélectionnés)
  const stepTwoData = selectedData || defaultSelectedData;

  const generateEmailFromSubject = async () => {
    setIsGenerating(true);
    
    // Simulation d'appel API
    setTimeout(() => {
      const generatedContent = {
        id: 'generated-' + Date.now(),
        name: 'Email Généré',
        subject: `Analyse : ${stepTwoData.selectedSubject.title}`,
        content: `
          <div style="max-width: 700px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <header style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 600;">Analyse d'Actualité</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Basée sur l'actualité sélectionnée</p>
            </header>
            
            <div style="background: white; padding: 35px; border: 1px solid #e5e7eb;">
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">🗞️ Actualité de référence</h3>
                <p style="margin: 0; color: #374151; font-weight: 500;">${stepTwoData.selectedNews.title}</p>
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">Source: ${stepTwoData.selectedNews.source}</p>
              </div>

              <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 22px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">
                ${stepTwoData.selectedSubject.title}
              </h2>

              <div style="color: #374151; line-height: 1.7; font-size: 16px;">
                <p><strong>Contexte :</strong> ${stepTwoData.selectedSubject.description}</p>
                
                <p>L'essor de l'intelligence artificielle dans l'industrie pharmaceutique représente une transformation majeure qui redéfinit les pratiques professionnelles et les besoins en compétences.</p>

                <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0;">Points d'analyse clés :</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Automatisation des processus de recherche et développement</li>
                    <li style="margin-bottom: 8px;">Évolution des profils métiers vers plus de technicité</li>
                    <li style="margin-bottom: 8px;">Nécessité de formation et reconversion des équipes</li>
                    <li style="margin-bottom: 8px;">Opportunités de création de nouveaux emplois spécialisés</li>
                  </ul>
                </div>

                <p><strong>Implications :</strong> Cette transformation nécessite une approche proactive de la gestion des ressources humaines, avec un focus sur l'accompagnement au changement et le développement des compétences numériques.</p>
              </div>

              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
                <p style="margin: 0; color: #0369a1; font-style: italic;">
                  "L'innovation technologique ne remplace pas l'expertise humaine, elle la complète et la valorise."
                </p>
              </div>
            </div>

            <footer style="background: #f8fafc; padding: 25px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Analyse générée automatiquement • ${new Date().toLocaleDateString('fr-FR')}
              </p>
            </footer>
          </div>
        `,
        type: 'generated',
        basedOn: stepTwoData
      };
      
      setGeneratedEmail(generatedContent);
      setCurrentEmail(generatedContent);
      setIsGenerating(false);
    }, 2500);
  };

  const handleTemplateImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newTemplate = {
          id: 'imported-' + Date.now(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          description: 'Template importé',
          category: 'Importé',
          subject: 'Sujet du template importé',
          content: e.target.result,
          createdAt: new Date().toISOString().split('T')[0],
          type: 'imported'
        };
        setImportedTemplates([...importedTemplates, newTemplate]);
      };
      reader.readAsText(file);
    }
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setCurrentEmail(template);
  };

  const viewEmailPreview = () => {
    if (currentEmail) {
      setEditedSubject(currentEmail.subject);
      setEditedContent(currentEmail.content);
      setShowEmailPreview(true);
      setIsEditing(false);
    }
  };

  const toggleEditMode = () => {
    if (!isEditing) {
      setEditedSubject(currentEmail.subject);
      setEditedContent(currentEmail.content);
    }
    setIsEditing(!isEditing);
  };

  const saveEditedEmail = () => {
    const updatedEmail = {
      ...currentEmail,
      subject: editedSubject,
      content: editedContent,
      lastModified: new Date().toISOString()
    };
    
    setCurrentEmail(updatedEmail);
    
    // Si c'est un email généré, on met à jour generatedEmail
    if (currentEmail.type === 'generated') {
      setGeneratedEmail(updatedEmail);
    }
    
    setIsEditing(false);
    alert('Email modifié avec succès !');
  };

  const cancelEdit = () => {
    setEditedSubject(currentEmail.subject);
    setEditedContent(currentEmail.content);
    setIsEditing(false);
  };

  const handleNext = () => {
    if (!currentEmail) {
      alert('Veuillez générer un email ou sélectionner un template.');
      return;
    }
    
    onNext({ 
      selectedEmail: currentEmail,
      emailData: {
        subject: currentEmail.subject,
        content: currentEmail.content,
        basedOn: stepTwoData,
        type: currentEmail.type || 'template'
      }
    });
  };

  const allTemplates = [...predefinedTemplates, ...importedTemplates];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modèles d'Emails</h1>
              <p className="text-gray-600">Générez un email basé sur votre sujet ou importez un template existant</p>
            </div>
          </div>

          {/* Context Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Contexte sélectionné (Étape 2)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Actualité</span>
                </div>
                <p className="text-sm text-blue-800 font-medium">{stepTwoData.selectedNews.title}</p>
                <p className="text-xs text-blue-600 mt-1">Source: {stepTwoData.selectedNews.source}</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-900">Sujet d'analyse</span>
                </div>
                <p className="text-sm text-purple-800 font-medium">{stepTwoData.selectedSubject.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Choisissez votre approche</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generate Option */}
            <div 
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                emailMode === 'generate' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => setEmailMode('generate')}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Générer avec IA</h3>
                  <p className="text-sm text-gray-600">Basé sur votre sujet sélectionné</p>
                </div>
              </div>
              
              <button
                onClick={generateEmailFromSubject}
                disabled={isGenerating || emailMode !== 'generate'}
                className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  emailMode === 'generate'
                    ? isGenerating 
                      ? 'bg-purple-300 text-white cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Génération en cours...' : 'Générer l\'email'}
              </button>

              {generatedEmail && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Email généré avec succès</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Sujet: {generatedEmail.subject}</p>
                </div>
              )}
            </div>

            {/* Import Option */}
            <div 
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                emailMode === 'import' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setEmailMode('import')}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Importer un template</h3>
                  <p className="text-sm text-gray-600">Utilisez un modèle existant</p>
                </div>
              </div>
              
              <label className={`block w-full px-4 py-3 rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors ${
                emailMode === 'import'
                  ? 'border-blue-400 bg-blue-50 hover:bg-blue-100'
                  : 'border-gray-300 text-gray-500 cursor-not-allowed'
              }`}>
                <input
                  type="file"
                  accept=".html,.txt,.eml"
                  onChange={handleTemplateImport}
                  className="hidden"
                  disabled={emailMode !== 'import'}
                />
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Choisir un fichier</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">HTML, TXT, EML</p>
              </label>
            </div>
          </div>
        </div>

        {/* Templates Library */}
        {emailMode === 'import' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Bibliothèque de templates</h2>
              <span className="text-sm text-gray-500">{allTemplates.length} template(s) disponible(s)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => selectTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {template.category}
                        </span>
                        {template.type === 'imported' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            Importé
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Créé le {template.createdAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Section */}
        {currentEmail && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Email sélectionné</h2>
                  <p className="text-gray-600 text-sm">{currentEmail.name || 'Email généré'}</p>
                </div>
              </div>
              
              <button
                onClick={viewEmailPreview}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Aperçu complet
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet:</label>
                <p className="text-gray-900 font-medium">{currentEmail.subject}</p>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Aperçu du contenu:</label>
                <div 
                  className="bg-white border rounded-lg p-4 max-h-40 overflow-y-auto"
                  dangerouslySetInnerHTML={{ 
                    __html: currentEmail.content.substring(0, 300) + '...' 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
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
            disabled={!currentEmail}
            className={`px-8 py-4 rounded-xl flex items-center gap-2 text-lg font-medium shadow-lg hover:shadow-xl transition-all ${
              currentEmail
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Voir le résultat
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Email Preview Modal with Edit Functionality */}
        {showEmailPreview && currentEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">Aperçu de l'email</h3>
                  {isEditing && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      Mode édition
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleEditMode}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      isEditing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </button>
                  <button
                    onClick={() => setShowEmailPreview(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-6">
                    {/* Subject Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet de l'email
                      </label>
                      <input
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                        placeholder="Entrez le sujet de l'email"
                      />
                    </div>

                    {/* Content Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contenu HTML de l'email
                      </label>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        placeholder="Collez ou modifiez le contenu HTML de votre email ici..."
                      />
                    </div>

                    {/* Live Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aperçu en temps réel
                      </label>
                      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-80 overflow-y-auto">
                        <div 
                          dangerouslySetInnerHTML={{ __html: editedContent }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Sujet:</strong> 
                        <span className="font-medium text-gray-900 ml-2">{currentEmail.subject}</span>
                      </p>
                    </div>
                    
                    <div 
                      className="border rounded-lg p-6 bg-white min-h-[400px]"
                      dangerouslySetInnerHTML={{ __html: currentEmail.content }}
                    />
                  </div>
                )}
              </div>
              
              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                {isEditing ? (
                  <>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={saveEditedEmail}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowEmailPreview(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Utiliser cet email
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplatesPage;