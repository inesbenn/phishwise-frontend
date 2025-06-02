import { useState } from 'react'; 
import { 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Clock,
  Target,
  Shield,
  Info,
  CheckCircle
} from 'lucide-react';

export default function Step0_General({ onNext }) {
  const [campaignName, setCampaignName] = useState('');
  const [launchDate, setLaunchDate] = useState('');
  const [launchTime, setLaunchTime] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!campaignName.trim()) {
      newErrors.campaignName = 'Le nom de la campagne est obligatoire';
    } else if (campaignName.trim().length < 3) {
      newErrors.campaignName = 'Le nom doit contenir au moins 3 caractères';
    }
   if (!launchDate) {
      newErrors.launchDate = 'La date de lancement est obligatoire';
    } else {
      const selectedDate = new Date(launchDate + 'T' + (launchTime || '00:00'));
      const now = new Date();
      if (selectedDate < now) {
        newErrors.launchDate = 'La date doit être dans le futur';
      }
   }
    
    if (!launchTime) {
      newErrors.launchTime = 'L\'heure de lancement est obligatoire';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Simuler la création d'une campagne avec un ID
      const newCampaignId = `campaign_${Date.now()}`;
      console.log('Campagne créée avec ID:', newCampaignId, { campaignName, launchDate, launchTime });
      
      // Appeler onNext avec l'ID de la campagne
      onNext(newCampaignId);
    }
  };

  const handleBack = () => {
    // Retour au dashboard
    window.history.back();
  };

  // Générer une date minimale (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 w-full">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                PhishWise
              </h1>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">
                Nouvelle Campagne
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-6 py-6">
        {/* Progress Bar */}
        <div className="mb-8 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Création de Campagne</h2>
            <span className="text-sm text-gray-300">Étape 1 sur 7</span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-500 w-[14.28%]"></div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mt-3 text-xs text-gray-400">
            <span className="text-cyan-400 font-medium text-center">Paramètres</span>
            <span className="text-center">Cibles</span>
            <span className="text-center">Actualités</span>
            <span className="text-center">Modèles</span>
            <span className="text-center">Landing</span>
            <span className="text-center">SMTP</span>
            <span className="text-center">Formation</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 w-full">
            {/* Step Header */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Paramètres Généraux</h3>
                <p className="text-gray-300">Définissez les informations de base de votre campagne de phishing</p>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-8">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-cyan-300 text-sm leading-relaxed">
                    <strong>Conseil :</strong> Choisissez un nom descriptif pour votre campagne et planifiez le lancement à un moment optimal 
                    (généralement en milieu de semaine, entre 9h et 16h pour un taux d'ouverture maximal).
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-8">
              {/* Campaign Name */}
              <div>
                <label className="block text-white text-base font-medium mb-4">
                  Nom de la campagne *
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Ex: Simulation Black Friday 2025"
                  className={`w-full px-5 py-4 text-base bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.campaignName 
                      ? 'border-red-500 focus:ring-red-400' 
                      : 'border-white/20 focus:ring-cyan-400'
                  }`}
                />
                {errors.campaignName && (
                  <p className="text-red-400 text-sm mt-3 flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>{errors.campaignName}</span>
                  </p>
                )}
                {campaignName && !errors.campaignName && (
                  <p className="text-green-400 text-sm mt-3 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Nom de campagne valide</span>
                  </p>
                )}
              </div>

              {/* Launch Date & Time */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-white text-base font-medium mb-4">
                    Date de lancement *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={launchDate}
                      onChange={(e) => setLaunchDate(e.target.value)}
                      min={today}
                      className={`w-full pl-14 pr-5 py-4 text-base bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.launchDate 
                          ? 'border-red-500 focus:ring-red-400' 
                          : 'border-white/20 focus:ring-cyan-400'
                      }`}
                    />
                  </div>
                  {errors.launchDate && (
                    <p className="text-red-400 text-sm mt-3 flex items-center space-x-2">
                      <span>⚠️</span>
                      <span>{errors.launchDate}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white text-base font-medium mb-4">
                    Heure de lancement *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      value={launchTime}
                      onChange={(e) => setLaunchTime(e.target.value)}
                      className={`w-full pl-14 pr-5 py-4 text-base bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.launchTime 
                          ? 'border-red-500 focus:ring-red-400' 
                          : 'border-white/20 focus:ring-cyan-400'
                      }`}
                    />
                  </div>
                  {errors.launchTime && (
                    <p className="text-red-400 text-sm mt-3 flex items-center space-x-2">
                      <span>⚠️</span>
                      <span>{errors.launchTime}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Preview Card */}
              {campaignName && launchDate && launchTime && (
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6 mt-10">
                  <h4 className="text-white font-semibold mb-6 flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    <span>Aperçu de la campagne</span>
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-300 mb-2">Nom :</p>
                      <p className="text-white font-medium text-lg">{campaignName}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 mb-2">Lancement prévu :</p>
                      <p className="text-white font-medium text-lg">
                        {new Date(launchDate + 'T' + launchTime).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-16 pt-8 border-t border-white/10">
              <button
                onClick={handleBack}
                className="flex items-center space-x-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 border border-white/20 text-base font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!campaignName || !launchDate || !launchTime}
                className="flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 text-base font-medium"
              >
                <span>Suivant</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
