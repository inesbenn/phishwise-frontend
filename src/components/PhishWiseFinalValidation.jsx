import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Mail, 
  Globe, 
  Shield, 
  BookOpen, 
  Calendar,
  Eye,
  ExternalLink,
  FileText,
  Play,
  ArrowLeft,
  Clock,
  Target,
  Settings,
  Info
} from 'lucide-react';
import { updateStep1 } from '@/api/campaigns';

const PhishWiseFinalValidation = ({ onNext, onBack, savedData = {} }) => {
  // Reset default styles
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  const [checkedItems, setCheckedItems] = useState({
    targets: false,
    templates: false,
    smtp: false,
    modules: false
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const campaignData = {
    name: "Campagne Sensibilisation Q2 2025",
    launchDate: "2025-06-15",
    launchTime: "09:00",
    targets: {
      total: 245,
      list: [
        "test@entreprise.com",
        "teest@entreprise.com", 
        "teeeest@entreprise.com",
        "teest@entreprise.com",
      ]
    },
    email: {
      subject: "Invitation urgente - Mise à jour sécurité Microsoft",
      sender: "security@contoso-corp.com",
      template: "Template Microsoft Security Alert"
    },
    landingPage: {
      url: "https://phishwise-sim.com/microsoft-login",
      originalSite: "login.microsoftonline.com",
      status: "Clonée avec succès"
    },
    smtp: {
      spf: true,
      dkim: true,
      dmarc: true,
      server: "mail.phishwise.com"
    },
    modules: [
      { name: "Introduction au Phishing", type: "video", duration: "3 min" },
      { name: "Identifier les signaux d'alerte", type: "text", duration: "5 min" },
      { name: "Quiz de validation", type: "quiz", duration: "2 min" }
    ]
  };

  const handleCheckboxChange = (item) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const allChecked = Object.values(checkedItems).every(checked => checked);

  const handleLaunch = () => {
    setIsLaunching(true);
    // Simulation du lancement
    setTimeout(() => {
      setIsLaunching(false);
      setShowConfirmModal(false);
      alert("Campagne programmée avec succès !");
    }, 3000);
  };

  const handleNext = () => {
    if (allChecked) {
      setShowConfirmModal(true);
    }
  };

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
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Progress */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Création de Campagne</h2>
              <span className="text-lg text-gray-300">Étape 7 sur 7</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-3 rounded-full w-[100%] transition-all duration-500"></div>
            </div>

            <div className="grid grid-cols-7 gap-4 mt-4 text-sm text-gray-400">
              {['Paramètres', 'Cibles', 'Modèles', "Page d'atterrissage", 'SMTP', 'Formation', 'Finaliser'].map((step, i) => (
                <span
                  key={step}
                  className={`text-center font-medium ${i === 6 ? 'text-cyan-400' : ''}`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-10">
            {/* Section Header */}
            <div className="flex items-center space-x-6 mb-10">
              <div className="p-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Validation Finale</h3>
                <p className="text-lg text-gray-300">
                  Vérifiez tous les paramètres avant le lancement de votre campagne
                </p>
              </div>
            </div>

            {/* Info Tip */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 mb-10">
              <div className="flex items-start space-x-4">
                <Info className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                <p className="text-cyan-300 text-base leading-relaxed">
                  <strong>Important :</strong> Une fois la campagne lancée, vous ne pourrez plus modifier les paramètres. 
                  Assurez-vous que toutes les informations sont correctes avant de confirmer le lancement.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Colonne Principale - Récapitulatif */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Paramètres Généraux */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-white">Paramètres Généraux</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Nom de la campagne</p>
                      <p className="text-white font-medium text-lg">{campaignData.name}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Date & Heure de lancement</p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <p className="text-white font-medium">
                          {campaignData.launchDate} à {campaignData.launchTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aperçu des Cibles */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-white">Aperçu des Cibles</h4>
                  </div>
                  
                  <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <Users className="w-6 h-6 text-green-400" />
                      <span className="text-2xl font-bold text-green-400">{campaignData.targets.total}</span>
                      <span className="text-green-300 text-lg">destinataires sélectionnés</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {campaignData.targets.list.map((email, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 flex items-center space-x-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        <span className="text-gray-300">{email}</span>
                      </div>
                    ))}
                    {campaignData.targets.total > 5 && (
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <span className="text-gray-400">
                          ... et {campaignData.targets.total - 5} autres destinataires
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview Email & Landing Page */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-white">Email & Landing Page</h4>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Email Preview */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-white flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-cyan-400" />
                          <span>Email Template</span>
                        </h5>
                        <button className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-sm">
                          <Eye className="w-4 h-4" />
                          <span>Aperçu</span>
                        </button>
                      </div>
                      <div className="border border-white/10 rounded p-4 bg-white/5 space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Sujet:</p>
                          <p className="text-white">{campaignData.email.subject}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Expéditeur:</p>
                          <p className="text-cyan-300">{campaignData.email.sender}</p>
                        </div>
                      </div>
                    </div>

                    {/* Landing Page Preview */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-white flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-purple-400" />
                          <span>Landing Page</span>
                        </h5>
                        <button className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          <span>Tester</span>
                        </button>
                      </div>
                      <div className="border border-white/10 rounded p-4 bg-white/5 space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">URL simulée:</p>
                          <p className="text-white break-all">{campaignData.landingPage.url}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Site original cloné:</p>
                          <p className="text-purple-300">{campaignData.landingPage.originalSite}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">{campaignData.landingPage.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration SMTP & DNS */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-white">Configuration SMTP & DNS</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Serveur d'envoi</p>
                      <p className="text-white font-medium">{campaignData.smtp.server}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-3">Validation DNS</p>
                      <div className="space-y-2">
                        {Object.entries(campaignData.smtp).filter(([key]) => key !== 'server').map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            {value ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-white uppercase text-sm">{key}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modules de Formation */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-white">Modules de Formation</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {campaignData.modules.map((module, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{module.name}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-400/30">
                              {module.type}
                            </span>
                            <span className="text-gray-400 text-sm">{module.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colonne Droite - Checklist */}
              <div className="space-y-8">
                
                {/* Checklist de Pré-lancement */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="text-xl font-semibold text-white mb-6">Checklist de Validation</h4>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'targets', label: 'Liste des cibles validée', icon: Users },
                      { key: 'templates', label: 'Templates et landing pages validés', icon: FileText },
                      { key: 'smtp', label: 'SMTP & DNS configurés', icon: Shield },
                      { key: 'modules', label: 'Modules de formation prêts', icon: BookOpen }
                    ].map(({ key, label, icon: Icon }) => (
                      <label key={key} className="flex items-start space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checkedItems[key]}
                          onChange={() => handleCheckboxChange(key)}
                          className="w-5 h-5 mt-1 rounded border border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400 focus:ring-2"
                        />
                        <div className="flex items-start space-x-3">
                          <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors mt-1" />
                          <span className="text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                            {label}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-2">
                      {allChecked ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-400" />
                      )}
                      <span className={`font-medium ${allChecked ? 'text-green-400' : 'text-amber-400'}`}>
                        {allChecked ? 'Tous les contrôles validés' : 'Contrôles en attente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Validation Status */}
                {!allChecked && (
                  <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-amber-400 font-medium mb-2">Validation requise</p>
                        <p className="text-amber-300 text-sm leading-relaxed">
                          Veuillez cocher tous les éléments de la checklist pour activer le lancement de la campagne.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-16 pt-10 border-t border-white/10">
              <button
                onClick={onBack}
                className="flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 text-base font-medium hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Étape précédente</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!allChecked}
                className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 text-base font-medium"
              >
                <Play className="w-5 h-5" />
                <span>Lancer la campagne</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 max-w-lg w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Confirmer le Lancement</h3>
              <p className="text-gray-300 mb-8 leading-relaxed">
                La campagne <span className="text-cyan-400 font-medium">"{campaignData.name}"</span> va être lancée le{' '}
                <span className="text-purple-400 font-medium">{campaignData.launchDate} à {campaignData.launchTime}</span>.
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isLaunching}
                  className="flex-1 bg-white/10 text-white border border-white/20 hover:bg-white/20 py-3 rounded-lg transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleLaunch}
                  disabled={isLaunching}
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-purple-400 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  {isLaunching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Lancement...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Confirmer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhishWiseFinalValidation;