// src/pages/TrainingView.jsx - VERSION AVEC HEADER ET NAVIGATION
import React, { useState, useEffect } from 'react';
import URLScanner from '../components/URLScanner';
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
  RotateCcw,
  XCircle,
  RefreshCw,
  Shield,
  Search,
  Home,
  GraduationCap,
  Mail,
  FileText,
  Link,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { 
  getCampaignFormations, 
  startFormation, 
  submitModuleProgress 
} from '../api/learningApi';
import { convertYouTubeToEmbed, validateVideoUrl } from '../utils/videoUtils';

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
  const [userInfo, setUserInfo] = useState(null);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [moduleIndex, setModuleIndex] = useState(0);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [currentView, setCurrentView] = useState('training'); // 'training' ou 'analysis'
  
  // États pour les quiz
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [moduleStartTime, setModuleStartTime] = useState(null);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [maxAttempts] = useState(3);

  // États pour le temps passé
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [timeInterval, setTimeInterval] = useState(null);

  // Définir la classe CSS pour les modules
  const moduleContainerClass = "w-full max-w-none";

  // Chargement initial des données
  useEffect(() => {
    if (campaignId && targetEmail) {
      loadFormations();
    } else {
      setError('Paramètres manquants : ID de campagne ou email utilisateur');
      setLoading(false);
    }
  }, [campaignId, targetEmail]);

  // Gestion du temps passé
  useEffect(() => {
    if (isTrainingMode && moduleStartTime) {
      const interval = setInterval(() => {
        setTotalTimeSpent(prev => prev + 1);
      }, 1000);
      setTimeInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (timeInterval) {
      clearInterval(timeInterval);
      setTimeInterval(null);
    }
  }, [isTrainingMode, moduleStartTime]);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const response = await getCampaignFormations(campaignId, targetEmail);
      
      if (response.success) {
        setFormations(response.data.formations);
        setUserStats(response.data.overallStats);
        setUserInfo(response.data.user);
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
        setSessionStartTime(Date.now());
        setTotalTimeSpent(0);
        setCurrentAttempt(1);
        
        // Réinitialiser les états des quiz
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizResults(null);
        setShowQuizResults(false);
      }
    } catch (err) {
      console.error('Erreur lors du démarrage:', err);
      setError('Impossible de démarrer la formation');
    }
  };

  const handleModuleComplete = async (forceNext = false) => {
    if (!currentModule || !selectedFormation) return;

    const timeSpent = moduleStartTime ? Math.floor((Date.now() - moduleStartTime) / 1000) : 0;
    let score = 0;
    let passed = true;

    // Calculer le score pour les quiz
    if (currentModule.type === 'quiz' && currentModule.content.questions && !forceNext) {
      const correctAnswers = currentModule.content.questions.reduce((acc, question) => {
        return acc + (quizAnswers[question.id] === question.correctAnswer ? 1 : 0);
      }, 0);
      score = Math.round((correctAnswers / currentModule.content.questions.length) * 100);
      passed = score >= (currentModule.content.passingScore || 70);

      if (!passed && currentAttempt < maxAttempts) {
        // Quiz échoué mais tentatives restantes
        setQuizResults({
          score,
          passed: false,
          correctAnswers,
          totalQuestions: currentModule.content.questions.length,
          passingScore: currentModule.content.passingScore || 70,
          attemptsLeft: maxAttempts - currentAttempt
        });
        setShowQuizResults(true);
        return;
      }
    }

    try {
      const response = await submitModuleProgress({
        campaignId,
        targetEmail,
        formationId: selectedFormation._id,
        moduleId: currentModule.id,
        answers: quizAnswers,
        timeSpent,
        score,
        passed,
        attempt: currentAttempt
      });

      if (response.success) {
        // Si quiz échoué et plus de tentatives
        if (currentModule.type === 'quiz' && !passed && currentAttempt >= maxAttempts) {
          setError(`Vous avez épuisé vos ${maxAttempts} tentatives pour ce quiz. Contactez votre formateur pour continuer.`);
          return;
        }

        // Réinitialiser les états du module
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizResults(response.data);
        setShowQuizResults(false);
        setCurrentAttempt(1);

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
          if (timeInterval) {
            clearInterval(timeInterval);
            setTimeInterval(null);
          }
          loadFormations();
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
    if (Object.keys(quizAnswers).length !== currentModule.content.questions?.length) {
      setError('Veuillez répondre à toutes les questions avant de valider.');
      return;
    }

    setQuizSubmitted(true);
    setTimeout(() => {
      handleModuleComplete();
    }, 2000);
  };

  const retryQuiz = () => {
    setCurrentAttempt(prev => prev + 1);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
    setShowQuizResults(false);
    setModuleStartTime(Date.now());
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Composant Header avec navigation
  const renderHeader = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Centre de Formation Sécurité
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentView('training');
                if (isTrainingMode) {
                  setIsTrainingMode(false);
                  setSelectedFormation(null);
                  setCurrentModule(null);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'training'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Formation
            </button>
            
            <button
              onClick={() => setCurrentView('analysis')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'analysis'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="h-4 w-4" />
              Analyse
            </button>

            {/* Info utilisateur */}
            {userInfo && (
              <div className="flex items-center gap-2 ml-4 px-3 py-2 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {userInfo.firstName || 'Utilisateur'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Composant pour la vue d'analyse
  const renderAnalysisView = () => (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      
      <div className="container mx-auto px-4 py-8">
        {/* Section explicative */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3 flex-shrink-0">
              <Eye className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">
                Analyse de Sécurité Email
              </h2>
              <div className="text-lg leading-relaxed">
                <p className="mb-4">
                  Je vous montre comment analyser la sécurité d'un email pour détecter 
                  les liens ou pièces jointes potentiellement malveillants.
                </p>
                
                <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Points à vérifier dans un email suspect :
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Expéditeur
                      </h4>
                      <ul className="space-y-1 text-sm opacity-90">
                        <li>• Adresse email suspecte</li>
                        <li>• Domaine inhabituel</li>
                        <li>• Fautes d'orthographe</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        Liens
                      </h4>
                      <ul className="space-y-1 text-sm opacity-90">
                        <li>• URL raccourcies</li>
                        <li>• Domaines suspects</li>
                        <li>• Redirections multiples</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Contenu
                      </h4>
                      <ul className="space-y-1 text-sm opacity-90">
                        <li>• Urgence artificielle</li>
                        <li>• Demandes d'informations</li>
                        <li>• Menaces ou chantage</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Pièces jointes
                      </h4>
                      <ul className="space-y-1 text-sm opacity-90">
                        <li>• Extensions douteuses</li>
                        <li>• Fichiers exécutables</li>
                        <li>• Documents avec macros</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <p className="text-lg">
                  <strong>Utilisez l'outil ci-dessous pour analyser les URL suspectes en toute sécurité !</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner d'URL */}
        <URLScanner />
      </div>
    </div>
  );

  const renderQuizResults = () => {
    if (!showQuizResults || !quizResults) return null;

    const { score, passed, correctAnswers, totalQuestions, passingScore, attemptsLeft } = quizResults;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`bg-white rounded-lg p-8 max-w-md mx-4 border-4 ${passed ? 'border-green-500' : 'border-red-500'}`}>
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {passed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>

            <h3 className={`text-2xl font-bold mb-4 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? 'Quiz réussi !' : 'Quiz échoué'}
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                    {score}%
                  </div>
                  <div className="text-sm text-gray-600">Score obtenu</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {correctAnswers}/{totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Bonnes réponses</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600">
                  Score minimum requis : {passingScore}%
                </div>
              </div>
            </div>

            {!passed && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Tentatives restantes : {attemptsLeft}</span>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  Vous devez obtenir au moins {passingScore}% pour continuer. 
                  Revoyez le contenu et réessayez.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {!passed && attemptsLeft > 0 ? (
                <button
                  onClick={retryQuiz}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réessayer ({attemptsLeft} tentative{attemptsLeft > 1 ? 's' : ''} restante{attemptsLeft > 1 ? 's' : ''})
                </button>
              ) : (
                <button
                  onClick={() => handleModuleComplete(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4" />
                  Continuer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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

    // Déterminer si c'est le dernier module
    const isLastModule = moduleIndex === selectedFormation.modules.length - 1;
    const buttonText = isLastModule ? 'Terminer' : 'Module suivant';

    switch (currentModule.type) {
      case 'text':
        return (
          <div className="w-full max-w-none min-h-screen">
            <h2 className="text-2xl font-bold mb-6">{currentModule.title}</h2>
            <div 
              dangerouslySetInnerHTML={{ __html: currentModule.content.text || '' }}
              className="text-gray-700 leading-relaxed text-lg mb-8"
            />
            <div className="w-full flex justify-start">
              <button
                onClick={handleModuleComplete}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                {buttonText}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case 'video':
        const videoValidation = validateVideoUrl(currentModule.content.videoUrl);
        
        return (
          <div className="w-full max-w-none min-h-screen">
            <h2 className="text-2xl font-bold mb-6">{currentModule.title}</h2>
            {currentModule.content.videoUrl && (
              <div className="mb-6">
                {videoValidation.isValid ? (
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg w-full">
                    <iframe
                      src={videoValidation.cleanUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      frameBorder="0"
                      referrerPolicy="strict-origin-when-cross-origin"
                      title={currentModule.title}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center w-full">
                    <div className="text-center p-6">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-red-700 mb-2">
                        Impossible de charger la vidéo
                      </h3>
                      <p className="text-red-600 mb-4">{videoValidation.error}</p>
                      <p className="text-sm text-gray-600">
                        URL: {currentModule.content.videoUrl}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Informations sur la vidéo */}
                {videoValidation.isValid && videoValidation.platform === 'youtube' && (
                  <div className="mt-3 text-sm text-gray-600 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      Vidéo YouTube
                    </span>
                    {videoValidation.videoId && (
                      <span>ID: {videoValidation.videoId}</span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {currentModule.content.transcript && (
              <div className="mb-6 bg-gray-50 rounded-lg p-4 border w-full">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Transcription :
                </h3>
                <div className="text-gray-700 leading-relaxed text-lg">
                  {currentModule.content.transcript.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            )}
            
            <div className="w-full flex justify-start">
              <button
                onClick={handleModuleComplete}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                {buttonText}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="w-full max-w-none min-h-screen">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{currentModule.title}</h2>
                <p className="text-gray-600">
                  Tentative {currentAttempt} sur {maxAttempts}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="text-sm text-blue-600 font-medium">Score minimum requis</div>
                <div className="text-2xl font-bold text-blue-700">
                  {currentModule.content.passingScore || 70}%
                </div>
              </div>
            </div>
            
            {!quizSubmitted ? (
              <div className="space-y-6 w-full">
                {currentModule.content.questions?.map((question, qIndex) => (
                  <div key={question.id} className="bg-gray-50 p-6 rounded-lg border-2 hover:border-blue-200 transition-colors w-full">
                    <h3 className="font-semibold mb-4 text-lg">
                      Question {qIndex + 1} : {question.question}
                    </h3>
                    <div className="space-y-3">
                      {question.options?.map((option, oIndex) => (
                        <label 
                          key={oIndex} 
                          className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors border-2 border-transparent hover:border-blue-100 w-full"
                        >
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            value={oIndex}
                            checked={quizAnswers[question.id] === oIndex}
                            onChange={() => handleQuizAnswer(question.id, oIndex)}
                            className="text-blue-600 w-4 h-4"
                          />
                          <span className="flex-1 text-lg">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="bg-white border-2 border-blue-100 rounded-lg p-6 w-full">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Questions répondues : {Object.keys(quizAnswers).length} / {currentModule.content.questions?.length}
                    </div>
                    <button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length !== currentModule.content.questions?.length}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {isLastModule ? 'Terminer le quiz' : 'Valider le quiz'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 w-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Évaluation de vos réponses...
                </h3>
                <p className="text-gray-600">Veuillez patienter pendant le calcul de votre score</p>
              </div>
            )}

            {renderQuizResults()}
          </div>
        );

      case 'simulation':
        return (
          <div className="w-full max-w-none min-h-screen">
            <h2 className="text-2xl font-bold mb-6">{currentModule.title}</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-6 w-full">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 text-lg mb-2">Scénario de simulation</h3>
                  <p className="text-yellow-700 text-lg leading-relaxed">{currentModule.content.scenario}</p>
                </div>
              </div>
            </div>

            {currentModule.content.emailContent && (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6 w-full">
                <div className="border-b pb-4 mb-4">
                  <p className="text-lg"><strong>De :</strong> <span className="text-gray-700">{currentModule.content.emailContent.from}</span></p>
                  <p className="text-lg"><strong>Objet :</strong> <span className="text-gray-700">{currentModule.content.emailContent.subject}</span></p>
                </div>
                <div className="w-full">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: currentModule.content.emailContent.body || '' 
                    }}
                    className="text-lg text-gray-700 leading-relaxed w-full"
                  />
                </div>
              </div>
            )}

            <div className="w-full flex justify-start">
              <button
                onClick={handleModuleComplete}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                {buttonText}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case 'url_scanner':
        return (
          <div className="w-full max-w-none min-h-screen">
            <h2 className="text-2xl font-bold mb-6">{currentModule.title}</h2>
            
            {/* Description du module */}
            {currentModule.content.description && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Objectif de ce module</h3>
                    <p className="text-blue-700">{currentModule.content.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Instructions</h3>
                  <div className="text-yellow-700 space-y-2">
                    <p>Utilisez l'outil ci-dessous pour analyser les URL suspectes suivantes :</p>
                    {currentModule.content.testUrls && currentModule.content.testUrls.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        {currentModule.content.testUrls.map((testUrl, index) => (
                          <li key={index} className="font-mono text-sm">{testUrl}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-4">
                      <strong>Important :</strong> Ne visitez jamais ces URL directement ! 
                      Utilisez uniquement l'outil d'analyse fourni.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Intégration du scanner d'URL */}
            <div className="mb-6">
              <URLScanner />
            </div>

            {/* Bouton pour continuer */}
            <div className="w-full flex justify-start">
              <button
                onClick={handleModuleComplete}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                {isLastModule ? 'Terminer' : 'Module suivant'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full max-w-none min-h-screen">
            <div className="text-center py-12 w-full">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Type de module non supporté
              </h3>
              <p className="text-gray-500 mb-6 text-lg">
                Type : <code className="bg-gray-100 px-2 py-1 rounded">{currentModule.type}</code>
              </p>
              <button
                onClick={handleModuleComplete}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {buttonText}
              </button>
            </div>
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
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Vue d'analyse
  if (currentView === 'analysis') {
    return renderAnalysisView();
  }

  // Vue de formation
  return (
    <div className="min-h-screen bg-gray-50">
      {!isTrainingMode ? (
        <>
          {renderHeader()}
          <div className="container mx-auto px-4 py-8">
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
        </>
      ) : ( 
        <>
          {renderHeader()}
          <div className="container mx-auto px-4 py-8">
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
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-sm text-blue-600 font-medium">Temps passé</div>
                    <div className="text-lg font-bold text-blue-700">
                      {formatTime(totalTimeSpent)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (timeInterval) clearInterval(timeInterval);
                      setIsTrainingMode(false);
                      setSelectedFormation(null);
                      setCurrentModule(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                </div>
              </div> 
               
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all"
                  style={{ 
                    width: `${((moduleIndex + 1) / selectedFormation.modules.length) * 100}%` 
                  }}
                />
              </div>
            </div> 
     
            <div className="bg-white rounded-lg shadow-sm p-8">
              {renderModule()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrainingView;