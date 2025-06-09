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
  Copy // Ensure Copy icon is imported and used
} from 'lucide-react';

// Helper component for input fields to minimize redundancy
const ModuleInputField = ({ label, value, onChange, placeholder, type = "text", rows = 1, min, max, required }) => (
  <div className="mb-4"> {/* Added margin-bottom for spacing */}
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

export default function LearningPage({ campaignId, onNext, onBack }) {
  // Global states for navigation and UI
  const [activeTab, setActiveTab] = useState('formations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModuleModalOpen, setIsCreateModuleModal] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedModuleTypeForCreation, setSelectedModuleTypeForCreation] = useState('text');
  const [isCreateFormationModalOpen, setIsCreateFormationModalOpen] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(''); // State for copy feedback message
  const [isEditFormationModalOpen, setIsEditFormationModalOpen] = useState(false); // New state for edit modal
  const [formationToEdit, setFormationToEdit] = useState(null); // New state for holding formation being edited


  // Core state for managing multiple formations
  const [formations, setFormations] = useState([
    {
      id: 101,
      title: "Formation Sécurité - Sensibilisation au Phishing",
      description: "Cette formation vous aidera à reconnaître et éviter les tentatives de phishing.",
      estimatedTime: "15-20 minutes",
      modules: [
        { id: 1, title: "Introduction au Phishing", type: "text", category: "basics", content: { text: "Le phishing est une technique d'ingénierie sociale..." }, duration: "5 min", usageCount: 12, lastUsed: "2025-06-05", status: "active", required: true },
        { id: 2, title: "Reconnaître les emails suspects", type: "video", category: "identification", content: { videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoType: 'youtube', transcript: 'Transcription de la vidéo...' }, duration: "8 min", usageCount: 8, lastUsed: "2025-06-03", status: "active", required: true },
        { id: 3, title: "Quiz - Signaux d'alarme", type: "quiz", category: "evaluation", content: { questions: [{ id: 1, question: "Quel est le principal objectif du phishing ?", options: ["Voler des informations", "Envoyer des virus", "Spam", "Publicité"], correctAnswer: 0, explanation: 'Le phishing vise principalement à obtenir des informations sensibles.' }], passingScore: 70 }, duration: "3 min", usageCount: 15, lastUsed: "2025-06-07", status: "active", required: true },
      ]
    },
    {
      id: 102,
      title: "Cybersécurité Avancée",
      description: "Approfondissez vos connaissances en cybersécurité.",
      estimatedTime: "45 minutes",
      modules: [
        { id: 5, title: "Cryptographie et protection des données", type: "text", category: "advanced", content: { text: "Explorez les principes de la cryptographie..." }, duration: "15 min", usageCount: 3, lastUsed: "2025-05-28", status: "active", required: true },
      ]
    }
  ]);

  // State to track the currently active formation for editing
  // Initialize activeFormationId to the first formation's ID if formations array is not empty
  const [activeFormationId, setActiveFormationId] = useState(formations[0]?.id || null);

  // Derive current formation details based on activeFormationId
  const currentFormation = formations.find(f => f.id === activeFormationId);
  const currentFormationModules = currentFormation ? currentFormation.modules : [];


  // Templates state (remains global for now, but could be linked to formations if needed)
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Formation Phishing Basique",
      modules: [1, 2, 3], // Refers to module IDs (from example initial data)
      category: "standard",
      usageCount: 5,
      lastUsed: "2025-06-05",
      estimatedDuration: "16 min"
    },
    {
      id: 2,
      name: "Formation Avancée IT",
      modules: [2],
      category: "advanced",
      usageCount: 3,
      lastUsed: "2025-06-01",
      estimatedDuration: "11 min"
    }
  ]);

  // Categories definition
  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'basics', label: 'Bases du phishing' },
    { value: 'identification', label: 'Identification des menaces' },
    { value: 'prevention', label: 'Prévention' },
    { value: 'evaluation', label: 'Évaluation' }
  ];

  // Module types definition with added 'description' for 'Ajouter un module' section
  const moduleTypes = [
    { value: 'text', label: 'Contenu Texte', icon: FileText, color: 'blue', description: 'Ajouter du texte, des paragraphes, des listes' },
    { value: 'video', label: 'Vidéo', icon: Video, color: 'purple', description: 'Intégrer une vidéo YouTube ou uploader un fichier' },
    { value: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'green', description: 'Créer un questionnaire avec choix multiples' },
  ];

  // Effect to reset body margin and padding for full-screen layout consistency
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  /**
   * Copies text to clipboard and displays a temporary message.
   * @param {string} textToCopy - The text to be copied.
   */
  const copyToClipboard = (textToCopy) => {
    const el = document.createElement('textarea');
    el.value = textToCopy;
    document.body.appendChild(el);
    el.select();
    try {
      const successful = document.execCommand('copy');
      console.log('Copy command was successful:', successful); // For debugging
      setCopiedMessage('Copié !');
      setTimeout(() => setCopiedMessage(''), 2000); // Clear message after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopiedMessage('Erreur de copie.'); // Provide feedback for failure
    } finally {
      document.body.removeChild(el);
    }
  };

  /**
   * Adds a new formation to the formations list and sets it as active.
   * @param {object} newFormationData - The new formation object.
   */
  const addFormation = (newFormationData) => {
    setFormations(prevFormations => [...prevFormations, newFormationData]);
    setActiveFormationId(newFormationData.id); // Set the new formation as active
    setIsCreateFormationModalOpen(false); // Close the modal
    setActiveTab('modules'); // Switch to modules tab to manage the new formation
  };

  /**
   * Updates an existing formation's details.
   * @param {number} formationId - The ID of the formation to update.
   * @param {object} updates - An object containing the properties to update.
   */
  const updateFormation = (formationId, updates) => {
    setFormations(prevFormations =>
      prevFormations.map(f =>
        f.id === formationId ? { ...f, ...updates } : f
      )
    );
  };

  /**
   * Deletes a formation from the formations list.
   * @param {number} formationId - The ID of the formation to delete.
   */
  const deleteFormation = (formationId) => {
    setFormations(prevFormations => prevFormations.filter(f => f.id !== formationId));
    if (activeFormationId === formationId) {
      setActiveFormationId(null); // Clear active formation if deleted
    }
  };

  /**
   * Adds a new module object to the modules list of the active formation.
   * Sets the newly added module as active for immediate editing.
   * @param {object} newModuleData - The module object to add.
   */
  const addModuleToActiveFormation = (newModuleData) => {
    setFormations(prevFormations =>
      prevFormations.map(formation =>
        formation.id === activeFormationId
          ? { ...formation, modules: [...formation.modules, newModuleData] }
          : formation
      )
    );
    setActiveModuleId(newModuleData.id); // Set the newly added module as active for editing
    setIsPreview(false); // Ensure editor is visible after adding
    setIsCreateModuleModal(false); // Close the modal
  };

  /**
   * Deletes a module from the active formation's modules list by its ID.
   * @param {number} moduleId - The ID of the module to delete.
   */
  const deleteModuleFromActiveFormation = (moduleId) => {
    setFormations(prevFormations =>
      prevFormations.map(formation =>
        formation.id === activeFormationId
          ? { ...formation, modules: formation.modules.filter(m => m.id !== moduleId) }
          : formation
      )
    );
    if (activeModuleId === moduleId) {
      setActiveModuleId(null); // Clear active module if the deleted one was active
    }
  };

  /**
   * Updates an existing module in the active formation's modules list.
   * This function is passed down to module editor components.
   * @param {number} moduleId - The ID of the module to update.
   * @param {object} updates - An object containing the properties to update.
   */
  const updateModuleInActiveFormation = (moduleId, updates) => {
    setFormations(prevFormations =>
      prevFormations.map(formation =>
        formation.id === activeFormationId
          ? {
              ...formation,
              modules: formation.modules.map(m =>
                m.id === moduleId ? { ...m, ...updates } : m
              ),
            }
          : formation
      )
    );
  };

  // Filter modules based on search term and selected category (for Modules tab)
  const filteredModules = currentFormationModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  /**
   * Component for rendering a single module card in the Modules tab.
   */
  const ModuleCard = ({ module }) => {
    const moduleType = moduleTypes.find(type => type.value === module.type);
    const IconComponent = moduleType?.icon || FileText;

    return (
      <div
        className="bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-lg"
        onClick={() => {
          setActiveModuleId(module.id);
          setIsPreview(false); // Switch to editing view
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${moduleType?.color}-500/20 rounded-lg`}>
              <IconComponent className={`w-5 h-5 text-${moduleType?.color}-400`} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{module.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{module.duration}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{module.usageCount} utilisations</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Removed the 'Eye' button as requested */}
            {/* <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
              <Eye className="w-4 h-4" />
            </button> */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click from activating editor
                setActiveModuleId(module.id);
                setIsPreview(false);
              }}
              className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                copyToClipboard(module.title); // Call copy function
              }}
              className="p-2 text-gray-400 hover:text-green-400 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click from activating editor
                deleteModuleFromActiveFormation(module.id);
              }}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-gray-300 text-sm mb-4 line-clamp-2"> {/* Increased margin-bottom */}
          {/* Refined content display based on module type */}
          {module.type === 'quiz'
            ? `Quiz avec ${module.content.questions?.length || 0} questions`
            : module.type === 'video'
              ? `URL: ${module.content.videoUrl?.substring(0, 50) || ''}${module.content.videoUrl?.length > 50 ? '...' : ''}`
              : module.content.text?.substring(0, 100) + (module.content.text?.length > 100 ? '...' : '')
          }
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10"> {/* Added top border */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${moduleType?.color}-500/20 text-${moduleType?.color}-400`}>
            {moduleType?.label}
          </span>
          <span className="text-xs text-gray-400">
            Dernière utilisation: {new Date(module.lastUsed).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
    );
  };

  /**
   * Editor component for 'text' modules.
   * Now accepts an onUpdate callback instead of directly calling updateModuleInActiveFormation.
   * @param {object} props.module - The module data.
   * @param {function} props.onUpdate - Callback to update the module data.
   */
  const TextModuleEditor = ({ module, onUpdate }) => (
    <div className="space-y-5"> {/* Increased spacing */}
      <ModuleInputField
        label="Titre du module"
        value={module.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Titre du module..."
        required
      />
      <ModuleInputField
        label="Contenu"
        value={module.content?.text || ''}
        onChange={(e) => onUpdate({
          content: { ...module.content, text: e.target.value }
        })}
        rows={8}
        type="textarea"
        placeholder="Saisissez le contenu de votre module..."
      />
      <ModuleInputField
        label="Durée estimée"
        value={module.duration}
        onChange={(e) => onUpdate({ duration: e.target.value })}
        placeholder="ex: 5 minutes"
        required
      />
    </div>
  );

  /**
   * Editor component for 'video' modules.
   * @param {object} props.module - The module data.
   * @param {function} props.onUpdate - Callback to update the module data.
   */
  const VideoModuleEditor = ({ module, onUpdate }) => (
    <div className="space-y-5"> {/* Increased spacing */}
      <ModuleInputField
        label="Titre du module"
        value={module.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Titre du module..."
        required
      />
      <ModuleInputField
        label="URL de la vidéo"
        value={module.content?.videoUrl || ''}
        onChange={(e) => onUpdate({
          content: { ...module.content, videoUrl: e.target.value }
        })}
        type="url"
        placeholder="https://youtube.com/watch?v=..."
        required
      />
      <ModuleInputField
        label="Durée estimée"
        value={module.duration}
        onChange={(e) => onUpdate({ duration: e.target.value })}
        placeholder="ex: 5 minutes"
        required
      />
    </div>
  );

  /**
   * Editor component for 'quiz' modules.
   * @param {object} props.module - The module data.
   * @param {function} props.onUpdate - Callback to update the module data.
   */
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
      <div className="space-y-5"> {/* Increased spacing */}
        <ModuleInputField
          label="Titre du quiz"
          value={module.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Titre du quiz..."
          required
        />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-white">Questions</h4>
            <button
              onClick={addQuestion}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une question</span>
            </button>
          </div>

          {(module.content?.questions || []).map((question, qIndex) => (
            <div key={question.id} className="bg-white/5 rounded-lg p-5 space-y-4 mb-4 border border-white/10 shadow-md"> {/* Increased padding and shadow */}
              <div className="flex items-center justify-between">
                <h5 className="text-white font-semibold text-base">Question {qIndex + 1}</h5>
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="p-1.5 text-red-400 hover:text-red-300 transition-colors rounded-full hover:bg-white/5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <ModuleInputField
                value={question.question}
                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                placeholder="Saisissez votre question..."
                required
              />

              <div className="space-y-3"> {/* Increased spacing */}
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

        <ModuleInputField
          label="Score minimum requis (%)"
          value={module.content?.passingScore || 0}
          onChange={(e) => onUpdate({
            content: { ...module.content, passingScore: parseInt(e.target.value) }
          })}
          type="number"
          min="0"
          max="100"
          required
        />
      </div>
    );
  };


  /**
   * Modal component for creating a new module.
   * It now renders the specific module editors internally.
   */
  const CreateModuleModal = ({ onClose, onSave, defaultModuleType }) => {
    // Initialize moduleData with default values based on the selected type
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
          initialContent = { questions: [{ id: Date.now(), question: '', type: 'multiple', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }], passingScore: 70 };
          break;
        default:
          initialContent = { text: '' };
      }
      return {
        id: Date.now() + Math.random(), // Temporary ID for creation in modal
        title: '',
        type: defaultModuleType || 'text',
        category: categories.find(cat => cat.value !== 'all')?.value || 'basics', // Default category
        content: initialContent,
        duration: '',
        required: true,
        usageCount: 0,
        lastUsed: new Date().toISOString().split('T')[0],
        status: 'active'
      };
    });

    // This function acts as the 'onUpdate' for the internal editor components
    const handleModuleDataUpdate = (updates) => {
      setModuleData(prevData => ({ ...prevData, ...updates }));
    };

    const handleSubmit = () => {
      // Basic validation for common fields
      if (!moduleData.title || !moduleData.duration) {
        console.error("Erreur: Veuillez remplir le titre et la durée estimée du module.");
        // In a real application, you'd show a user-friendly error message, e.g., using a toast notification
        return;
      }

      // Additional validation based on module type
      if (moduleData.type === 'video' && !moduleData.content.videoUrl) {
        console.error("Erreur: L'URL de la vidéo est obligatoire.");
        return;
      }
      if (moduleData.type === 'quiz') {
        if (!moduleData.content.questions || moduleData.content.questions.length === 0) {
          console.error("Erreur: Un quiz doit avoir au moins une question.");
          return;
        }
        // Validate each question in the quiz
        for (const q of moduleData.content.questions) {
          if (!q.question || q.options.some(opt => !opt) || q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
            console.error("Erreur: Toutes les questions et options du quiz doivent être remplies, et une bonne réponse sélectionnée.");
            return;
          }
        }
      }

      onSave(moduleData); // Pass the complete moduleData to the parent's onSave (addModuleToActiveFormation)
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"> {/* Increased backdrop opacity and padding */}
        <div className="bg-slate-800 rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"> {/* Added shadow */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Créer un nouveau module</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Render the specific editor based on moduleData.type */}
            {(() => {
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
            })()}

            {/*
              Removed "Type de module" and "Catégorie" fields as requested.
              The type is determined by the button clicked in "Ajouter un module" section,
              and category is set by default in the initial state of moduleData.
            */}

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10"> {/* Added top border */}
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                Créer le module
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal for creating a new Formation
  const CreateFormationModal = ({ onClose, onSave }) => {
    const [newFormationData, setNewFormationData] = useState({
      title: '',
      description: '',
      estimatedTime: '',
    });

    const handleSubmit = () => {
      if (!newFormationData.title || !newFormationData.estimatedTime) {
        console.error("Erreur: Veuillez remplir le titre et la durée estimée de la formation.");
        return;
      }
      const newFormation = {
        id: Date.now(), // Unique ID for the new formation
        ...newFormationData,
        modules: [], // Start with an empty array of modules
      };
      onSave(newFormation);
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-slate-800 rounded-2xl border border-white/20 w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Créer une nouvelle formation</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <ModuleInputField
              label="Titre de la formation"
              value={newFormationData.title}
              onChange={(e) => setNewFormationData({ ...newFormationData, title: e.target.value })}
              placeholder="Ex: Formation Cybersécurité"
              required
            />
            <ModuleInputField
              label="Description"
              value={newFormationData.description}
              onChange={(e) => setNewFormationData({ ...newFormationData, description: e.target.value })}
              rows={4}
              type="textarea"
              placeholder="Décrivez brièvement cette formation..."
            />
            <ModuleInputField
              label="Durée estimée"
              value={newFormationData.estimatedTime}
              onChange={(e) => setNewFormationData({ ...newFormationData, estimatedTime: e.target.value })}
              placeholder="Ex: 30 minutes"
              required
            />

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                Créer la formation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // New Modal for editing an existing Formation
  const EditFormationModal = ({ onClose, onSave, formation }) => {
    const [editedFormationData, setEditedFormationData] = useState(formation);

    const handleSubmit = () => {
      if (!editedFormationData.title || !editedFormationData.estimatedTime) {
        console.error("Erreur: Veuillez remplir le titre et la durée estimée de la formation.");
        return;
      }
      onSave(editedFormationData.id, editedFormationData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-slate-800 rounded-2xl border border-white/20 w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Modifier la formation</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <ModuleInputField
              label="Titre de la formation"
              value={editedFormationData.title}
              onChange={(e) => setEditedFormationData({ ...editedFormationData, title: e.target.value })}
              placeholder="Ex: Formation Cybersécurité"
              required
            />
            <ModuleInputField
              label="Description"
              value={editedFormationData.description}
              onChange={(e) => setEditedFormationData({ ...editedFormationData, description: e.target.value })}
              rows={4}
              type="textarea"
              placeholder="Décrivez brièvement cette formation..."
            />
            <ModuleInputField
              label="Durée estimée"
              value={editedFormationData.estimatedTime}
              onChange={(e) => setEditedFormationData({ ...editedFormationData, estimatedTime: e.target.value })}
              placeholder="Ex: 30 minutes"
              required
            />

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // Component for displaying a Formation Card in the list of formations
  const FormationCard = ({ formation, onSelectFormation, onDeleteFormation, onEditFormation }) => {
    return (
      <div
        className={`bg-white/5 rounded-xl border p-5 hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-lg ${activeFormationId === formation.id ? 'border-cyan-400' : 'border-white/10'}`}
        onClick={() => onSelectFormation(formation.id)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{formation.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formation.estimatedTime}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{formation.modules.length} modules</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click from activating editor
                onSelectFormation(formation.id); // View formation details (becomes active)
              }}
              className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-white/5"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onEditFormation(formation); // Pass the entire formation object for editing
              }}
              className="p-2 text-gray-400 hover:text-purple-400 transition-colors rounded-full hover:bg-white/5"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                deleteFormation(formation.id);
              }}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-white/5"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{formation.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {/* You can add formation-specific metadata here if needed */}
            <span className="text-xs text-gray-400">ID: {formation.id}</span>
        </div>
      </div>
    );
  };


  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto font-sans text-gray-200"
      style={{ margin: 0, padding: 0, top: 0, left: 0 }}
    >
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Left side: Back button, Title, Description */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Pages d'Apprentissage
              </h1>
              <p className="text-gray-400 text-sm hidden sm:block">Gérez vos modules et templates de formation</p> {/* Hide on very small screens */}
            </div>
          </div>

          {/* Right side: (Button removed as per request) */}
          {/* <button
            onClick={() => {
              if (activeFormationId) {
                setSelectedModuleTypeForCreation('text'); // Default to text when creating a module
                setIsCreateModuleModal(true);
              } else {
                setIsCreateFormationModalOpen(true);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span>{activeFormationId ? 'Nouveau Module' : 'Nouvelle Formation'}</span>
          </button> */}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full px-4 sm:px-6 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl shadow-md"> {/* Increased padding and rounded corners */}
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-white mb-1.5">Page d'Apprentissage</h3> {/* Larger, bolder text */}
              <p className="text-base text-gray-300">
                Configurez les modules d'apprentissage pour sensibiliser vos employés
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 mb-8 bg-white/5 p-1 rounded-lg inline-flex shadow-inner"> {/* Added inner shadow */}
            <button
              onClick={() => setActiveTab('formations')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'formations'
                  ? 'bg-cyan-500 text-white shadow-md' // Added shadow for active tab
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
                  ? 'bg-cyan-500 text-white shadow-md' // Added shadow for active tab
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Modules</span>
            </button>
            {/* Templates tab removed as per request */}
            {/* <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'templates'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Layout className="w-4 h-4" />
                <span>Templates</span>
              </div>
            </button> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> {/* Increased gap */}
            {/* Left Column: Formations List / General Configuration / Add Module Type */}
            <div className="lg:col-span-1 space-y-8"> {/* Added spacing between sections */}
              {activeTab === 'formations' && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 sm:p-8 shadow-xl"> {/* Increased padding and shadow */}
                  <div className="flex items-center justify-between mb-6"> {/* Increased margin-bottom */}
                    <h3 className="text-xl font-bold text-white">Formations créées ({formations.length})</h3>
                    <button
                      onClick={() => setIsCreateFormationModalOpen(true)}
                      className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nouvelle Formation</span>
                    </button>
                  </div>
                  {formations.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-base text-gray-400">Aucune formation trouvée.</p>
                      <p className="text-sm text-gray-500 mt-1.5">Créez votre première formation en utilisant le bouton ci-dessus.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formations.map(formation => (
                        <FormationCard
                          key={formation.id}
                          formation={formation}
                          onSelectFormation={(id) => {
                            setActiveFormationId(id);
                            setActiveTab('modules'); // Switch to modules tab when a formation is selected
                          }}
                          onDeleteFormation={deleteFormation}
                          onEditFormation={(formation) => { // Pass the formation object to the edit handler
                            setFormationToEdit(formation);
                            setIsEditFormationModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'modules' && (
                <>
                  {currentFormation && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 sm:p-8 mb-5 shadow-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Configuration de la formation</h3>
                      <div className="space-y-4">
                        <ModuleInputField
                          label="Titre de la formation"
                          value={currentFormation.title}
                          onChange={(e) => updateFormation(currentFormation.id, { title: e.target.value })}
                          required
                        />
                        <ModuleInputField
                          label="Description"
                          value={currentFormation.description}
                          onChange={(e) => updateFormation(currentFormation.id, { description: e.target.value })}
                          rows={3}
                          type="textarea"
                        />
                        <ModuleInputField
                          label="Durée estimée"
                          value={currentFormation.estimatedTime}
                          onChange={(e) => updateFormation(currentFormation.id, { estimatedTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {activeFormationId && ( // Only show "Ajouter un module" if a formation is active
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 sm:p-8 shadow-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Ajouter un module</h3>
                      <div className="space-y-4"> {/* Increased spacing */}
                        {moduleTypes.map((moduleType) => {
                          const IconComponent = moduleType.icon;
                          return (
                            <button
                              key={moduleType.value}
                              onClick={() => {
                                setSelectedModuleTypeForCreation(moduleType.value);
                                setIsCreateModuleModal(true);
                              }}
                              className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-4 text-left transition-all duration-200 group flex items-center space-x-3 shadow-md"
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
                </>
              )}
            </div>

            {/* Right Column: Modules List / Module Editor / Preview (for selected formation) */}
            <div className="lg:col-span-2 space-y-8"> {/* Added spacing between sections */}
              {activeTab === 'modules' && (
                <>
                  {!currentFormation && ( // Message if no formation is selected
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 text-center py-20 shadow-xl">
                      <BookOpen className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-3">Sélectionnez une formation</h3>
                      <p className="text-gray-400">Choisissez une formation dans la liste à gauche pour commencer à gérer ses modules, ou créez-en une nouvelle.</p>
                    </div>
                  )}
                  {currentFormation && (
                    <>
                      {/* Filters (only for Modules tab and if formation is selected) */}
                      <div className="flex flex-col sm:flex-row gap-4 mb-8">
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

                      {/* List of Modules */}
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
                            <p className="text-sm text-gray-500 mt-1.5">Utilisez les boutons à gauche pour ajouter du contenu, ou ajustez les filtres.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            <h3 className="text-xl font-bold text-white">Éditer le module</h3>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setActiveModuleId(null);
                                }}
                                className="px-5 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-colors hover:scale-105 shadow-md"
                              >
                                Fermer
                              </button>
                            </div>
                          </div>

                          {(() => {
                            const module = currentFormationModules.find(m => m.id === activeModuleId);
                            if (!module) return null;

                            // Pass the update function for the specific module being edited
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

                      {/* Preview Section */}
                      {isPreview && currentFormationModules.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 sm:p-8 shadow-xl">
                          <h3 className="text-xl font-bold text-white mb-6">Aperçu de la formation</h3>

                          <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10 shadow-md">
                            <h2 className="text-2xl font-bold text-white mb-2.5">{currentFormation.title}</h2>
                            <p className="text-base text-gray-300 mb-2">{currentFormation.description}</p>
                            <p className="text-sm text-gray-400">Durée estimée: {currentFormation.estimatedTime}</p>
                          </div>

                          <div className="space-y-4">
                            {currentFormationModules.map((module, index) => (
                              <div key={module.id} className="bg-white/5 rounded-xl p-5 border border-white/10 shadow-md">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                                    {React.createElement(moduleTypes.find(t => t.value === module.type)?.icon || FileText, { className: "w-4 h-4 text-white" })}
                                  </div>
                                  <h4 className="text-white font-semibold text-lg">{module.title}</h4>
                                  {module.required && (
                                    <span className="px-2.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/20">
                                      Obligatoire
                                    </span>
                                  )}
                                </div>

                                {/* Removed the comment directly inside JSX for text content */}
                                {module.type === 'text' && module.content?.text && (
                                  <p className="text-sm text-gray-300 pl-11">{module.content.text.substring(0, 200)}...</p>
                                )}
                                {module.type === 'video' && module.content?.videoUrl && (
                                  <div className="pl-11">
                                    <p className="text-sm text-gray-300 mb-2">Vidéo: {module.content.videoUrl}</p>
                                    {module.content.videoType === 'youtube' && (
                                      <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingTop: '56.25%' }}>
                                        <iframe
                                          className="absolute top-0 left-0 w-full h-full"
                                          src={module.content.videoUrl.replace("watch?v=", "embed/")}
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          title={module.title}
                                        ></iframe>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {module.type === 'quiz' && module.content?.questions && (
                                  <p className="text-sm text-gray-300 pl-11">
                                    {module.content.questions.length} question(s) - Score requis: {module.content.passingScore}%
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Templates section removed as per request */}
              {/* {activeTab === 'templates' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {templates.map(template => (
                    <div key={template.id} className="bg-white/5 rounded-xl border border-white/10 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-semibold text-lg mb-2">{template.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{template.estimatedDuration}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{template.usageCount} utilisations</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-400 transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-gray-300 text-sm">Modules inclus:</p>
                        {template.modules.map(moduleId => {
                          const module = formations.flatMap(f => f.modules).find(m => m.id === moduleId);
                          const moduleType = moduleTypes.find(t => t.value === module?.type);
                          const IconComponent = moduleType?.icon || FileText;

                          return (
                            <div key={moduleId} className="flex items-center space-x-2 text-sm">
                              <IconComponent className={`w-4 h-4 text-${moduleType?.color}-400`} />
                              <span className="text-gray-300">{module?.title}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.category === 'standard' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {template.category === 'standard' ? 'Standard' : 'Avancé'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Dernière utilisation: {new Date(template.lastUsed).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div className="text-center py-16 lg:col-span-2">
                      <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-white font-semibold text-lg mb-2">Aucun template trouvé</h3>
                      <p className="text-gray-400 mb-6">Créez votre premier template en combinant plusieurs modules.</p>
                    </div>
                  )}
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Temporary message for copy action */}
      {copiedMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
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
      {isEditFormationModalOpen && formationToEdit && (
        <EditFormationModal
          onClose={() => setIsEditFormationModalOpen(false)}
          onSave={updateFormation} // Reusing the existing updateFormation function
          formation={formationToEdit}
        />
      )}
    </div>
  );
}
