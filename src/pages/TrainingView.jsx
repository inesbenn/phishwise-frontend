// src/pages/TrainingView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  ArrowLeft,
  User,
  BarChart3,
  Target,
  AlertCircle,
  Pause,
  RotateCcw
} from 'lucide-react';
import { 
  getCampaignFormations, 
  startFormation, 
  submitModuleProgress 
} from '../api/learningApi';

const TrainingView = () => {
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const targetEmail = searchParams.get('email');
  const navigate = useNavigate();

  // États principaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formations, setFormations] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userInfo, setUserInfo] = useState(null); // NOUVEAU : pour stocker les infos utilisateur
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [moduleIndex, setModuleIndex] = useState(0);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  
  // États pour les quiz
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [moduleStartTime, setModuleStartTime] = useState(null);

  // Chargement initial des données
  useEffect(() => {
    if (campaignId && targetEmail) {
      loadFormations();
    } else {
      setError('Paramètres manquants : ID de campagne ou email utilisateur');
      setLoading(false);
    }
  }, [campaignId, targetEmail]);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const response = await getCampaignFormations(campaignId, targetEmail);
      
      if (response.success) {
        setFormations(response.data.formations);
        setUserStats(response.data.overallStats);
        setUserInfo(response.data.user); // NOUVEAU : stocker les infos utilisateur
      } else {
        setError('Impossible de charger les formations');
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleStartFormation = async (formation) => {
    try {
      const response = await startFormation({
        campaignId,
        targetEmail,
        formationId: formation._id
      });

      if (response.success) {
        setSelectedFormation(formation);
        setCurrentModule(formation.modules[0]);
        setModuleIndex(0);
        setIsTrainingMode(true);
        setModuleStartTime(Date.now());
      }
    } catch (err) {
      console.error('Erreur lors du démarrage:', err);
      setError('Impossible de démarrer la formation');
    }
  };

  const handleModuleComplete = async () => {
    if (!currentModule || !selectedFormation) return;

    const timeSpent = moduleStartTime ? Math.floor((Date.now() - moduleStartTime) / 1000) : 0;
    let score = 0;

    // Calculer le score pour les quiz
    if (currentModule.type === 'quiz' && currentModule.content.questions) {
      const correctAnswers = currentModule.content.questions.reduce((acc, question) => {
        return acc + (quizAnswers[question.id] === question.correctAnswer ? 1 : 0);
      }, 0);
      score = Math.round((correctAnswers / currentModule.content.questions.length) * 100);
    }

    try {
      const response = await submitModuleProgress({
        campaignId,
        targetEmail,
        formationId: selectedFormation._id,
        moduleId: currentModule.id,
        answers: quizAnswers,
        timeSpent,
        score
      });

      if (response.success) {
        // Réinitialiser les états du module
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizResults(response.data);

        // Passer au module suivant ou terminer
        if (moduleIndex < selectedFormation.modules.length - 1) {
          const nextIndex = moduleIndex + 1;
          setModuleIndex(nextIndex);
          setCurrentModule(selectedFormation.modules[nextIndex]);
          setModuleStartTime(Date.now());
        } else {
          // Formation terminée
          setIsTrainingMode(false);
          setSelectedFormation(null);
          setCurrentModule(null);
          loadFormations(); // Recharger pour mettre à jour les stats
        }
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError('Impossible d\'enregistrer le progrès');
    }
  };

  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    // Auto-complétion après 2 secondes pour montrer les résultats
    setTimeout(() => {
      handleModuleComplete();
    }, 2000);
  };

  const renderFormationCard = (formation) => {
    const progress = formation.progress || {};
    const isCompleted = progress.status === 'completed';
    const isInProgress = progress.status === 'in_progress';

    return (
      <div 
        key={formation._id}
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {formation.title}
            </h3>
            <p className="text-gray-600 mb-3">
              {formation.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formation.estimatedTime}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {formation.modules?.length || 0} modules
              </span>
              {formation.badge && (
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Badge disponible
                </span>
              )}
            </div>
          </div>
          
          {isCompleted && (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Terminé</span>
              {progress.badgeEarned && (
                <Award className="h-6 w-6 text-yellow-500" />
              )}
            </div>
          )}
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progression</span>
            <span>{progress.overallProgress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress.overallProgress || 0}%` }}
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          {!isCompleted && (
            <button
              onClick={() => handleStartFormation(formation)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isInProgress ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isInProgress ? 'Continuer' : 'Commencer'}
            </button>
          )}
          
          {isCompleted && (
            <button
              onClick={() => handleStartFormation(formation)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Refaire
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderModule = () => {
    if (!currentModule) return null;

    switch (currentModule.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">{currentModule.title}</h2>
            <div 
              dangerouslySetInnerHTML={{ __html: currentModule.content.text || '' }}
              className="text-gray-700 leading-relaxed"
            />
            <div className="mt-8">
              <button
                onClick={handleModuleComplete}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                Module suivant
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case 'video':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">{currentModule.title}</h2>
            {currentModule.content.videoUrl && (
              <div className="mb-6">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    src={currentModule.content.videoUrl}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
            {currentModule.content.transcript && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Transcription :</h3>
                <p className="text-gray-700">{currentModule.content.transcript}</p>
              </div>
            )}
            <button
              onClick={handleModuleComplete}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              Module suivant
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        );

      case 'quiz':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">{currentModule.title}</h2>
            
            {!quizSubmitted ? (
              <div className="space-y-6">
                {currentModule.content.questions?.map((question, qIndex) => (
                  <div key={question.id} className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">
                      Question {qIndex + 1}: {question.question}
                    </h3>
                    <div className="space-y-3">
                      {question.options?.map((option, oIndex) => (
                        <label key={oIndex} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            value={oIndex}
                            onChange={() => handleQuizAnswer(question.id, oIndex)}
                            className="text-blue-600"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-6">
                  <span className="text-sm text-gray-600">
                    Score minimum requis : {currentModule.content.passingScore || 70}%
                  </span>
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length !== currentModule.content.questions?.length}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Valider le quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Évaluation de vos réponses...</p>
              </div>
            )}
          </div>
        );

      case 'simulation':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">{currentModule.title}</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Scénario de simulation</h3>
                  <p className="text-yellow-700 mt-1">{currentModule.content.scenario}</p>
                </div>
              </div>
            </div>

            {currentModule.content.emailContent && (
              <div className="bg-white border rounded-lg p-6 mb-6">
                <div className="border-b pb-4 mb-4">
                  <p><strong>De :</strong> {currentModule.content.emailContent.from}</p>
                  <p><strong>Objet :</strong> {currentModule.content.emailContent.subject}</p>
                </div>
                <div className="prose">
                  <div dangerouslySetInnerHTML={{ 
                    __html: currentModule.content.emailContent.body || '' 
                  }} />
                </div>
              </div>
            )}

            <button
              onClick={handleModuleComplete}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              Analyser et continuer
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        );

      default:
        return (
          <div>
            <p>Type de module non supporté : {currentModule.type}</p>
            <button
              onClick={handleModuleComplete}
              className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Passer
            </button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des formations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Erreur</h2>
          </div>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isTrainingMode ? (
        // Vue liste des formations
        <div className="container mx-auto px-4 py-8">
          {/* GRANDE NOTIFICATION DE PHISHING */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg shadow-2xl p-8 mb-8 border-l-4 border-red-600">
            <div className="flex items-start gap-4">
              <div className="bg-white bg-opacity-20 rounded-full p-3 flex-shrink-0">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">
                  🎣 Vous êtes tombé(e) dans le piège !
                </h2>
                <div className="text-lg leading-relaxed">
                  <p className="mb-4">
                    Salut <strong>{userInfo?.firstName || 'Utilisateur'}</strong>, vous êtes tombé dans le piège de phishing. 
                    Soyez plus attentif(ve) à l'avenir. Voici quelques astuces pour éviter de retomber dans ce type d'attaque, 
                    ainsi qu'une formation pour vous aider.
                  </p>
                  
                  {/* Astuces rapides */}
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Astuces rapides pour éviter le phishing :
                    </h3>
                    <ul className="space-y-2 text-base">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                        <span>Vérifiez toujours l'adresse email de l'expéditeur</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                        <span>Méfiez-vous des messages urgents demandant des informations personnelles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                        <span>Survolez les liens avant de cliquer pour voir la vraie destination</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                        <span>En cas de doute, contactez directement l'organisation par un canal sécurisé</span>
                      </li>
                    </ul>
                  </div>
                  
                  <p className="text-lg">
                    👇 <strong>Suivez maintenant la formation ci-dessous pour renforcer vos défenses !</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Formation Sécurité - Sensibilisation au Phishing
            </h1>
            <p className="text-gray-600 mb-6">
              Développez vos compétences en sécurité informatique à travers nos formations interactives.
            </p>

            {/* Statistiques utilisateur */}
            {userStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.totalFormations}</p>
                      <p className="text-sm text-gray-600">Formations assignées</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.completedFormations}</p>
                      <p className="text-sm text-gray-600">Terminées</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.totalBadges}</p>
                      <p className="text-sm text-gray-600">Badges obtenus</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {Math.floor((userStats.totalTimeSpent || 0) / 60)}min
                      </p>
                      <p className="text-sm text-gray-600">Temps total</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Liste des formations */}
          <div className="space-y-6">
            {formations.length > 0 ? (
              formations.map(formation => renderFormationCard(formation))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Aucune formation disponible
                </h3>
                <p className="text-gray-500">
                  Les formations seront bientôt disponibles.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Mode formation
        <div className="container mx-auto px-4 py-8">
          {/* En-tête de formation */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedFormation.title}
                </h1>
                <p className="text-gray-600">
                  Module {moduleIndex + 1} sur {selectedFormation.modules.length}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsTrainingMode(false);
                  setSelectedFormation(null);
                  setCurrentModule(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            
            {/* Barre de progression du module */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 bg-blue-500 rounded-full transition-all"
                style={{ 
                  width: `${((moduleIndex + 1) / selectedFormation.modules.length) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Contenu du module */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {renderModule()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingView;