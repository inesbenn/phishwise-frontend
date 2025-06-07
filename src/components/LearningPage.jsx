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
  Settings
} from 'lucide-react';

const LearningPage = ({ campaignId, onNext, onBack }) => {
  // State variables for modules, active module, editing/preview modes, loading, and learning page data
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [learningPageData, setLearningPageData] = useState({
    title: "Formation Sécurité - Sensibilisation au Phishing",
    description: "Cette formation vous aidera à reconnaître et éviter les tentatives de phishing.",
    estimatedTime: "15-20 minutes"
  });

  // Effect to reset body margin and padding for full-screen layout consistency
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  // Define available module types with their icons, names, and descriptions
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

  /**
   * Creates a default module object based on the provided type.
   * @param {string} type - The type of module to create ('text', 'video', 'quiz').
   * @returns {object} The default module object.
   */
  const createDefaultModule = (type) => {
    const baseModule = {
      id: Date.now() + Math.random(), // Unique ID for the module
      type,
      title: '',
      order: modules.length, // Order based on current number of modules
      required: true
    };

    // Add specific content based on module type
    switch (type) {
      case 'text':
        return {
          ...baseModule,
          title: 'Nouveau module texte',
          content: {
            text: '',
            formatting: 'paragraph' // Default formatting
          }
        };
      case 'video':
        return {
          ...baseModule,
          title: 'Nouveau module vidéo',
          content: {
            videoUrl: '',
            videoType: 'youtube', // Default video type
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
            passingScore: 70 // Default passing score
          }
        };
      default:
        return baseModule;
    }
  };

  /**
   * Adds a new module of the specified type to the modules list.
   * @param {string} type - The type of module to add.
   */
  const addModule = (type) => {
    const newModule = createDefaultModule(type);
    setModules([...modules, newModule]);
    setActiveModule(newModule.id); // Set the newly added module as active
    setIsEditing(true); // Enter editing mode
  };

  /**
   * Deletes a module from the modules list by its ID.
   * @param {number} moduleId - The ID of the module to delete.
   */
  const deleteModule = (moduleId) => {
    setModules(modules.filter(m => m.id !== moduleId));
    // If the deleted module was active, clear active module and exit editing mode
    if (activeModule === moduleId) {
      setActiveModule(null);
      setIsEditing(false);
    }
  };

  /**
   * Updates an existing module in the modules list.
   * @param {number} moduleId - The ID of the module to update.
   * @param {object} updates - An object containing the properties to update.
   */
  const updateModule = (moduleId, updates) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, ...updates } : m
    ));
  };

  /**
   * Simulates saving the learning page data to a backend.
   */
  const saveLearningPage = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Construct the payload for saving
      const learningPagePayload = {
        campaignId,
        title: learningPageData.title,
        description: learningPageData.description,
        estimatedTime: learningPageData.estimatedTime,
        modules: modules.map((module, index) => ({
          ...module,
          order: index // Ensure modules are ordered correctly
        }))
      };

      console.log('Saving learning page:', learningPagePayload);
      setIsEditing(false); // Exit editing mode after saving
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false); // End loading regardless of success or failure
    }
  };

  /**
   * Component for rendering a single module in the list.
   * @param {object} props - The component props.
   * @param {object} props.module - The module object to render.
   * @param {number} props.index - The index of the module in the list.
   */
  const ModuleListItem = ({ module, index }) => {
    const IconComponent = moduleTypes.find(t => t.type === module.type)?.icon || FileText;
    
    return (
      <div 
        className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-3 cursor-pointer transition-all duration-200 hover:bg-white/15 ${ // Reduced p from 4 to 3
          activeModule === module.id ? 'ring-2 ring-cyan-400' : ''
        }`}
        onClick={() => setActiveModule(module.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2"> {/* Reduced space-x from 3 to 2 */}
            <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center"> {/* Reduced w/h from 8 to 7 */}
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{module.title}</h3>
              <p className="text-xs text-gray-400">
                {moduleTypes.find(t => t.type === module.type)?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1"> {/* Reduced space-x from 2 to 1 */}
            {module.required && (
              <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/20"> {/* Reduced py from 1 to 0.5 */}
                Obligatoire
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent activating the module when deleting
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

  /**
   * Editor component for 'text' modules.
   * @param {object} props - The component props.
   * @param {object} props.module - The text module object to edit.
   */
  const TextModuleEditor = ({ module }) => (
    <div className="space-y-4"> {/* Reduced space-y from 6 to 4 */}
      <div>
        <label className="block text-white text-lg font-medium mb-3">Titre du module</label> {/* Reduced font size and mb */}
        <input
          type="text"
          value={module.title}
          onChange={(e) => updateModule(module.id, { title: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
          placeholder="Titre du module..."
        />
      </div>
      <div>
        <label className="block text-white text-lg font-medium mb-3">Contenu</label> {/* Reduced font size and mb */}
        <textarea
          value={module.content.text}
          onChange={(e) => updateModule(module.id, { 
            content: { ...module.content, text: e.target.value }
          })}
          rows={6} // Reduced rows from 8 to 6
          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
          placeholder="Saisissez le contenu de votre module..."
        />
      </div>
    </div>
  );

  /**
   * Editor component for 'video' modules.
   * @param {object} props - The component props.
   * @param {object} props.module - The video module object to edit.
   */
  const VideoModuleEditor = ({ module }) => (
    <div className="space-y-4"> {/* Reduced space-y from 6 to 4 */}
      <div>
        <label className="block text-white text-lg font-medium mb-3">Titre du module</label> {/* Reduced font size and mb */}
        <input
          type="text"
          value={module.title}
          onChange={(e) => updateModule(module.id, { title: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
          placeholder="Titre du module..."
        />
      </div>
      <div>
        <label className="block text-white text-lg font-medium mb-3">URL de la vidéo</label> {/* Reduced font size and mb */}
        <input
          type="url"
          value={module.content.videoUrl}
          onChange={(e) => updateModule(module.id, { 
            content: { ...module.content, videoUrl: e.target.value }
          })}
          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>
      <div>
        <label className="block text-white text-lg font-medium mb-3">Durée estimée</label> {/* Reduced font size and mb */}
        <input
          type="text"
          value={module.content.duration}
          onChange={(e) => updateModule(module.id, { 
            content: { ...module.content, duration: e.target.value }
          })}
          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
          placeholder="ex: 5 minutes"
        />
      </div>
    </div>
  );

  /**
   * Editor component for 'quiz' modules.
   * @param {object} props - The component props.
   * @param {object} props.module - The quiz module object to edit.
   */
  const QuizModuleEditor = ({ module }) => {
    /**
     * Adds a new question to the quiz module.
     */
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

    /**
     * Updates an existing question in the quiz module.
     * @param {number} questionId - The ID of the question to update.
     * @param {object} updates - An object containing the properties to update.
     */
    const updateQuestion = (questionId, updates) => {
      const updatedQuestions = module.content.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      );
      updateModule(module.id, {
        content: { ...module.content, questions: updatedQuestions }
      });
    };

    return (
      <div className="space-y-4"> {/* Reduced space-y from 6 to 4 */}
        <div>
          <label className="block text-white text-lg font-medium mb-3">Titre du quiz</label> {/* Reduced font size and mb */}
          <input
            type="text"
            value={module.title}
            onChange={(e) => updateModule(module.id, { title: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
            placeholder="Titre du quiz..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4"> {/* Reduced mb from 6 to 4 */}
            <h4 className="text-xl font-bold text-white">Questions</h4> {/* Reduced font size from 2xl to xl */}
            <button
              onClick={addQuestion}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-105" // Reduced px/py, font size, rounded from xl to lg, shadow from lg to md
            >
              <Plus className="w-4 h-4" /> {/* Reduced icon size from 5 to 4 */}
              <span>Ajouter une question</span>
            </button>
          </div>

          {module.content.questions.map((question, qIndex) => (
            <div key={question.id} className="bg-white/5 rounded-lg p-4 space-y-4 mb-4 border border-white/10"> {/* Reduced p from 6 to 4, rounded from xl to lg, space-y from 6 to 4, mb from 6 to 4 */}
              <div className="flex items-center justify-between">
                <h5 className="text-white font-semibold text-base">Question {qIndex + 1}</h5> {/* Reduced font size from lg to base */}
                <button
                  onClick={() => {
                    const updatedQuestions = module.content.questions.filter(q => q.id !== question.id);
                    updateModule(module.id, {
                      content: { ...module.content, questions: updatedQuestions }
                    });
                  }}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors" // Reduced p from 2 to 1
                >
                  <Trash2 className="w-4 h-4" /> {/* Reduced icon size from 5 to 4 */}
                </button>
              </div>
              
              <input
                type="text"
                value={question.question}
                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
                placeholder="Saisissez votre question..."
              />

              <div className="space-y-2"> {/* Reduced space-y from 4 to 2 */}
                <label className="block text-sm text-gray-300 font-medium">Options de réponse</label> {/* Reduced font size from base to sm */}
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-3"> {/* Reduced space-x from 4 to 3 */}
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() => updateQuestion(question.id, { correctAnswer: oIndex })}
                      className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 bg-white/10 border-white/20" // Reduced h/w from 5 to 4
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[oIndex] = e.target.value;
                        updateQuestion(question.id, { options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
                      placeholder={`Option ${oIndex + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm text-gray-300 font-medium mb-2">Explication (optionnel)</label> {/* Reduced font size from base to sm */}
                <textarea
                  value={question.explanation}
                  onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                  rows={2} // Reduced rows from 3 to 2
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
                  placeholder="Explication de la bonne réponse..."
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-white text-lg font-medium mb-3">Score minimum requis (%)</label> {/* Reduced font size and mb */}
          <input
            type="number"
            min="0"
            max="100"
            value={module.content.passingScore}
            onChange={(e) => updateModule(module.id, { 
              content: { ...module.content, passingScore: parseInt(e.target.value) }
            })}
            className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto"
      style={{ margin: 0, padding: 0, top: 0, left: 0 }} // Ensure full screen coverage
    >
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 w-full">
        <div className="w-full px-6 py-4"> {/* Reduced px from 8 to 6, py from 5 to 4 */}
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            <div className="flex items-center space-x-4"> {/* Reduced space-x from 6 to 4 */}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> {/* Reduced font size from 3xl to 2xl */}
                PhishWise
              </h1>
              <span className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium"> {/* Reduced px/py, font size from base to sm */}
                Nouvelle Campagne
              </span>
            </div>
            <div className="w-9 h-9 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-base"> {/* Reduced w/h from 10 to 9, font size from lg to base */}
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full px-6 py-6"> {/* Reduced px/py from 8 to 6 */}
        <div className="max-w-7xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8"> {/* Reduced mb from 10 to 8 */}
            <div className="flex items-center justify-between mb-4"> {/* Reduced mb from 6 to 4 */}
              <h2 className="text-2xl font-bold text-white">Création de Campagne</h2> {/* Reduced font size from 3xl to 2xl */}
              <span className="text-base text-gray-300">Étape 6 sur 7</span> {/* Reduced font size from lg to base */}
            </div>

            <div className="w-full bg-white/10 rounded-full h-2.5"> {/* Reduced h from 3 to 2.5 */}
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2.5 rounded-full w-[85.71%] transition-all duration-500"></div> {/* Reduced h from 3 to 2.5 */}
            </div>

            <div className="grid grid-cols-7 gap-3 mt-3 text-xs text-gray-400"> {/* Reduced gap from 4 to 3, mt from 4 to 3, font size from sm to xs */}
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
          <div className="flex items-center space-x-4 mb-8"> {/* Reduced space-x from 6 to 4, mb from 10 to 8 */}
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg"> {/* Reduced p from 4 to 3, rounded from xl to lg */}
              <BookOpen className="w-8 h-8 text-white" /> {/* Reduced w/h from 10 to 8 */}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1.5">Page d'Apprentissage</h3> {/* Reduced font size from 3xl to 2xl, mb from 2 to 1.5 */}
              <p className="text-base text-gray-300"> {/* Reduced font size from lg to base */}
                Configurez les modules d'apprentissage pour sensibiliser vos employés
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5"> {/* Reduced gap from 6 to 5 */}
            {/* General Configuration & Module Types Column */}
            <div className="lg:col-span-1">
              {/* Configuration générale */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-5"> {/* Reduced rounded from 3xl to 2xl, p from 10 to 8, mb from 6 to 5 */}
                <h3 className="text-xl font-bold text-white mb-4">Configuration générale</h3> {/* Reduced font size from 2xl to xl, mb from 6 to 4 */}
                <div className="space-y-4"> {/* Reduced space-y from 6 to 4 */}
                  <div>
                    <label className="block text-white text-lg font-medium mb-3">Titre de la formation</label> {/* Reduced font size and mb */}
                    <input
                      type="text"
                      value={learningPageData.title}
                      onChange={(e) => setLearningPageData({...learningPageData, title: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
                    />
                  </div>
                  <div>
                    <label className="block text-white text-lg font-medium mb-3">Description</label> {/* Reduced font size and mb */}
                    <textarea
                      value={learningPageData.description}
                      onChange={(e) => setLearningPageData({...learningPageData, description: e.target.value})}
                      rows={3} // Reduced rows from 4 to 3
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
                    />
                  </div>
                  <div>
                    <label className="block text-white text-lg font-medium mb-3">Durée estimée</label> {/* Reduced font size and mb */}
                    <input
                      type="text"
                      value={learningPageData.estimatedTime}
                      onChange={(e) => setLearningPageData({...learningPageData, estimatedTime: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200" // Reduced px/py, font size, rounded from xl to lg
                    />
                  </div>
                </div>
              </div>

              {/* Types de modules */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8"> {/* Reduced rounded from 3xl to 2xl, p from 10 to 8 */}
                <h3 className="text-xl font-bold text-white mb-4">Ajouter un module</h3> {/* Reduced font size from 2xl to xl, mb from 6 to 4 */}
                <div className="space-y-3"> {/* Reduced space-y from 4 to 3 */}
                  {moduleTypes.map((moduleType) => {
                    const IconComponent = moduleType.icon;
                    return (
                      <button
                        key={moduleType.type}
                        onClick={() => addModule(moduleType.type)}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 text-left transition-all duration-200 group flex items-center space-x-3" // Reduced rounded from xl to lg, p from 5 to 4, space-x from 4 to 3
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <IconComponent className="w-4 h-4 text-white" /> {/* Reduced icon size from 5 to 4 */}
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-base">{moduleType.name}</h4> {/* Reduced font size from lg to base */}
                          <p className="text-gray-400 text-xs">{moduleType.description}</p> {/* Reduced font size from sm to xs */}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content Column */}
            <div className="lg:col-span-2">
              {/* List of Modules */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-5"> {/* Reduced rounded from 3xl to 2xl, p from 10 to 8, mb from 6 to 5 */}
                <div className="flex items-center justify-between mb-4"> {/* Reduced mb from 6 to 4 */}
                  <h3 className="text-xl font-bold text-white">Modules créés ({modules.length})</h3> {/* Reduced font size from 2xl to xl */}
                  <div className="flex items-center space-x-2"> {/* Reduced space-x from 3 to 2 */}
                    <button
                      onClick={() => setIsPreview(!isPreview)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${ // Reduced px/py, rounded from xl to lg, font size from base to sm
                        isPreview 
                          ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/20' 
                          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <Eye className="w-4 h-4" /> {/* Reduced icon size from 5 to 4 */}
                      <span>Aperçu</span>
                    </button>
                  </div>
                </div>

                {modules.length === 0 ? (
                  <div className="text-center py-12"> {/* Reduced py from 16 to 12 */}
                    <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" /> {/* Reduced w/h from 20 to 16, mb from 6 to 4 */}
                    <p className="text-base text-gray-400">Aucun module créé pour le moment</p> {/* Reduced font size from lg to base */}
                    <p className="text-sm text-gray-500 mt-1.5">Utilisez les boutons à gauche pour ajouter du contenu</p> {/* Reduced font size from base to sm, mt from 2 to 1.5 */}
                  </div>
                ) : (
                  <div className="space-y-3"> {/* Reduced space-y from 4 to 3 */}
                    {modules.map((module, index) => (
                      <ModuleListItem key={module.id} module={module} index={index} />
                    ))}
                  </div>
                )}
              </div>

              {/* Module Editor */}
              {activeModule && !isPreview && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8"> {/* Reduced rounded from 3xl to 2xl, p from 10 to 8 */}
                  <div className="flex items-center justify-between mb-4"> {/* Reduced mb from 6 to 4 */}
                    <h3 className="text-xl font-bold text-white">Éditer le module</h3> {/* Reduced font size from 2xl to xl */}
                    <div className="flex items-center space-x-2"> {/* Reduced space-x from 3 to 2 */}
                      <button
                        onClick={() => {
                          setActiveModule(null);
                          setIsEditing(false);
                        }}
                        className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-colors hover:scale-105" // Reduced px/py, rounded from xl to lg, font size from base to sm
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
                        return <div className="text-white text-base">Type de module non pris en charge</div>; {/* Reduced font size from lg to base */}
                    }
                  })()}
                </div>
              )}

              {/* Preview Section */}
              {isPreview && modules.length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8"> {/* Reduced rounded from 3xl to 2xl, p from 10 to 8 */}
                  <h3 className="text-xl font-bold text-white mb-6">Aperçu de la formation</h3> {/* Reduced font size from 2xl to xl, mb from 8 to 6 */}
                  
                  <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10"> {/* Reduced rounded from xl to lg, p from 8 to 6, mb from 8 to 6 */}
                    <h2 className="text-xl font-bold text-white mb-2.5">{learningPageData.title}</h2> {/* Reduced font size from 2xl to xl, mb from 4 to 2.5 */}
                    <p className="text-base text-gray-300 mb-2">{learningPageData.description}</p> {/* Reduced font size from lg to base, mb from 3 to 2 */}
                    <p className="text-sm text-gray-400">Durée estimée: {learningPageData.estimatedTime}</p> {/* Reduced font size from base to sm */}
                  </div>

                  <div className="space-y-4"> {/* Reduced space-y from 6 to 4 */}
                    {modules.map((module, index) => (
                      <div key={module.id} className="bg-white/5 rounded-lg p-4 border border-white/10"> {/* Reduced rounded from xl to lg, p from 6 to 4 */}
                        <div className="flex items-center space-x-3 mb-3"> {/* Reduced space-x from 4 to 3, mb from 4 to 3 */}
                          <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center"> {/* Reduced w/h from 8 to 7 */}
                            {React.createElement(moduleTypes.find(t => t.type === module.type)?.icon || FileText, { className: "w-4 h-4 text-white" })}
                          </div>
                          <h4 className="text-white font-semibold text-base">{module.title}</h4> {/* Reduced font size from lg to base */}
                          {module.required && (
                            <span className="px-2.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/20"> {/* Reduced px/py, font size from sm to xs */}
                              Obligatoire
                            </span>
                          )}
                        </div>
                        
                        {module.type === 'text' && module.content.text && (
                          <p className="text-sm text-gray-300 pl-10">{module.content.text.substring(0, 150)}...</p> // Reduced font size from base to sm, pl from 12 to 10
                        )}
                        {module.type === 'video' && module.content.videoUrl && (
                          <p className="text-sm text-gray-300 pl-10">Vidéo: {module.content.videoUrl}</p> // Reduced font size from base to sm, pl from 12 to 10
                        )}
                        {module.type === 'quiz' && (
                          <p className="text-sm text-gray-300 pl-10"> {/* Reduced font size from base to sm, pl from 12 to 10 */}
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

          {/* Navigation Footer */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10"> {/* Reduced mt from 16 to 12, pt from 10 to 8 */}
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 text-sm font-medium hover:scale-105" // Reduced space-x from 3 to 2, px/py, rounded from lg to base, font size from base to sm
            >
              <ArrowLeft className="w-4 h-4" /> {/* Reduced icon size from 5 to 4 */}
              <span>Retour</span>
            </button>

            <div className="flex items-center space-x-2.5"> {/* Reduced space-x from 3 to 2.5 */}
              <button
                onClick={saveLearningPage}
                disabled={loading || modules.length === 0}
                className="flex items-center space-x-2.5 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 text-sm font-medium" // Reduced space-x, px/py, rounded, font size
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {/* Reduced w/h from 5 to 4 */}
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> {/* Reduced icon size from 5 to 4 */}
                    <span>Sauvegarder</span>
                  </>
                )}
              </button>

              <button
                onClick={onNext}
                disabled={modules.length === 0}
                className="flex items-center space-x-2.5 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 text-sm font-medium" // Reduced space-x, px/py, rounded, font size
              >
                <span>Finaliser la campagne</span>
                <ArrowRight className="w-4 h-4" /> {/* Reduced icon size from 5 to 4 */}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
