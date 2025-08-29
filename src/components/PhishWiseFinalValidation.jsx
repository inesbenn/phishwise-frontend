import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ArrowLeft, 
  Rocket, 
  Calendar, 
  Users, 
  Mail, 
  Globe, 
  BookOpen, 
  Settings, 
  Target, 
  Loader2, 
  RefreshCw,
  FileText,
  Shield,
  ExternalLink
} from 'lucide-react';

const PhishWiseFinalValidation = ({ campaignId, onBack, onLaunch }) => {
  const [loading, setLoading] = useState(true);
  const [campaignData, setCampaignData] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState(null);

  // Configuration de l'API
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

  // Chargement des données de la campagne
  useEffect(() => {
    loadCampaignData();
  }, [campaignId]);

  const loadCampaignData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Charger les données complètes de la campagne
      const completeData = await apiCall(`/campaigns/${campaignId}/complete`);
      setCampaignData(completeData);
      
      // Charger le statut de validation
      const validationData = await apiCall(`/campaigns/${campaignId}/validation-status`);
      setValidationStatus(validationData);
      
      console.log('Campaign data loaded:', completeData);
      console.log('Validation status loaded:', validationData);
      
    } catch (err) {
      console.error('Error loading campaign data:', err);
      setError('Impossible de charger les données de la campagne. Vérifiez que l\'API est accessible.');
      
      // Données de démonstration en cas d'erreur API
      setCampaignData({
        name: "Campagne de Test - Demo",
        startDate: new Date().toISOString(),
        status: "draft",
        targets: [
          { email: "user1@example.com", firstName: "John", lastName: "Doe" },
          { email: "user2@example.com", firstName: "Jane", lastName: "Smith" }
        ],
        step2: {
          news: [
            { title: "Nouvelle vulnérabilité découverte" },
            { title: "Mise à jour de sécurité urgente" }
          ]
        },
        step3: {
          selectedTemplate: "template1",
          templates: [
            { id: "template1", name: "Alerte Sécurité Urgente" },
            { id: "template2", name: "Notification Système" }
          ]
        },
        step4: {
          type: "template",
          selectedTemplate: { name: "Page de connexion Microsoft" }
        },
        step6: {
          assignedFormations: [
            { formationId: "1", wizardData: { title: "Sensibilisation Phishing" } },
            { formationId: "2", wizardData: { title: "Sécurité Email" } }
          ]
        }
      });
      
      setValidationStatus({
        overallStatus: 'incomplete',
        readyForLaunch: false,
        validationErrors: ['Données de démonstration - API non accessible'],
        steps: {
          step1: { completed: true, count: 2 },
          step2: { completed: true, newsCount: 2 },
          step3: { completed: true, templatesCount: 2, selectedTemplate: "Alerte Sécurité Urgente" },
          step4: { completed: true, type: "template" },
          step5: { completed: false, dnsStatus: {} },
          step6: { completed: true, formationsCount: 2 }
        }
      });
    } finally {
      setLoading(false);
    }
  };

