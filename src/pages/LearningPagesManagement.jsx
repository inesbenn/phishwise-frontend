import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Video,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  Eye,
  FileText,
  Play,
  CheckCircle,
  Users,
  Clock,
  Layout,
  Search,
  X,
  Copy,
  Award,
  Target,
  Shield,
  AlertTriangle,
  Download,
  Star,
  Trophy,
  Zap,
  Brain,
  Lock,
  Loader,
  AlertCircle,
  Database
} from 'lucide-react';

// Configuration de l'API
const API_BASE_URL = 'http://localhost:3000/api';

// Client API simple
class LearningAPIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Ajouter le token si disponible (pour plus tard)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error - ${endpoint}:`, error);
      throw error;
    }
  }

  // Formations
  async getAllFormations() {
    return this.request('/learning/formations');
  }

  async createFormation(data) {
    return this.request('/learning/formations/no-auth', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFormation(id, data) {
    return this.request(`/learning/formations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFormation(id) {
    return this.request(`/learning/formations/${id}`, {
      method: 'DELETE',
    });
  }

  // Progression
  async getCampaignFormations(campaignId, targetEmail) {
    return this.request(`/learning/campaigns/${campaignId}/users/${targetEmail}/formations`);
  }

  async startFormation(data) {
    return this.request('/learning/progress/start-formation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitModuleProgress(data) {
    return this.request('/learning/progress/submit-module', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

const apiClient = new LearningAPIClient();

// Helper component for input fields
const ModuleInputField = ({ label, value, onChange, placeholder, type = "text", rows = 1, min, max, required }) => (
  <div className="mb-4">
    <label className="block text-white text-lg font-medium mb-2">{label}{required && <span className="text-red-500">*</span>}</label>
    {type === "textarea" ? (
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 resize-y"
        placeholder={placeholder}
        required={required}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
        placeholder={placeholder}
        required={required}
      />
    )}
  </div>
);

// Loading Spinner Component
const LoadingSpinner = ({ size = "w-6 h-6", className = "" }) => (
  <Loader className={`animate-spin ${size} ${className}`} />
);

// Error Alert Component
const ErrorAlert = ({ error, onDismiss }) => (
  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4 flex items-start space-x-3">
    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <h4 className="text-red-400 font-semibold mb-1">Erreur</h4>
      <p className="text-red-200 text-sm">{error}</p>
    </div>
    {onDismiss && (
      <button 
        onClick={onDismiss}
        className="text-red-400 hover:text-red-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

// Success Alert Component
const SuccessAlert = ({ message, onDismiss }) => (
  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-4 flex items-start space-x-3">
    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-green-200 text-sm">{message}</p>
    </div>
    {onDismiss && (
      <button 
        onClick={onDismiss}
        className="text-green-400 hover:text-green-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

export default function IntegratedLearningPlatform({ campaignId, onNext, onBack }) {
  // Navigation and UI states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModuleModalOpen, setIsCreateModuleModal] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedModuleTypeForCreation, setSelectedModuleTypeForCreation] = useState('text');
  const [isCreateFormationModalOpen, setIsCreateFormationModalOpen] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState('');
  const [isEditFormationModalOpen, setIsEditFormationModalOpen] = useState(false);
  const [formationToEdit, setFormationToEdit] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Learning specific states
  const [selectedFormationForLearning, setSelectedFormationForLearning] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [userProgress, setUserProgress] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Data states - now connected to backend
  const [formations, setFormations] = useState([]);
  const [activeFormationId, setActiveFormationId] = useState(null);

  // Sample users data (this would eventually come from backend too)
  const [users] = useState([
    {
      id: 1,
      name: "Marie Dubois",
      email: "marie.dubois@example.com",
      progress: {},
      joinDate: "2025-07-15"
    },
    {
      id: 2,
      name: "Pierre Martin",
      email: "pierre.martin@example.com",
      progress: {},
      joinDate: "2025-07-20"
    },
    {
      id: 3,
      name: "Sophie Laurent",
      email: "sophie.laurent@example.com",
      progress: {},
      joinDate: "2025-08-01"
    }
  ]);

  // Categories and module types
  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'basics', label: 'Bases' },
    { value: 'identification', label: 'Identification' },
    { value: 'prevention', label: 'Prévention' },
    { value: 'evaluation', label: 'Évaluation' },
    { value: 'practice', label: 'Pratique' }
  ];

  const moduleTypes = [
    { value: 'text', label: 'Contenu Texte', icon: FileText, color: 'blue', description: 'Ajouter du texte, des paragraphes, des listes' },
    { value: 'video', label: 'Vidéo', icon: Video, color: 'purple', description: 'Intégrer une vidéo YouTube ou uploader un fichier' },
    { value: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'green', description: 'Créer un questionnaire avec choix multiples' },
    { value: 'simulation', label: 'Simulation', icon: Target, color: 'orange', description: 'Exercice interactif de mise en situation' }
  ];

  const difficultyColors = {
    'débutant': 'green',
    'intermédiaire': 'yellow',
    'avancé': 'red'
  };

  // Get current formation
  const currentFormation = formations.find(f => f._id === activeFormationId || f.id === activeFormationId);
  const currentFormationModules = currentFormation ? currentFormation.modules : [];

  // Load formations from backend on mount
  useEffect(() => {
    loadFormations();
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  // Helper functions for API calls
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const loadFormations = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAllFormations();
      const formationsData = response.success ? response.data : response;
      setFormations(Array.isArray(formationsData) ? formationsData : []);
      
      // Set first formation as active if none selected
      if (formationsData.length > 0 && !activeFormationId) {
        setActiveFormationId(formationsData[0]._id || formationsData[0].id);
      }
      
      console.log('✅ Formations chargées:', formationsData.length);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des formations:', error);
      showError('Impossible de charger les formations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Formation management functions
  const addFormation = async (newFormationData) => {
    setLoading(true);
    try {
      const response = await apiClient.createFormation(newFormationData);
      const newFormation = response.data || response;
      
      setFormations(prev => [...prev, newFormation]);
      setActiveFormationId(newFormation._id || newFormation.id);
      setIsCreateFormationModalOpen(false);
      setActiveTab('modules');
      
      showSuccess('Formation créée avec succès !');
      console.log('✅ Formation créée:', newFormation);
    } catch (error) {
      console.error('❌ Erreur lors de la création de la formation:', error);
      showError('Erreur lors de la création: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormation = async (formationId, updates) => {
    try {
      await apiClient.updateFormation(formationId, updates);
      setFormations(prev => prev.map(f => 
        (f._id || f.id) === formationId ? { ...f, ...updates } : f
      ));
      showSuccess('Formation mise à jour avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      showError('Erreur lors de la mise à jour: ' + error.message);
    }
  };

  const deleteFormation = async (formationId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }

    try {
      await apiClient.deleteFormation(formationId);
      setFormations(prev => prev.filter(f => (f._id || f.id) !== formationId));
      
      if (activeFormationId === formationId) {
        const remaining = formations.filter(f => (f._id || f.id) !== formationId);
        setActiveFormationId(remaining.length > 0 ? (remaining[0]._id || remaining[0].id) : null);
      }
      
      showSuccess('Formation supprimée avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      showError('Erreur lors de la suppression: ' + error.message);
    }
  };

  // Module management (local until backend module endpoints are added)
  const addModuleToActiveFormation = async (newModuleData) => {
    const formationId = activeFormationId;
    const currentFormation = formations.find(f => (f._id || f.id) === formationId);
    
    if (!currentFormation) {
      showError('Aucune formation sélectionnée');
      return;
    }

    const newModule = {
      ...newModuleData,
      id: Date.now(), // Temporary ID generation
    };

    const updatedModules = [...(currentFormation.modules || []), newModule];
    
    try {
      await updateFormation(formationId, { modules: updatedModules });
      setActiveModuleId(newModule.id);
      setIsPreview(false);
      setIsCreateModuleModal(false);
      showSuccess('Module ajouté avec succès !');
    } catch (error) {
      showError('Erreur lors de l\'ajout du module');
    }
  };

  const updateModuleInActiveFormation = async (moduleId, updates) => {
    const formationId = activeFormationId;
    const currentFormation = formations.find(f => (f._id || f.id) === formationId);
    
    if (!currentFormation) return;

    const updatedModules = currentFormation.modules.map(m =>
      m.id === moduleId ? { ...m, ...updates } : m
    );

    try {
      await updateFormation(formationId, { modules: updatedModules });
      showSuccess('Module mis à jour avec succès !');
    } catch (error) {
      showError('Erreur lors de la mise à jour du module');
    }
  };

  const deleteModuleFromActiveFormation = async (moduleId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      return;
    }

    const formationId = activeFormationId;
    const currentFormation = formations.find(f => (f._id || f.id) === formationId);
    
    if (!currentFormation) return;

    const updatedModules = currentFormation.modules.filter(m => m.id !== moduleId);

    try {
      await updateFormation(formationId, { modules: updatedModules });
      if (activeModuleId === moduleId) {
        setActiveModuleId(null);
      }
      showSuccess('Module supprimé avec succès !');
    } catch (error) {
      showError('Erreur lors de la suppression du module');
    }
  };

  // Copy module function
  const copyModule = async (module) => {
    const copiedModule = {
      ...module,
      id: Date.now(),
      title: `${module.title} (Copie)`,
    };

    const formationId = activeFormationId;
    const currentFormation = formations.find(f => (f._id || f.id) === formationId);
    
    if (!currentFormation) return;

    const updatedModules = [...currentFormation.modules, copiedModule];
    
    try {
      await updateFormation(formationId, { modules: updatedModules });
      setCopiedMessage('Module copié avec succès !');
      setTimeout(() => setCopiedMessage(''), 3000);
    } catch (error) {
      showError('Erreur lors de la copie du module');
    }
  };

  // Learning functions
  const startFormation = (formation) => {
    setSelectedFormationForLearning(formation);
    setCurrentModuleIndex(0);
    setQuizAnswers({});
    setShowResults(false);
    setActiveTab('learning');
  };

  const completeModule = (moduleId) => {
    setUserProgress(prev => ({
      ...prev,
      [selectedFormationForLearning._id || selectedFormationForLearning.id]: {
        ...prev[selectedFormationForLearning._id || selectedFormationForLearning.id],
        [moduleId]: true
      }
    }));
  };

  const nextModule = () => {
    if (currentModuleIndex < selectedFormationForLearning.modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
    }
  };

  const prevModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
    }
  };

  // Filter modules
  const filteredModules = currentFormationModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-8">
      {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}
      {successMessage && <SuccessAlert message={successMessage} onDismiss={() => setSuccessMessage('')} />}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-2xl p-8 border border-white/20 shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Plateforme de Cybersécurité Interactive</h2>
            <p className="text-gray-300 text-lg">Formez-vous aux bonnes pratiques de sécurité informatique</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="text-white font-semibold">Formations Disponibles</h3>
            </div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {loading ? <LoadingSpinner size="w-8 h-8" /> : formations.length}
            </div>
            <p className="text-gray-400 text-sm">Modules interactifs prêts</p>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-6 h-6 text-purple-400" />
              <h3 className="text-white font-semibold">Modules Créés</h3>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {loading ? <LoadingSpinner size="w-8 h-8" /> : formations.reduce((acc, f) => acc + (f.modules?.length || 0), 0)}
            </div>
            <p className="text-gray-400 text-sm">Contenus pédagogiques</p>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-green-400" />
              <h3 className="text-white font-semibold">Utilisateurs Actifs</h3>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">{users.length}</div>
            <p className="text-gray-400 text-sm">Participants enregistrés</p>
          </div>
        </div>

        {loading && (
          <div className="mt-6 bg-white/5 rounded-xl p-4 flex items-center space-x-3">
            <LoadingSpinner />
            <span className="text-gray-300">Chargement des données...</span>
          </div>
        )}
      </div>

      {/* API Connection Status */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-cyan-400" />
          <span>État de la Connexion Backend</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${formations.length > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white font-medium">API Learning</span>
            </div>
            <p className="text-gray-400 text-sm">
              {formations.length > 0 ? 'Connecté et opérationnel' : 'Déconnecté ou en erreur'}
            </p>
            <p className="text-gray-500 text-xs mt-1">Base URL: {API_BASE_URL}</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">Formations Chargées</span>
            </div>
            <p className="text-gray-400 text-sm">{formations.length} formations disponibles</p>
            <p className="text-gray-500 text-xs mt-1">
              Dernière sync: {new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Learning Interface Component
  const LearningInterface = () => {
    if (!selectedFormationForLearning) return null;

    const currentModule = selectedFormationForLearning.modules[currentModuleIndex];
    const progress = ((currentModuleIndex + 1) / selectedFormationForLearning.modules.length) * 100;

    const renderModuleContent = () => {
      if (!currentModule) return null;

      switch (currentModule.type) {
        case 'text':
          return (
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                {currentModule.content?.text || 'Contenu non disponible'}
              </div>
            </div>
          );

        case 'video':
          return (
            <div className="space-y-6">
              <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={currentModule.content?.videoUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentModule.title}
                />
              </div>
            </div>
          );

        case 'quiz':
          return (
            <div className="space-y-6">
              <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <HelpCircle className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-cyan-400 font-semibold">Quiz d'évaluation</h4>
                </div>
                <p className="text-cyan-200 text-sm">
                  Score minimum: {currentModule.content?.passingScore || 70}%
                </p>
              </div>
              <div className="text-gray-300">
                Questions du quiz à implémenter...
              </div>
            </div>
          );

        default:
          return <div className="text-gray-400">Type de module non supporté: {currentModule.type}</div>;
      }
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setSelectedFormationForLearning(null);
                setActiveTab('dashboard');
              }}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour au catalogue</span>
            </button>
            <div className="text-sm text-gray-400">
              Module {currentModuleIndex + 1} sur {selectedFormationForLearning.modules.length}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{selectedFormationForLearning.title}</h1>
          
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            {React.createElement(
              moduleTypes.find(t => t.value === currentModule?.type)?.icon || FileText,
              { className: "w-6 h-6 text-cyan-400" }
            )}
            <h2 className="text-xl font-bold text-white">{currentModule?.title}</h2>
          </div>

          {renderModuleContent()}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={prevModule}
              disabled={currentModuleIndex === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                currentModuleIndex === 0
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            <button
              onClick={nextModule}
              disabled={currentModuleIndex === selectedFormationForLearning.modules.length - 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                currentModuleIndex === selectedFormationForLearning.modules.length - 1
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700'
              }`}
            >
              <span>Suivant</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Module Editors
  const TextModuleEditor = ({ module, onUpdate }) => (
    <div className="space-y-5">
      <ModuleInputField
        label="Titre du module"
        value={module.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Ex: Les bases du phishing"
        required
      />
      <ModuleInputField
        label="Contenu"
        value={module.content?.text || ''}
        onChange={(e) => onUpdate({
          content: { ...module.content, text: e.target.value }
        })}
        rows={12}
        type="textarea"
        placeholder="Saisissez le contenu de votre module... Utilisez **gras** pour les titres et - pour les listes"
      />
      <div className="grid grid-cols-2 gap-4">
        <ModuleInputField
          label="Durée estimée"
          value={module.duration || ''}
          onChange={(e) => onUpdate({ duration: e.target.value })}
          placeholder="ex: 5 min"
          required
        />
        <div className="mb-4">
          <label className="block text-white text-lg font-medium mb-2">Catégorie</label>
          <select
            value={module.category || 'basics'}
            onChange={(e) => onUpdate({ category: e.target.value })}
            className="w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            {categories.filter(cat => cat.value !== 'all').map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const VideoModuleEditor = ({ module, onUpdate }) => (
    <div className="space-y-5">
      <ModuleInputField
        label="Titre du module"
        value={module.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Ex: Comment reconnaître un email de phishing"
        required
      />
      <ModuleInputField
        label="URL de la vidéo YouTube"
        value={module.content?.videoUrl || ''}
        onChange={(e) => onUpdate({
          content: { ...module.content, videoUrl: e.target.value }
        })}
        type="url"
        placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..."
        required
      />
      <ModuleInputField
        label="Transcription (optionnel)"
        value={module.content?.transcript || ''}
        onChange={(e) => onUpdate({
          content: { ...module.content, transcript: e.target.value }
        })}
        rows={4}
        type="textarea"
        placeholder="Transcription du contenu vidéo pour l'accessibilité..."
      />
      <div className="grid grid-cols-2 gap-4">
        <ModuleInputField
          label="Durée estimée"
          value={module.duration || ''}
          onChange={(e) => onUpdate({ duration: e.target.value })}
          placeholder="ex: 8 min"
          required
        />
        <div className="mb-4">
          <label className="block text-white text-lg font-medium mb-2">Catégorie</label>
          <select
            value={module.category || 'basics'}
            onChange={(e) => onUpdate({ category: e.target.value })}
            className="w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            {categories.filter(cat => cat.value !== 'all').map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const QuizModuleEditor = ({ module, onUpdate }) => {
    const addQuestion = () => {
      const newQuestion = {
        id: Date.now(),
        question: '',
        type: 'multiple',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      };
      onUpdate({
        content: {
          ...module.content,
          questions: [...(module.content?.questions || []), newQuestion]
        }
      });
    };

    const updateQuestion = (questionId, updates) => {
      const updatedQuestions = (module.content?.questions || []).map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      );
      onUpdate({
        content: { ...module.content, questions: updatedQuestions }
      });
    };

    const deleteQuestion = (questionId) => {
      const updatedQuestions = (module.content?.questions || []).filter(q => q.id !== questionId);
      onUpdate({
        content: { ...module.content, questions: updatedQuestions }
      });
    };

    return (
      <div className="space-y-6">
        <ModuleInputField
          label="Titre du quiz"
          value={module.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ex: Quiz - Détection du phishing"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <ModuleInputField
            label="Score minimum requis (%)"
            value={module.content?.passingScore || 70}
            onChange={(e) => onUpdate({
              content: { ...module.content, passingScore: parseInt(e.target.value) || 70 }
            })}
            type="number"
            min="0"
            max="100"
            required
          />
          <ModuleInputField
            label="Durée estimée"
            value={module.duration || ''}
            onChange={(e) => onUpdate({ duration: e.target.value })}
            placeholder="ex: 5 min"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-white">Questions du Quiz</h4>
            <button
              onClick={addQuestion}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une question</span>
            </button>
          </div>

          {(module.content?.questions || []).map((question, qIndex) => (
            <div key={question.id} className="bg-white/5 rounded-xl p-6 space-y-4 mb-6 border border-white/10 shadow-md">
              <div className="flex items-center justify-between">
                <h5 className="text-white font-semibold text-lg">Question {qIndex + 1}</h5>
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-full hover:bg-white/5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <ModuleInputField
                label="Question"
                value={question.question || ''}
                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                placeholder="Saisissez votre question..."
                required
              />

              <div className="space-y-3">
                <label className="block text-sm text-gray-300 font-medium">Options de réponse</label>
                {(question.options || ['', '', '', '']).map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() => updateQuestion(question.id, { correctAnswer: oIndex })}
                      className="h-4 w-4 text-green-400 focus:ring-green-400 bg-white/10 border-white/20"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(question.options || ['', '', '', ''])];
                        newOptions[oIndex] = e.target.value;
                        updateQuestion(question.id, { options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                      placeholder={`Option ${oIndex + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <ModuleInputField
                label="Explication (optionnel)"
                value={question.explanation || ''}
                onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                rows={3}
                type="textarea"
                placeholder="Explication de la bonne réponse..."
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Module Card
  const ModuleCard = ({ module }) => {
    const moduleType = moduleTypes.find(type => type.value === module.type);
    const IconComponent = moduleType?.icon || FileText;

    return (
      <div
        className="bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02]"
        onClick={() => {
          setActiveModuleId(module.id);
          setIsPreview(false);
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <IconComponent className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{module.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{module.duration}</span>
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  {moduleType?.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveModuleId(module.id);
                setIsPreview(false);
              }}
              className="p-2 text-gray-400 hover:text-purple-400 transition-colors rounded-full hover:bg-white/5"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyModule(module);
              }}
              className="p-2 text-gray-400 hover:text-green-400 transition-colors rounded-full hover:bg-white/5"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteModuleFromActiveFormation(module.id);
              }}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-white/5"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-gray-300 text-sm mb-4 line-clamp-2">
          {module.type === 'quiz'
            ? `Quiz avec ${module.content?.questions?.length || 0} questions`
            : module.type === 'video'
              ? `Vidéo: ${module.content?.videoUrl?.substring(0, 50) || ''}${module.content?.videoUrl?.length > 50 ? '...' : ''}`
              : module.type === 'simulation'
                ? `Simulation: ${module.content?.scenario?.substring(0, 100) || ''}${module.content?.scenario?.length > 100 ? '...' : ''}`
                : module.content?.text?.substring(0, 100) + (module.content?.text?.length > 100 ? '...' : '')
          }
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-xs text-gray-400 capitalize">
            {categories.find(cat => cat.value === module.category)?.label || module.category}
          </span>
          {module.required && (
            <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/20">
              Obligatoire
            </span>
          )}
        </div>
      </div>
    );
  };

  // Create Module Modal
  const CreateModuleModal = ({ onClose, onSave, defaultModuleType }) => {
    const [moduleData, setModuleData] = useState(() => {
      let initialContent = {};
      switch (defaultModuleType) {
        case 'text':
          initialContent = { text: '' };
          break;
        case 'video':
          initialContent = { videoUrl: '', videoType: 'youtube', transcript: '' };
          break;
        case 'quiz':
          initialContent = { 
            questions: [{ 
              id: Date.now(), 
              question: '', 
              type: 'multiple', 
              options: ['', '', '', ''], 
              correctAnswer: 0, 
              explanation: '' 
            }], 
            passingScore: 70 
          };
          break;
        default:
          initialContent = { text: '' };
      }
      return {
        id: Date.now() + Math.random(),
        title: '',
        type: defaultModuleType || 'text',
        category: categories.find(cat => cat.value !== 'all')?.value || 'basics',
        content: initialContent,
        duration: '',
        required: true
      };
    });

    const handleModuleDataUpdate = (updates) => {
      setModuleData(prevData => ({ ...prevData, ...updates }));
    };

    const handleSubmit = async () => {
      if (!moduleData.title || !moduleData.duration) {
        showError("Veuillez remplir le titre et la durée estimée du module.");
        return;
      }
      
      if (moduleData.type === 'video' && !moduleData.content.videoUrl) {
        showError("L'URL de la vidéo est obligatoire.");
        return;
      }

      try {
        setLoading(true);
        await onSave(moduleData);
      } catch (error) {
        showError("Erreur lors de la création du module: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    const renderEditor = () => {
      switch (moduleData.type) {
        case 'text':
          return <TextModuleEditor module={moduleData} onUpdate={handleModuleDataUpdate} />;
        case 'video':
          return <VideoModuleEditor module={moduleData} onUpdate={handleModuleDataUpdate} />;
        case 'quiz':
          return <QuizModuleEditor module={moduleData} onUpdate={handleModuleDataUpdate} />;
        default:
          return <div className="text-white text-base">Type de module non pris en charge</div>;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-slate-800 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {React.createElement(
                  moduleTypes.find(t => t.value === moduleData.type)?.icon || FileText,
                  { className: "w-6 h-6 text-cyan-400" }
                )}
                <h2 className="text-xl font-bold text-white">
                  Créer un {moduleTypes.find(t => t.value === moduleData.type)?.label || 'Module'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}
            
            {renderEditor()}

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <LoadingSpinner size="w-4 h-4" />}
                <span>Créer le module</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Create Formation Modal
  const CreateFormationModal = ({ onClose, onSave }) => {
    const [newFormationData, setNewFormationData] = useState({
      title: '',
      description: '',
      estimatedTime: '',
      difficulty: 'débutant',
      category: 'general',
      badge: ''
    });

    const handleSubmit = async () => {
      if (!newFormationData.title || !newFormationData.estimatedTime) {
        showError("Veuillez remplir le titre et la durée estimée de la formation.");
        return;
      }
      
      try {
        setLoading(true);
        await onSave(newFormationData);
      } catch (error) {
        showError("Erreur lors de la création de la formation: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-slate-800 rounded-2xl border border-white/20 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Créer une nouvelle formation</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}
            
            <ModuleInputField
              label="Titre de la formation"
              value={newFormationData.title}
              onChange={(e) => setNewFormationData({ ...newFormationData, title: e.target.value })}
              placeholder="Ex: Formation Anti-Phishing Avancée"
              required
            />
            <ModuleInputField
              label="Description"
              value={newFormationData.description}
              onChange={(e) => setNewFormationData({ ...newFormationData, description: e.target.value })}
              rows={4}
              type="textarea"
              placeholder="Décrivez les objectifs et le contenu de cette formation..."
            />
            <div className="grid grid-cols-2 gap-4">
              <ModuleInputField
                label="Durée estimée"
                value={newFormationData.estimatedTime}
                onChange={(e) => setNewFormationData({ ...newFormationData, estimatedTime: e.target.value })}
                placeholder="Ex: 30-45 minutes"
                required
              />
              <div className="mb-4">
                <label className="block text-white text-lg font-medium mb-2">Niveau de difficulté</label>
                <select
                  value={newFormationData.difficulty}
                  onChange={(e) => setNewFormationData({ ...newFormationData, difficulty: e.target.value })}
                  className="w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="débutant">Débutant</option>
                  <option value="intermédiaire">Intermédiaire</option>
                  <option value="avancé">Avancé</option>
                </select>
              </div>
            </div>
            <ModuleInputField
              label="Badge de réussite"
              value={newFormationData.badge}
              onChange={(e) => setNewFormationData({ ...newFormationData, badge: e.target.value })}
              placeholder="Ex: Expert Anti-Phishing"
            />

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <LoadingSpinner size="w-4 h-4" />}
                <span>Créer la formation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto font-sans text-gray-200"
      style={{ margin: 0, padding: 0, top: 0, left: 0 }}
    >
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40 w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Cybersécurité Interactive
              </h1>
              <p className="text-gray-400 text-sm hidden sm:block">Formation et sensibilisation aux menaces numériques</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {selectedFormationForLearning && (
              <button
                onClick={() => {
                  setSelectedFormationForLearning(null);
                  setActiveTab('dashboard');
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                Quitter la formation
              </button>
            )}
            {loading && <LoadingSpinner className="text-cyan-400" />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Tabs Navigation */}
          {!selectedFormationForLearning && (
            <div className="flex items-center space-x-1 mb-8 bg-white/5 p-1 rounded-lg inline-flex shadow-inner">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'dashboard'
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Tableau de Bord</span>
              </button>
              <button
                onClick={() => setActiveTab('formations')}
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'formations'
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Layout className="w-4 h-4" />
                <span>Formations</span>
              </button>
              <button
                onClick={() => setActiveTab('modules')}
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'modules'
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Modules</span>
              </button>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'learning' || selectedFormationForLearning ? (
            <LearningInterface />
          ) : activeTab === 'dashboard' ? (
            <Dashboard />
          ) : activeTab === 'formations' ? (
            <div className="space-y-8">
              {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}
              {successMessage && <SuccessAlert message={successMessage} onDismiss={() => setSuccessMessage('')} />}

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Gestion des Formations ({formations.length})</h3>
                  <button
                    onClick={() => setIsCreateFormationModalOpen(true)}
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <LoadingSpinner size="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span>Nouvelle Formation</span>
                  </button>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="w-8 h-8" />
                    <span className="ml-3 text-gray-300">Chargement des formations...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {formations.map(formation => (
                      <div key={formation._id || formation.id} className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <BookOpen className="w-5 h-5 text-cyan-400" />
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                {formation.difficulty}
                              </span>
                            </div>
                            <h4 className="text-white font-semibold text-lg mb-2">{formation.title}</h4>
                            <p className="text-gray-300 text-sm mb-4 line-clamp-3">{formation.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formation.estimatedTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{formation.modules?.length || 0} modules</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startFormation(formation)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                          >
                            <Play className="w-4 h-4 inline mr-1" />
                            Tester
                          </button>
                          <button
                            onClick={() => {
                              setActiveFormationId(formation._id || formation.id);
                              setActiveTab('modules');
                            }}
                            className="px-3 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFormation(formation._id || formation.id)}
                            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {formation.badge && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center space-x-2 text-yellow-400">
                              <Award className="w-4 h-4" />
                              <span className="text-sm font-medium">Badge: {formation.badge}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'modules' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}
              {successMessage && <SuccessAlert message={successMessage} onDismiss={() => setSuccessMessage('')} />}

              {/* Left Column */}
              <div className="lg:col-span-1 space-y-8">
                {currentFormation && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 sm:p-8 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Configuration de la Formation</h3>
                    <div className="space-y-4">
                      <ModuleInputField
                        label="Titre"
                        value={currentFormation.title || ''}
                        onChange={(e) => updateFormation(currentFormation._id || currentFormation.id, { title: e.target.value })}
                        required
                      />
                      <ModuleInputField
                        label="Description"
                        value={currentFormation.description || ''}
                        onChange={(e) => updateFormation(currentFormation._id || currentFormation.id, { description: e.target.value })}
                        rows={3}
                        type="textarea"
                      />
                      <ModuleInputField
                        label="Durée estimée"
                        value={currentFormation.estimatedTime || ''}
                        onChange={(e) => updateFormation(currentFormation._id || currentFormation.id, { estimatedTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                {activeFormationId && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 sm:p-8 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Ajouter un Module</h3>
                    <div className="space-y-4">
                      {moduleTypes.map((moduleType) => {
                        const IconComponent = moduleType.icon;
                        return (
                          <button
                            key={moduleType.value}
                            onClick={() => {
                              setSelectedModuleTypeForCreation(moduleType.value);
                              setIsCreateModuleModal(true);
                            }}
                            disabled={loading}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-4 text-left transition-all duration-200 group flex items-center space-x-3 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium text-lg">{moduleType.label}</h4>
                              <p className="text-gray-400 text-sm">{moduleType.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-8">
                {!currentFormation ? (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 text-center py-20 shadow-xl">
                    <BookOpen className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">Sélectionnez une Formation</h3>
                    <p className="text-gray-400">Choisissez une formation dans l'onglet "Formations" pour gérer ses modules.</p>
                  </div>
                ) : (
                  <>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Rechercher des modules..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-3 w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-base"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 min-w-[200px] text-base"
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Modules List */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 sm:p-8 shadow-xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Modules créés ({filteredModules.length})</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setIsPreview(!isPreview)}
                            className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                              isPreview
                                ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/20 shadow-md'
                                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 shadow-md'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            <span>Aperçu</span>
                          </button>
                        </div>
                      </div>

                      {filteredModules.length === 0 ? (
                        <div className="text-center py-12">
                          <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                          <p className="text-base text-gray-400">Aucun module trouvé pour les filtres actuels.</p>
                          <p className="text-sm text-gray-500 mt-1.5">Utilisez les boutons à gauche pour ajouter du contenu.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                          {filteredModules.map(module => (
                            <ModuleCard key={module.id} module={module} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Module Editor */}
                    {activeModuleId && !isPreview && (
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 sm:p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">Éditer le Module</h3>
                          <button
                            onClick={() => setActiveModuleId(null)}
                            className="px-5 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-colors hover:scale-105 shadow-md"
                          >
                            Fermer
                          </button>
                        </div>

                        {(() => {
                          const module = currentFormationModules.find(m => m.id === activeModuleId);
                          if (!module) return null;

                          const onUpdate = (updates) => updateModuleInActiveFormation(module.id, updates);

                          switch (module.type) {
                            case 'text':
                              return <TextModuleEditor module={module} onUpdate={onUpdate} />;
                            case 'video':
                              return <VideoModuleEditor module={module} onUpdate={onUpdate} />;
                            case 'quiz':
                              return <QuizModuleEditor module={module} onUpdate={onUpdate} />;
                            default:
                              return <div className="text-white text-base">Type de module non pris en charge</div>;
                          }
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Copy Message */}
      {copiedMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          {copiedMessage}
        </div>
      )}

      {/* Modals */}
      {isCreateModuleModalOpen && (
        <CreateModuleModal
          onClose={() => setIsCreateModuleModal(false)}
          onSave={addModuleToActiveFormation}
          defaultModuleType={selectedModuleTypeForCreation}
        />
      )}
      {isCreateFormationModalOpen && (
        <CreateFormationModal
          onClose={() => setIsCreateFormationModalOpen(false)}
          onSave={addFormation}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
