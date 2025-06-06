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

  // Types de modules disponibles
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

  // Template de module par défaut
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
          content: {
            text: '',
            formatting: 'paragraph' // paragraph, list, highlight
          }
        };
      case 'video':
        return {
          ...baseModule,
          title: 'Nouveau module vidéo',
          content: {
            videoUrl: '',
            videoType: 'youtube', // youtube, upload
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

  // Ajouter un nouveau module
  const addModule = (type) => {
    const newModule = createDefaultModule(type);
    setModules([...modules, newModule]);
    setActiveModule(newModule.id);
    setIsEditing(true);
  };

  // Supprimer un module
  const deleteModule = (moduleId) => {
    setModules(modules.filter(m => m.id !== moduleId));
    if (activeModule === moduleId) {
      setActiveModule(null);
      setIsEditing(false);
    }
  };

  // Mettre à jour un module
  const updateModule = (moduleId, updates) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, ...updates } : m
    ));
  };

  // Sauvegarder la page d'apprentissage
  const saveLearningPage = async () => {
    setLoading(true);
    try {
      // Simulation API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const learningPagePayload = {
        campaignId,
        title: learningPageData.title,
        description: learningPageData.description,
        estimatedTime: learningPageData.estimatedTime,
        modules: modules.map((module, index) => ({
          ...module,
          order: index
        }))
      };

      console.log('Saving learning page:', learningPagePayload);
      setIsEditing(false);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rendu d'un module dans la liste
  const ModuleListItem = ({ module, index }) => {
    const IconComponent = moduleTypes.find(t => t.type === module.type)?.icon || FileText;
    
    return (
      <div 
        className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 cursor-pointer transition-all duration-200 hover:bg-white/15 ${
          activeModule === module.id ? 'ring-2 ring-cyan-400' : ''
        }`}
        onClick={() => setActiveModule(module.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{module.title}</h3>
              <p className="text-xs text-gray-400">
                {moduleTypes.find(t => t.type === module.type)?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {module.required && (
              <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/20">
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

  // Éditeur de module texte
  const TextModuleEditor = ({ module }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">Titre du module</label>
        <input
          type="text"
          value={module.title}
          onChange={(e) => updateModule(module.id, { title: e.target.value })}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="Titre du module..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">Contenu</label>
        <textarea
          value={module.content.text}
          onChange={(e) => updateModule(module.id, { 
            content: { ...module.content, text: e.target.value }
          })}
          rows={8}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="Saisissez le contenu de votre module..."
        />
      </div>
    </div>
  );

  // Éditeur de module vidéo
  const VideoModuleEditor = ({ module }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">Titre du module</label>
        <input
          type="text"
          value={module.title}
          onChange={(e) => updateModule(module.id, { title: e.target.value })}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="Titre du module..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">URL de la vidéo</label>
        <input
          type="url"
          value={module.content.videoUrl}
          onChange={(e) => updateModule(module.id, { 
            content: { ...module.content, videoUrl: e.target.value }
          })}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">Durée estimée</label>
        <input
          type="text"
          value={module.content.duration}
          onChange={(e) => updateModule(module.id, { 
            content: { ...module.content, duration: e.target.value }
          })}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="ex: 5 minutes"
        />
      </div>
    </div>
  );

  // Éditeur de module quiz
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
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Titre du quiz</label>
          <input
            type="text"
            value={module.title}
            onChange={(e) => updateModule(module.id, { title: e.target.value })}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Titre du quiz..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Questions</h4>
            <button
              onClick={addQuestion}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-cyan-400 to-purple-400 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une question</span>
            </button>
          </div>

          {module.content.questions.map((question, qIndex) => (
            <div key={question.id} className="bg-white/5 rounded-lg p-4 space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <h5 className="text-white font-medium">Question {qIndex + 1}</h5>
                <button
                  onClick={() => {
                    const updatedQuestions = module.content.questions.filter(q => q.id !== question.id);
                    updateModule(module.id, {
                      content: { ...module.content, questions: updatedQuestions }
                    });
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <input
                type="text"
                value={question.question}
                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Saisissez votre question..."
              />

              <div className="space-y-2">
                <label className="block text-sm text-gray-300">Options de réponse</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() => updateQuestion(question.id, { correctAnswer: oIndex })}
                      className="text-cyan-400 focus:ring-cyan-400"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[oIndex] = e.target.value;
                        updateQuestion(question.id, { options: newOptions });
                      }}
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder={`Option ${oIndex + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Explication (optionnel)</label>
                <textarea
                  value={question.explanation}
                  onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                  rows={2}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Explication de la bonne réponse..."
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Score minimum requis (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={module.content.passingScore}
            onChange={(e) => updateModule(module.id, { 
              content: { ...module.content, passingScore: parseInt(e.target.value) }
            })}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              PhishWise
            </h1>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">
              Nouvelle Campagne
            </span>
          </div>
        </div>
      </header>

      {/* Zone de contenu */}
      <div className="flex-1 overflow-auto px-6 py-8">
        {/* Barre de progression */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">Création de Campagne</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-500" style={{ width: '85.71%' }}></div>
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-400">
              <span>Paramètres</span>
              <span>Cibles</span>
              <span>Modèles</span>
              <span>Landing</span>
              <span>SMTP</span>
              <span className="text-cyan-400 font-medium">Formation</span>
              <span>Finaliser</span>
            </div>
          </div>
        </div>

        {/* Titre de la section */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Page d'Apprentissage
              </h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Configurez les modules d'apprentissage pour sensibiliser vos employés
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration générale */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Configuration générale</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Titre de la formation</label>
                <input
                  type="text"
                  value={learningPageData.title}
                  onChange={(e) => setLearningPageData({...learningPageData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={learningPageData.description}
                  onChange={(e) => setLearningPageData({...learningPageData, description: e.target.value})}
                  rows={3}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Durée estimée</label>
                <input
                  type="text"
                  value={learningPageData.estimatedTime}
                  onChange={(e) => setLearningPageData({...learningPageData, estimatedTime: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Types de modules */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ajouter un module</h3>
            <div className="space-y-3">
              {moduleTypes.map((moduleType) => {
                const IconComponent = moduleType.icon;
                return (
                  <button
                    key={moduleType.type}
                    onClick={() => addModule(moduleType.type)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{moduleType.name}</h4>
                        <p className="text-gray-400 text-xs">{moduleType.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-2">
          {/* Liste des modules */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Modules créés ({modules.length})</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Aucun module créé pour le moment</p>
                <p className="text-gray-500 text-sm">Utilisez les boutons à gauche pour ajouter du contenu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map((module, index) => (
                  <ModuleListItem key={module.id} module={module} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* Éditeur de module */}
          {activeModule && !isPreview && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Éditer le module</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      setIsEditing(false);
                    }}
                    className="px-3 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-colors"
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
                    return <div className="text-white">Type de module non pris en charge</div>;
                }
              })()}
            </div>
          )}

          {/* Aperçu */}
          {isPreview && modules.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Aperçu de la formation</h3>
              
              <div className="bg-white/5 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-2">{learningPageData.title}</h2>
                <p className="text-gray-300 mb-2">{learningPageData.description}</p>
                <p className="text-sm text-gray-400">Durée estimée: {learningPageData.estimatedTime}</p>
              </div>

              <div className="space-y-4">
                {modules.map((module, index) => {
                  const IconComponent = moduleTypes.find(t => t.type === module.type)?.icon || FileText;
                  return (
                    <div key={module.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                          <IconComponent className="w-3 h-3 text-white" />
                        </div>
                        <h4 className="text-white font-medium">{module.title}</h4>
                        {module.required && (
                          <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                            Obligatoire
                          </span>
                        )}
                      </div>
                      
                      {module.type === 'text' && module.content.text && (
                        <p className="text-gray-300 text-sm pl-9">{module.content.text.substring(0, 150)}...</p>
                      )}
                      {module.type === 'video' && module.content.videoUrl && (
                        <p className="text-gray-300 text-sm pl-9">Vidéo: {module.content.videoUrl}</p>
                      )}
                      {module.type === 'quiz' && (
                        <p className="text-gray-300 text-sm pl-9">
                          {module.content.questions.length} question(s) - Score requis: {module.content.passingScore}%
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={saveLearningPage}
              disabled={loading || modules.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-400 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              disabled={modules.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Finaliser la campagne</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;