const handleLaunchCampaign = async () => {
  if (!validationStatus?.readyForLaunch) {
    alert('La campagne n\'est pas prête à être lancée. Veuillez corriger les erreurs affichées.');
    return;
  }

  if (launching) {
    console.log('⚠️ Lancement déjà en cours, ignore ce clic');
    return;
  }

  setLaunching(true);
  
  try {
    const now = new Date();
    const scheduledDate = new Date(campaignData.startDate);
    const sendImmediately = scheduledDate <= now;

    const confirmMessage = sendImmediately 
     ? `Êtes-vous sûr de vouloir lancer la campagne immédiatement ?\n\nLes emails seront envoyés dès maintenant à ${campaignData?.targets?.length || 0} destinataire(s).`
    : `Êtes-vous sûr de vouloir programmer la campagne ?\n\nLes emails seront envoyés automatiquement le ${scheduledDate.toLocaleDateString('fr-FR')} à ${scheduledDate.toLocaleTimeString('fr-FR')} à ${campaignData?.targets?.length || 0} destinataire(s).`;

    if (!confirm(confirmMessage)) {
      setLaunching(false);
      return;
    }

    console.log('🚀 Lancement de la campagne avec envoi:', sendImmediately ? 'immédiat' : 'programmé');
    
    const result = await apiCall(`/campaigns/${campaignId}/launch`, { 
      method: 'POST',
      body: JSON.stringify({
        scheduledDate: campaignData.startDate,
        sendImmediately,
        autoSend: sendImmediately
      })
    });
    
    console.log('✅ Résultat du lancement:', result);

    // CORRECTION: Vérifier explicitement la propriété success du backend
    if (result.success === true) {
      if (sendImmediately) {
        // Envoi immédiat
        if (result.emailsSent && result.statistics) {
          alert(`Campagne lancée avec succès !\n\n📧 ${result.statistics.successful || 0} emails envoyés avec succès\n❌ ${result.statistics.failed || 0} échecs\n\nLes ouvertures et clics seront trackés automatiquement.`);
        } else {
          alert(`Campagne lancée immédiatement !\n\nStatut: ${result.campaign?.status || 'en cours'}\n\nConsultez le tableau de bord pour suivre l'évolution.`);
        }
      } else {
        // Campagne programmée
        alert(`Campagne programmée avec succès !\n\n📅 Les emails seront envoyés automatiquement le ${scheduledDate.toLocaleDateString('fr-FR')} à ${scheduledDate.toLocaleTimeString('fr-FR')}\n📧 ${campaignData?.targets?.length || 0} destinataire(s) ciblé(s)\n\nVous pouvez modifier ou annuler la programmation depuis le tableau de bord.`);
      }

      // Callback de succès
      if (onLaunch) {
        onLaunch();
      }
    } else {
      // Cas d'échec explicite
      const errorMessage = result.message || 'Erreur inconnue lors du lancement';
      console.error('❌ Réponse d\'échec du serveur:', result);
      alert(`Erreur lors du lancement de la campagne: ${errorMessage}`);
    }
    
  } catch (err) {
    console.error('❌ Erreur lors du lancement de la campagne:', err);
    
    // Différencier les erreurs réseau des erreurs logiques
    if (err.message.includes('fetch') || err.message.includes('network')) {
      alert('Erreur de connexion au serveur. Vérifiez votre connexion internet et réessayez.');
    } else {
      alert(`Erreur lors du lancement de la campagne: ${err.message}`);
    }
  } finally {
    setLaunching(false);
  }
};

  // Fonction pour obtenir l'icône et le style selon le statut
  const getStatusDisplay = (isComplete, hasWarning = false) => {
    if (isComplete && !hasWarning) {
      return {
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/20'
      };
    } else if (isComplete && hasWarning) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/20'
      };
    } else {
      return {
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/20'
      };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Chargement des données</h3>
          <p className="text-gray-400">Récupération de la configuration de la campagne...</p>
        </div>
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Erreur de chargement</h3>
          <p className="text-gray-400 mb-6">{error || 'Impossible de charger les données de la campagne'}</p>
          <button 
            onClick={loadCampaignData}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg mx-auto hover:from-cyan-600 hover:to-purple-700 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

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
                Validation Finale
              </span>
            </div>
            <div className="w-9 h-9 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-base">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Création de Campagne</h2>
              <span className="text-base text-gray-300">Étape 7 sur 7</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2.5 rounded-full w-full transition-all duration-500"></div>
            </div>

            <div className="grid grid-cols-7 gap-3 mt-3 text-xs text-gray-400">
              {['Paramètres', 'Cibles', 'Modèles', "Page d'atterrissage", 'SMTP', 'Formation', 'Finaliser'].map((step, i) => (
                <span
                  key={step}
                  className={`text-center font-medium ${i === 6 ? 'text-cyan-400' : 'text-green-400'}`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1.5">Validation Finale</h3>
              <p className="text-base text-gray-300">
                Vérifiez la configuration de votre campagne avant le lancement
              </p>
            </div>
          </div>

          {/* Campaign Overview */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Aperçu de la Campagne</h3>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  validationStatus?.overallStatus === 'ready' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                    : validationStatus?.overallStatus === 'warning'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/20'
                }`}>
                  {validationStatus?.overallStatus === 'ready' ? 'Prêt' : 
                   validationStatus?.overallStatus === 'warning' ? 'Attention' : 'Incomplet'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Nom de la campagne</span>
                  </div>
                  <span className="text-gray-300">{campaignData?.name || 'Non défini'}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Date de début</span>
                  </div>
                  <span className="text-gray-300">
                    {campaignData?.startDate ? new Date(campaignData.startDate).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Non définie'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Step 1 - Cibles */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              {(() => {
                const stepData = validationStatus?.steps?.step1;
                const status = getStatusDisplay(stepData?.completed);
                const IconComponent = status.icon;
                
                return (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                        <Users className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">Cibles</h4>
                        <p className="text-sm text-gray-400">Configuration des destinataires</p>
                      </div>
                      <div className={`p-1 ${status.bgColor} rounded-full`}>
                        <IconComponent className={`w-5 h-5 ${status.color}`} />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Nombre total de cibles</span>
                        <span className="text-white font-medium">{stepData?.count || 0}</span>
                      </div>
                      
                      {stepData?.completed ? (
                        <div className={`p-3 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                          <p className="text-sm text-white mb-2">
                            ✓ {stepData.count} cible{stepData.count > 1 ? 's' : ''} configurée{stepData.count > 1 ? 's' : ''}
                          </p>
                          <div className="text-xs text-gray-300 space-y-1">
                            {campaignData?.targets?.slice(0, 3).map((target, index) => (
                              <div key={index}>• {target.email}</div>
                            ))}
                            {campaignData?.targets?.length > 3 && (
                              <div>... et {campaignData.targets.length - 3} autres</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-sm text-red-400">⚠ Aucune cible configurée</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Step 2 - Actualités */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              {(() => {
                const stepData = validationStatus?.steps?.step2;
                const status = getStatusDisplay(stepData?.completed);
                const IconComponent = status.icon;
                
                return (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                        <FileText className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">Actualités & Sujets</h4>
                        <p className="text-sm text-gray-400">Contenu pour la campagne</p>
                      </div>
                      <div className={`p-1 ${status.bgColor} rounded-full`}>
                        <IconComponent className={`w-5 h-5 ${status.color}`} />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Actualités sélectionnées</span>
                        <span className="text-white font-medium">{stepData?.newsCount || 0}</span>
                      </div>
                      
                      {stepData?.completed ? (
                        <div className={`p-3 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                          <p className="text-sm text-white mb-2">
                            ✓ Contenu configuré pour la campagne
                          </p>
                          <div className="text-xs text-gray-300 space-y-1">
                            {campaignData?.step2?.news?.slice(0, 2).map((news, index) => (
                              <div key={index}>• {news.title}</div>
                            ))}
                            {campaignData?.step2?.news?.length > 2 && (
                              <div>... et {campaignData.step2.news.length - 2} autres</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <p className="text-sm text-yellow-400">⚠ Étape optionnelle non configurée</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Step 3 - Templates */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              {(() => {
                const stepData = validationStatus?.steps?.step3;
                const status = getStatusDisplay(stepData?.completed);
                const IconComponent = status.icon;
                const selectedTemplate = campaignData?.step3?.templates?.find(t => t.id === campaignData?.step3?.selectedTemplate);
                
                return (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                        <Mail className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">Templates d'Email</h4>
                        <p className="text-sm text-gray-400">Modèles de phishing</p>
                      </div>
                      <div className={`p-1 ${status.bgColor} rounded-full`}>
                        <IconComponent className={`w-5 h-5 ${status.color}`} />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Templates créés</span>
                        <span className="text-white font-medium">{stepData?.templatesCount || 0}</span>
                      </div>
                      
                      {stepData?.completed ? (
                        <div className={`p-3 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                          <p className="text-sm text-white mb-2">
                            ✓ Template sélectionné
                          </p>
                          <div className="text-xs text-gray-300">
                            • {selectedTemplate?.name || stepData.selectedTemplate}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-sm text-red-400">⚠ Aucun template sélectionné</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Step 4 - Landing Page */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              {(() => {
                const stepData = validationStatus?.steps?.step4;
                const status = getStatusDisplay(stepData?.completed);
                const IconComponent = status.icon;
                
                return (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                        <Globe className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">Landing Page</h4>
                        <p className="text-sm text-gray-400">Page d'atterrissage</p>
                      </div>
                      <div className={`p-1 ${status.bgColor} rounded-full`}>
                        <IconComponent className={`w-5 h-5 ${status.color}`} />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Type de page</span>
                        <span className="text-white font-medium">
                          {stepData?.type === 'cloned' ? 'URL Clonée' : 
                           stepData?.type === 'template' ? 'Template' : 'Non défini'}
                        </span>
                      </div>
                      
                      {stepData?.completed ? (
                        <div className={`p-3 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                          <p className="text-sm text-white mb-2">
                            ✓ Landing page configurée ({stepData.type})
                          </p>
                          {campaignData?.step4?.selectedTemplate?.name && (
                            <div className="text-xs text-gray-300">
                              • {campaignData.step4.selectedTemplate.name}
                            </div>
                          )}
                          {campaignData?.step4?.previewUrl && (
                            <a 
                              href={campaignData.step4.previewUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 mt-2"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Aperçu</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-sm text-red-400">⚠ Aucune landing page configurée</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Step 5 - SMTP */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              {(() => {
                const stepData = validationStatus?.steps?.step5;
                const status = getStatusDisplay(stepData?.completed);
                const IconComponent = status.icon;
                
                return (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                        <Shield className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">Configuration SMTP</h4>
                        <p className="text-sm text-gray-400">Serveur d'envoi d'emails</p>
                      </div>
                      <div className={`p-1 ${status.bgColor} rounded-full`}>
                        <IconComponent className={`w-5 h-5 ${status.color}`} />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">SPF</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            stepData?.dnsStatus?.spf === 'success' ? 'bg-green-500/20 text-green-400' :
                            stepData?.dnsStatus?.spf === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {stepData?.dnsStatus?.spf || 'pending'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">DKIM</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            stepData?.dnsStatus?.dkim === 'success' ? 'bg-green-500/20 text-green-400' :
                            stepData?.dnsStatus?.dkim === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {stepData?.dnsStatus?.dkim || 'pending'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">DMARC</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            stepData?.dnsStatus?.dmarc === 'success' ? 'bg-green-500/20 text-green-400' :
                            stepData?.dnsStatus?.dmarc === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {stepData?.dnsStatus?.dmarc || 'pending'}
                          </span>
                        </div>
                      </div>
                      
                      {stepData?.completed ? (
                        <div className={`p-3 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                          <p className="text-sm text-white">
                            ✓ Configuration SMTP validée
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-sm text-red-400">⚠ Configuration SMTP incomplète</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Step 6 - Formation */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              {(() => {
                const stepData = validationStatus?.steps?.step6;
                const status = getStatusDisplay(stepData?.completed);
                const IconComponent = status.icon;
                
                return (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">Formation</h4>
                        <p className="text-sm text-gray-400">Modules d'apprentissage</p>
                      </div>
                      <div className={`p-1 ${status.bgColor} rounded-full`}>
                        <IconComponent className={`w-5 h-5 ${status.color}`} />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Formations assignées</span>
                        <span className="text-white font-medium">{stepData?.formationsCount || 0}</span>
                      </div>
                      
                      {stepData?.completed ? (
                        <div className={`p-3 ${status.bgColor} ${status.borderColor} border rounded-lg`}>
                          <p className="text-sm text-white mb-2">
                            ✓ {stepData.formationsCount} formation{stepData.formationsCount > 1 ? 's' : ''} assignée{stepData.formationsCount > 1 ? 's' : ''}
                          </p>
                          <div className="text-xs text-gray-300 space-y-1">
                            {campaignData?.step6?.assignedFormations?.slice(0, 2).map((formation, index) => (
                              <div key={index}>
                                • {formation.wizardData?.title || `Formation ${formation.formationId}`}
                              </div>
                            ))}
                            {campaignData?.step6?.assignedFormations?.length > 2 && (
                              <div>... et {campaignData.step6.assignedFormations.length - 2} autres</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <p className="text-sm text-yellow-400">⚠ Aucune formation assignée (optionnel)</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Validation Errors */}
          {validationStatus?.validationErrors && validationStatus.validationErrors.length > 0 && (
            <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl border border-red-500/20 p-6 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-bold text-red-400">Erreurs de Validation</h3>
              </div>
              <div className="space-y-2">
                {validationStatus.validationErrors.map((error, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Launch Summary */}
          {validationStatus?.readyForLaunch && (
            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 backdrop-blur-lg rounded-2xl border border-green-400/20 p-6 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Rocket className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-green-400">Prêt pour le Lancement</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-cyan-400 font-medium">Cibles</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{campaignData?.targets?.length || 0}</p>
                  <p className="text-xs text-gray-400">destinataires configurés</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-400 font-medium">Lancement</span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {campaignData?.startDate ? new Date(campaignData.startDate).toLocaleDateString('fr-FR') : 'Immédiat'}
                  </p>
                  <p className="text-xs text-gray-400">date programmée</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">Formation</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{validationStatus?.steps?.step6?.formationsCount || 0}</p>
                  <p className="text-xs text-gray-400">modules assignés</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Détails de la Campagne</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Email d'expéditeur:</span>
                    <span className="text-white ml-2">{campaignData?.step5?.fromEmail || 'Non configuré'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Nom d'expéditeur:</span>
                    <span className="text-white ml-2">{campaignData?.step5?.fromName || 'Non configuré'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type de page:</span>
                    <span className="text-white ml-2">
                      {campaignData?.step4?.type === 'cloned' ? 'URL Clonée' :
                       campaignData?.step4?.type === 'template' ? 'Template' : 'Non défini'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Redirection formation:</span>
                    <span className="text-white ml-2">
                      {campaignData?.step6?.redirectToLearning ? 'Activée' : 'Désactivée'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Action Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-white/10">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/20 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/home'}
                className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/20 hover:scale-105"
              >
                <Settings className="w-4 h-4" />
                <span>Accueil</span>
              </button>

              <button
                onClick={handleLaunchCampaign}
                disabled={!validationStatus?.readyForLaunch || launching}
                className={`flex items-center space-x-2 px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 font-medium ${
                  validationStatus?.readyForLaunch && !launching
                    ? 'bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                {launching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Lancement en cours...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    <span>
                      {validationStatus?.readyForLaunch ? 'Lancer la Campagne' : 'Campagne incomplète'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-4">
                <span>Campagne ID: {campaignId}</span>
                <span>•</span>
                <span>
                  Créée le: {campaignData?.createdAt ? 
                    new Date(campaignData.createdAt).toLocaleDateString('fr-FR') : 
                    'Date inconnue'
                  }
                </span>
                {campaignData?.updatedAt && (
                  <>
                    <span>•</span>
                    <span>
                      Modifiée le: {new Date(campaignData.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={loadCampaignData}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Actualiser les données"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Actualiser</span>
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhishWiseFinalValidation;