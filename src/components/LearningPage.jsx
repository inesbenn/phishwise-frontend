import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Video, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Eye, 
  ArrowLeft,
  ArrowRight,
  FileText,
  Play,
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3,
  Settings,
  Library,
  PlusCircle,
  Search,
  Filter,
  Clock,
  Award,
  Loader2
} from 'lucide-react';

const LearningPage = ({ campaignId, onNext, onBack }) => {
  // ========== FONCTIONS API INTÉGRÉES ==========
  const API_BASE_URL = 'http://localhost:3000/api';
  
  // Fonction utilitaire pour les appels API
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Fonctions API
  const getAllFormations = () => {
    return apiCall('/learning/formations');
  };

  const createFormation = (formationData) => {
    return apiCall('/learning/formations', {
      method: 'POST',
      body: JSON.stringify(formationData),
    });
  };

  const getCampaignFormations = (campaignId) => {
    return apiCall(`/campaigns/${campaignId}/step6`);
  };

  const assignFormationsToCampaign = (campaignId, formationIds, options = {}) => {
    return apiCall(`/campaigns/${campaignId}/assign-existing-formations`, {
      method: 'POST',
      body: JSON.stringify({
        formationIds,
        mandatory: options.mandatory !== undefined ? options.mandatory : true,
        dueDate: options.dueDate || null
      }),
    });
  };

  const saveCampaignStep6 = (campaignId, step6Data) => {
    return apiCall(`/campaigns/${campaignId}/step/6`, {
      method: 'PUT',
      body: JSON.stringify(step6Data),
    });
  };

  const createWizardFormation = (campaignId, formationData, modules, assignmentOptions = {}) => {
    return apiCall(`/campaigns/${campaignId}/create-wizard-formation`, {
      method: 'POST',
      body: JSON.stringify({
        formationData,
        modules,
        assignmentOptions
      }),
    });
  };
  // ========== ÉTAT DU COMPOSANT ==========
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' ou 'create'
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // État pour les formations existantes
  const [existingFormations, setExistingFormations] = useState([]);
  const [loadingFormations, setLoadingFormations] = useState(true);
  
  // État pour les formations assignées
  const [assignedFormations, setAssignedFormations] = useState([]);
  
  // État pour la création de nouvelles formations
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  
  // Configuration générale de la page d'apprentissage
  const [learningPageData, setLearningPageData] = useState({
    title: "Formation Sécurité - Sensibilisation au Phishing",
    description: "Cette formation vous aidera à reconnaître et éviter les tentatives de phishing.",
    estimatedTime: "15-20 minutes"
  });

  // Effet pour charger les données au montage
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    
    loadExistingFormations();
    loadAssignedFormations();
  }, [campaignId]);

  // ========== FONCTIONS DE CHARGEMENT DES DONNÉES ==========
  
  const loadExistingFormations = async () => {
    try {
      setLoadingFormations(true);
      const response = await getAllFormations();
      console.log('Formations chargées:', response);
      setExistingFormations(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      // Utiliser des données de démonstration si l'API n'est pas disponible
      setExistingFormations([
        {
          _id: 'demo-1',
          title: 'Introduction au Phishing',
          description: 'Formation de base sur la reconnaissance des tentatives de phishing',
          estimatedTime: '15 minutes',
          difficulty: 'débutant',
          category: 'phishing',
          modules: [
            { id: 1, title: 'Qu\'est-ce que le phishing ?', type: 'text' },
            { id: 2, title: 'Reconnaître les signaux d\'alerte', type: 'video' },
            { id: 3, title: 'Quiz de validation', type: 'quiz' }
          ],
          badge: 'Expert Phishing'
        },
        {
          _id: 'demo-2',
          title: 'Sécurité des mots de passe',
          description: 'Bonnes pratiques pour créer et gérer des mots de passe sécurisés',
          estimatedTime: '12 minutes',
          difficulty: 'débutant',
          category: 'password',
          modules: [
            { id: 1, title: 'Création de mots de passe forts', type: 'text' },
            { id: 2, title: 'Gestionnaires de mots de passe', type: 'video' }
          ],
          badge: 'Guardian des Mots de Passe'
        },
        {
          _id: 'demo-3',
          title: 'Ingénierie sociale avancée',
          description: 'Techniques avancées utilisées par les attaquants et comment s\'en protéger',
          estimatedTime: '25 minutes',
          difficulty: 'avancé',
          category: 'social',
          modules: [
            { id: 1, title: 'Techniques d\'ingénierie sociale', type: 'text' },
            { id: 2, title: 'Cas d\'étude réels', type: 'video' },
            { id: 3, title: 'Simulation d\'attaque', type: 'quiz' },
            { id: 4, title: 'Test final', type: 'quiz' }
          ],
          badge: 'Expert en Sécurité Sociale'
        }
      ]);
    } finally {
      setLoadingFormations(false);
    }
  };

  const loadAssignedFormations = async () => {
    try {
      const response = await getCampaignFormations(campaignId);
      console.log('Formations assignées chargées:', response);
      setAssignedFormations(response.data?.assignedFormations || []);
    } catch (error) {
      console.error('Erreur lors du chargement des formations assignées:', error);
      // Initialiser avec un tableau vide en cas d'erreur
      setAssignedFormations([]);
    }
  };

  // ========== GESTION DES FORMATIONS EXISTANTES ==========
  
  const handleAssignFormation = async (formation) => {
    try {
      setLoading(true);
      const updatedAssigned = [...assignedFormations];
      
      // Vérifier si déjà assignée
      const isAlreadyAssigned = updatedAssigned.some(af => 
        af.formationId === formation._id || af.formationId._id === formation._id
      );
      
      if (isAlreadyAssigned) {
        alert('Cette formation est déjà assignée à cette campagne');
        return;
      }
      
      // Ajouter à la liste locale
      updatedAssigned.push({
        formationId: formation,
        assignedAt: new Date(),
        mandatory: true,
        order: updatedAssigned.length
      });
      
      setAssignedFormations(updatedAssigned);
      
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignFormation = (formationId) => {
    const updated = assignedFormations.filter(af => 
      (af.formationId._id || af.formationId) !== formationId
    );
    setAssignedFormations(updated);
  };

  // ========== GESTION DE LA CRÉATION DE NOUVELLES FORMATIONS ==========
  
  const moduleTypes = [
    { 
      type: 'text', 
      icon: FileText, 
      name: 'Contenu Texte',
      description: 'Ajouter du texte, des paragraphes, des listes'
    },
    { 
      type: 'video', 
      icon: Video, 
      name: 'Vidéo',
      description: 'Intégrer une vidéo YouTube ou uploader un fichier'
    },
    { 
      type: 'quiz', 
      icon: HelpCircle, 
      name: 'Quiz',
      description: 'Créer un questionnaire avec choix multiples'
    }
  ];
const createDefaultModule = (type) => {
    const baseModule = {
      id: Date.now() + Math.random(),
      type,
      title: '',
      order: modules.length,
      required: true
    };
switch (type) {
      case 'text':
        return {
          ...baseModule,
          title: 'Nouveau module texte',
          content: { text: '', formatting: 'paragraph' }
        };
      case 'video':
        return {
          ...baseModule,
          title: 'Nouveau module vidéo',
          content: {
            videoUrl: '',
            videoType: 'youtube',
            duration: '',
            transcript: ''
          }
        };
      case 'quiz':
        return {
          ...baseModule,
          title: 'Nouveau quiz',
          content: {
            questions: [{
              id: 1,
              question: '',
              type: 'multiple',
              options: ['', '', '', ''],
              correctAnswer: 0,
              explanation: ''
            }],
            passingScore: 70
          }
        };
      default:
        return baseModule;
    }
  };
const addModule = (type) => {
    const newModule = createDefaultModule(type);
    setModules([...modules, newModule]);
    setActiveModule(newModule.id);
    setIsEditing(true);
  };

const deleteModule = (moduleId) => {
setModules(modules.filter(m => m.id !== moduleId));
    if (activeModule === moduleId) {
      setActiveModule(null);
      setIsEditing(false);
    }
  };
const updateModule = (moduleId, updates) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, ...updates } : m
    ));
  };

  // ========== SAUVEGARDE ==========
  
  const saveLearningConfiguration = async () => {
    setLoading(true);
    try {
      // Simulation d'une sauvegarde si l'API n'est pas disponible
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Préparer les données à sauvegarder
      const step6Data = {
        assignedFormations: assignedFormations.map((af, index) => ({
          formationId: af.formationId._id || af.formationId,
          assignedAt: af.assignedAt || new Date(),
          mandatory: af.mandatory !== undefined ? af.mandatory : true,
          order: index,
          dueDate: af.dueDate || null
        })),
        redirectToLearning: true,
        requireAuthentication: false,
        sessionDuration: 3600
      };

      try {
        // Tenter de sauvegarder via l'API
        await saveCampaignStep6(campaignId, step6Data);
        console.log('Configuration sauvegardée via API');
      } catch (apiError) {
        console.log('API non disponible, sauvegarde en mode démo');
      }
      
      // Si on a des modules créés, créer une nouvelle formation
      if (modules.length > 0) {
        const newFormationData = {
          title: learningPageData.title,
          description: learningPageData.description,
          estimatedTime: learningPageData.estimatedTime,
          difficulty: 'débutant',
          category: 'phishing'
        };

        try {
          // Tenter de créer via l'API
          await createWizardFormation(campaignId, newFormationData, modules.map((module, index) => ({
            id: index + 1,
            title: module.title,
            type: module.type,
            content: module.content,
            duration: module.duration || '5 minutes',
            required: module.required
          })));
          console.log('Formation créée via API');
        } catch (apiError) {
          console.log('Formation créée en mode démo');
          // Ajouter la formation créée aux formations assignées en mode démo
          const demoFormation = {
            _id: `demo-created-${Date.now()}`,
            title: learningPageData.title,
            description: learningPageData.description,
            estimatedTime: learningPageData.estimatedTime,
            difficulty: 'débutant',
            category: 'phishing',
            modules: modules
          };
          
          const newAssignment = {
            formationId: demoFormation,
            assignedAt: new Date(),
            mandatory: true,
            order: assignedFormations.length
          };
          
          setAssignedFormations([...assignedFormations, newAssignment]);
        }
      }
      
      console.log('Configuration sauvegardée avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ========== FILTRES ==========
  
  const filteredFormations = existingFormations.filter(formation => {
    const matchesSearch = formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || formation.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // ========== COMPOSANTS D'ÉDITION (RÉUTILISÉS) ==========
  
  const ModuleListItem = ({ module, index }) => {
    const IconComponent = moduleTypes.find(t => t.type === module.type)?.icon || FileText;
    
    return (
      <div 
        className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-3 cursor-pointer transition-all duration-200 hover:bg-white/15 ${
          activeModule === module.id ? 'ring-2 ring-cyan-400' : ''
        }`}
        onClick={() => setActiveModule(module.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{module.title}</h3>
              <p className="text-xs text-gray-400">
                {moduleTypes.find(t => t.type === module.type)?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {module.required && (
              <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/20">
                Obligatoire
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteModule(module.id);
              }}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };
    const TextModuleEditor = ({ module }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-white text-lg font-medium mb-3">Titre du module</label>
        <input
          type="text"
          value={module.title}
          onChange={(e) => updateModule(module.id, { title: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
          placeholder="Titre du module..."
        />
      </div>
      <div>
        <label className="block text-white text-lg font-medium mb-3">Contenu</label>
        <textarea
          value={module.content.text}
          onChange={(e) => updateModule(module.id, { 
            content: { ...module.content, text: e.target.value }
          })}
          rows={6}
          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
          placeholder="Saisissez le contenu de votre module..."
        />
      </div>
    </div>
  );

const VideoModuleEditor = ({ module }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-white text-lg font-medium mb-3">Titre du module</label>
        <input
          type="text"
          value={module.title}
          onChange={(e) => updateModule(module.id, { title: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
          placeholder="Titre du module..."
        />
      </div>
      <div>
        <label className="block text-white text-lg font-medium mb-3">URL de la vidéo</label>
        <input
          type="url"
          value={module.content.videoUrl}
          onChange={(e) => updateModule(module.id, { 
            content: { ...module.content, videoUrl: e.target.value }
          })}
          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>
      <div>
        <label className="block text-white text-lg font-medium mb-3">Durée estimée</label>
        <input
          type="text"
          value={module.content.duration}
          onChange={(e) => updateModule(module.id, { 
            content: { ...module.content, duration: e.target.value }
          })}
          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
          placeholder="ex: 5 minutes"
        />
      </div>
    </div>
  );
const QuizModuleEditor = ({ module }) => {
    const addQuestion = () => {
      const newQuestion = {
        id: Date.now(),
        question: '',
        type: 'multiple',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      };
      updateModule(module.id, {
        content: {
          ...module.content,
          questions: [...module.content.questions, newQuestion]
        }
      });
    };
const updateQuestion = (questionId, updates) => {
      const updatedQuestions = module.content.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      );
      updateModule(module.id, {
        content: { ...module.content, questions: updatedQuestions }
      });
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-white text-lg font-medium mb-3">Titre du quiz</label>
          <input
            type="text"
            value={module.title}
            onChange={(e) => updateModule(module.id, { title: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
            placeholder="Titre du quiz..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-white">Questions</h4>
            <button
              onClick={addQuestion}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une question</span>
            </button>
          </div>

          {module.content.questions.map((question, qIndex) => (
            <div key={question.id} className="bg-white/5 rounded-lg p-4 space-y-4 mb-4 border border-white/10">
              <div className="flex items-center justify-between">
                <h5 className="text-white font-semibold text-base">Question {qIndex + 1}</h5>
                <button
                  onClick={() => {
                    const updatedQuestions = module.content.questions.filter(q => q.id !== question.id);
                    updateModule(module.id, {
                      content: { ...module.content, questions: updatedQuestions }
                    });
                  }}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <input
                type="text"
                value={question.question}
                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                placeholder="Saisissez votre question..."
              />

              <div className="space-y-2">
                <label className="block text-sm text-gray-300 font-medium">Options de réponse</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() => updateQuestion(question.id, { correctAnswer: oIndex })}
                      className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 bg-white/10 border-white/20"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[oIndex] = e.target.value;
                        updateQuestion(question.id, { options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                      placeholder={`Option ${oIndex + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm text-gray-300 font-medium mb-2">Explication (optionnel)</label>
                <textarea
                  value={question.explanation}
                  onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                  placeholder="Explication de la bonne réponse..."
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-white text-lg font-medium mb-3">Score minimum requis (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={module.content.passingScore}
            onChange={(e) => updateModule(module.id, { 
              content: { ...module.content, passingScore: parseInt(e.target.value) }
            })}
            className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
          />
        </div>
      </div>
    );
  };

  // ========== COMPOSANT PRINCIPAL ==========

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto"
      style={{ margin: 0, padding: 0, top: 0, left: 0 }}
    >
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 w-full">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                PhishWise
              </h1>
              <span className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">
                Nouvelle Campagne
              </span>
            </div>
            <div className="w-9 h-9 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-base">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Création de Campagne</h2>
              <span className="text-base text-gray-300">Étape 6 sur 7</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2.5 rounded-full w-[85.71%] transition-all duration-500"></div>
            </div>

            <div className="grid grid-cols-7 gap-3 mt-3 text-xs text-gray-400">
              {['Paramètres', 'Cibles', 'Modèles', "Page d'atterrissage", 'SMTP', 'Formation', 'Finaliser'].map((step, i) => (
                <span
                  key={step}
                  className={`text-center font-medium ${i === 5 ? 'text-cyan-400' : ''}`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1.5">Page d'Apprentissage</h3>
              <p className="text-base text-gray-300">
                Configurez les modules d'apprentissage pour sensibiliser vos employés
              </p>
            </div>
          </div>

          {/* Onglets */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('existing')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'existing'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Library className="w-4 h-4" />
                <span>Formations Existantes</span>
                <span className="bg-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded-full text-xs">
                  {existingFormations.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'create'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-400/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Créer Nouvelle Formation</span>
              </button>
            </div>
          </div>

          {/* Contenu selon l'onglet actif */}
          {activeTab === 'existing' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Colonne des formations existantes */}
              <div className="lg:col-span-2">
                {/* Barre de recherche et filtres */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-5">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Rechercher une formation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>
                    <div className="relative">
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      >
                        <option value="all">Toutes catégories</option>
                        <option value="phishing">Phishing</option>
                        <option value="password">Mots de passe</option>
                        <option value="social">Ingénierie sociale</option>
                        <option value="general">Général</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Liste des formations existantes */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Formations Disponibles ({filteredFormations.length})
                  </h3>
                  
                  {loadingFormations ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                      <span className="ml-2 text-gray-300">Chargement des formations...</span>
                    </div>
                  ) : filteredFormations.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-base text-gray-400">Aucune formation trouvée</p>
                      <p className="text-sm text-gray-500 mt-1.5">Essayez de modifier vos critères de recherche</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredFormations.map((formation) => (
                        <div key={formation._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-white font-semibold text-base">{formation.title}</h4>
                                <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20">
                                  {formation.category}
                                </span>
                                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/20">
                                  {formation.difficulty}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm mb-3">{formation.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formation.estimatedTime}
                                </span>
                                <span className="flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  {formation.modules?.length || 0} modules
                                </span>
                                {formation.badge && (
                                  <span className="flex items-center">
                                    <Award className="w-3 h-3 mr-1" />
                                    Badge disponible
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <button
                                onClick={() => handleAssignFormation(formation)}
                                disabled={assignedFormations.some(af => 
                                  (af.formationId._id || af.formationId) === formation._id
                                )}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  assignedFormations.some(af => (af.formationId._id || af.formationId) === formation._id)
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/20 cursor-not-allowed'
                                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/30'
                                }`}
                              >
                                {assignedFormations.some(af => (af.formationId._id || af.formationId) === formation._id)
                                  ? 'Assignée'
                                  : 'Assigner'
                                }
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne des formations assignées */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Formations Assignées ({assignedFormations.length})
                  </h3>
                  
                  {assignedFormations.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">Aucune formation assignée</p>
                      <p className="text-xs text-gray-500 mt-1">Sélectionnez des formations à gauche</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignedFormations.map((assigned, index) => {
                        const formation = assigned.formationId;
                        return (
                          <div key={formation._id || formation} className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="text-white font-medium text-sm">{formation.title}</h5>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-gray-400">{formation.estimatedTime}</span>
                                  <span className="text-xs text-cyan-400">•</span>
                                  <span className="text-xs text-gray-400">{formation.modules?.length || 0} modules</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleUnassignFormation(formation._id || formation)}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Contenu de création de nouvelle formation (réutilise le code existant)
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Configuration générale & Types de modules */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-5">
                  <h3 className="text-xl font-bold text-white mb-4">Configuration générale</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-lg font-medium mb-3">Titre de la formation</label>
                      <input
                        type="text"
                        value={learningPageData.title}
                        onChange={(e) => setLearningPageData({...learningPageData, title: e.target.value})}
                        className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-lg font-medium mb-3">Description</label>
                      <textarea
                        value={learningPageData.description}
                        onChange={(e) => setLearningPageData({...learningPageData, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-lg font-medium mb-3">Durée estimée</label>
                      <input
                        type="text"
                        value={learningPageData.estimatedTime}
                        onChange={(e) => setLearningPageData({...learningPageData, estimatedTime: e.target.value})}
                        className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
                  <h3 className="text-xl font-bold text-white mb-4">Ajouter un module</h3>
                  <div className="space-y-3">
                    {moduleTypes.map((moduleType) => {
                      const IconComponent = moduleType.icon;
                      return (
                        <button
                          key={moduleType.type}
                          onClick={() => addModule(moduleType.type)}
                          className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 text-left transition-all duration-200 group flex items-center space-x-3"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-base">{moduleType.name}</h4>
                            <p className="text-gray-400 text-xs">{moduleType.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Modules créés ({modules.length})</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsPreview(!isPreview)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                          isPreview 
                            ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/20' 
                            : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        <span>Aperçu</span>
                      </button>
                    </div>
                  </div>

                  {modules.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-base text-gray-400">Aucun module créé pour le moment</p>
                      <p className="text-sm text-gray-500 mt-1.5">Utilisez les boutons à gauche pour ajouter du contenu</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {modules.map((module, index) => (
                        <ModuleListItem key={module.id} module={module} index={index} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Module Editor */}
                {activeModule && !isPreview && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Éditer le module</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setActiveModule(null);
                            setIsEditing(false);
                          }}
                          className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-colors hover:scale-105"
                        >
                          Fermer
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const module = modules.find(m => m.id === activeModule);
                      if (!module) return null;

                      switch (module.type) {
                        case 'text':
                          return <TextModuleEditor module={module} />;
                        case 'video':
                          return <VideoModuleEditor module={module} />;
                        case 'quiz':
                          return <QuizModuleEditor module={module} />;
                        default:
                          return <div className="text-white text-base">Type de module non pris en charge</div>;
                      }
                    })()}
                  </div>
                )}

                {/* Preview Section */}
                {isPreview && modules.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
                    <h3 className="text-xl font-bold text-white mb-6">Aperçu de la formation</h3>
                    
                    <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10">
                      <h2 className="text-xl font-bold text-white mb-2.5">{learningPageData.title}</h2>
                      <p className="text-base text-gray-300 mb-2">{learningPageData.description}</p>
                      <p className="text-sm text-gray-400">Durée estimée: {learningPageData.estimatedTime}</p>
                    </div>

                    <div className="space-y-4">
                      {modules.map((module, index) => (
                        <div key={module.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                              {React.createElement(moduleTypes.find(t => t.type === module.type)?.icon || FileText, { className: "w-4 h-4 text-white" })}
                            </div>
                            <h4 className="text-white font-semibold text-base">{module.title}</h4>
                            {module.required && (
                              <span className="px-2.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/20">
                                Obligatoire
                              </span>
                            )}
                          </div>
                          
                          {module.type === 'text' && module.content.text && (
                            <p className="text-sm text-gray-300 pl-10">{module.content.text.substring(0, 150)}...</p>
                          )}
                          {module.type === 'video' && module.content.videoUrl && (
                            <p className="text-sm text-gray-300 pl-10">Vidéo: {module.content.videoUrl}</p>
                          )}
                          {module.type === 'quiz' && (
                            <p className="text-sm text-gray-300 pl-10">
                              {module.content.questions.length} question(s) - Score requis: {module.content.passingScore}%
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Résumé des formations assignées (visible sur les deux onglets) */}
          {assignedFormations.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-400/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">
                  Résumé de la configuration ({assignedFormations.length} formation(s) assignée(s))
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedFormations.map((assigned, index) => {
                  const formation = assigned.formationId;
                  return (
                    <div key={formation._id || formation} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{formation.title}</h4>
                        <span className="text-xs text-cyan-400">#{index + 1}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{formation.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{formation.estimatedTime}</span>
                        <span className="text-gray-500">{formation.modules?.length || 0} modules</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 text-sm font-medium hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={saveLearningConfiguration}
                disabled={loading || (assignedFormations.length === 0 && modules.length === 0)}
                className="flex items-center space-x-2.5 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 text-sm font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder</span>
                  </>
                )}
              </button>

              <button
                onClick={onNext}
                disabled={assignedFormations.length === 0 && modules.length === 0}
                className="flex items-center space-x-2.5 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 text-sm font-medium"
              >
                <span>Finaliser la campagne</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
