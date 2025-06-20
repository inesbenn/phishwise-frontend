import { useState, useEffect } from 'react';
import axios from 'axios'; // Importez axios pour les requêtes HTTP
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  Shield,
  Info,
  CheckCircle,
  XCircle // Ajouté pour les icônes d'erreur
} from 'lucide-react';

export default function Step0_General({ onNext, savedData = {} }) {
  // Reset default styles
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  const [formData, setFormData] = useState({
    campaignName: savedData.campaignName || '',
    launchDate: savedData.launchDate || '',
    launchTime: savedData.launchTime || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // État de chargement
  const [apiError, setApiError] = useState(''); // Message d'erreur API
  const [apiSuccess, setApiSuccess] = useState(''); // Message de succès API

  // Load saved data on mount - no localStorage dependency
  useEffect(() => {
    if (savedData.campaignName || savedData.launchDate || savedData.launchTime) {
      setFormData(savedData);
    }
  }, [savedData]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setApiError(''); // Efface les messages d'erreur API lors de la modification des champs
    setApiSuccess(''); // Efface les messages de succès API lors de la modification des champs
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.campaignName.trim()) {
      newErrors.campaignName = 'Le nom de la campagne est obligatoire';
    } else if (formData.campaignName.trim().length < 3) {
      newErrors.campaignName = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.launchDate) {
      newErrors.launchDate = 'La date de lancement est obligatoire';
    } else {
      const [year, month, day] = formData.launchDate.split('-');
      const [hour, minute] = (formData.launchTime || '00:00').split(':');
      // Utilisation de `new Date()` avec le format ISO pour éviter les problèmes de fuseau horaire si la chaîne est valide
      const selectedDate = new Date(`${formData.launchDate}T${formData.launchTime || '00:00'}:00Z`);

      // Correction : Assurez-vous que la comparaison est robuste.
      // La date et l'heure actuelles en UTC pour une comparaison juste.
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.launchDate = 'La date et l\'heure doivent être dans le futur';
      }
    }

    if (!formData.launchTime) {
      newErrors.launchTime = 'L\'heure de lancement est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    setApiError(''); // Réinitialiser l'erreur API
    setApiSuccess(''); // Réinitialiser le succès API

    if (validateForm()) {
      setLoading(true);
      try {
        // Combiner date et heure au format ISO 8601 que le backend attend
        const startDateISO = new Date(`${formData.launchDate}T${formData.launchTime}:00Z`).toISOString();

        const campaignData = {
          name: formData.campaignName,
          startDate: startDateISO
        };

        // Supposons que votre backend tourne sur localhost:3000
        const response = await axios.post('http://localhost:3000/api/campaigns', campaignData);

        if (response.status === 201) {
          const createdCampaign = response.data;
          setApiSuccess(`Campagne créée avec succès ! ID: ${createdCampaign._id}`);
          // Appeler onNext avec l'ID de la campagne créée
          onNext(createdCampaign._id, formData);
        } else {
          setApiError('Une erreur inattendue est survenue.');
        }
      } catch (err) {
        console.error("Erreur lors de la création de la campagne:", err);
        if (err.response && err.response.data && err.response.data.message) {
          setApiError(err.response.data.message);
        } else if (err.response && err.response.data && err.response.data.errors) {
            // Gérer les erreurs de validation du backend si elles sont renvoyées
            const backendErrors = err.response.data.errors.map(e => e.msg || e.message).join(', ');
            setApiError(`Erreurs: ${backendErrors}`);
        }
        else {
          setApiError('Erreur de connexion au serveur ou problème inconnu.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const isComplete =
    formData.campaignName && formData.launchDate && formData.launchTime;
  const today = new Date().toISOString().split('T')[0];

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
              <span className="text-lg text-gray-300">Étape 1 sur 7</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-3 rounded-full w-[14.2857%] transition-all duration-500"></div>
            </div>

            <div className="grid grid-cols-7 gap-4 mt-4 text-sm text-gray-400">
              {['Paramètres', 'Cibles', 'Modèles', "Page d'atterrissage", 'SMTP', 'Formation', 'Finaliser'].map((step, i) => (
                <span
                  key={step}
                  className={`text-center font-medium ${i === 0 ? 'text-cyan-400' : ''}`}
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
                <Target className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Paramètres Généraux</h3>
                <p className="text-lg text-gray-300">
                  Définissez les informations de base de votre campagne de phishing
                </p>
              </div>
            </div>

            {/* Info Tip */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 mb-10">
              <div className="flex items-start space-x-4">
                <Info className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                <p className="text-cyan-300 text-base leading-relaxed">
                  <strong>Conseil :</strong> Choisissez un nom descriptif pour votre campagne et planifiez le
                  lancement à un moment optimal (généralement en milieu de semaine, entre 9h et 16h pour un
                  taux d'ouverture maximal).
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-10">
              {/* Campaign Name */}
              <div>
                <label className="block text-white text-xl font-medium mb-5">
                  Nom de la campagne *
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => updateField('campaignName', e.target.value)}
                  placeholder="Ex: Simulation Black Friday 2025"
                  className={`w-full px-6 py-5 text-lg bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.campaignName
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-white/20 focus:ring-cyan-400'
                  }`}
                />
                {errors.campaignName && (
                  <p className="text-red-400 text-base mt-4 flex items-center space-x-3">
                    <span className="text-xl">⚠️</span>
                    <span>{errors.campaignName}</span>
                  </p>
                )}
                {!errors.campaignName && formData.campaignName.trim() && (
                  <p className="text-green-400 text-base mt-4 flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Nom de campagne valide</span>
                  </p>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <label className="block text-white text-xl font-medium mb-5">
                    Date de lancement *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="date"
                      value={formData.launchDate}
                      onChange={(e) => updateField('launchDate', e.target.value)}
                      min={today}
                      className={`w-full pl-16 pr-6 py-5 text-lg bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.launchDate
                          ? 'border-red-500 focus:ring-red-400'
                          : 'border-white/20 focus:ring-cyan-400'
                      }`}
                    />
                    {errors.launchDate && (
                      <p className="text-red-400 text-base mt-4 flex items-center space-x-3">
                        <span className="text-xl">⚠️</span>
                        <span>{errors.launchDate}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-white text-xl font-medium mb-5">
                    Heure de lancement *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="time"
                      value={formData.launchTime}
                      onChange={(e) => updateField('launchTime', e.target.value)}
                      className={`w-full pl-16 pr-6 py-5 text-lg bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.launchTime
                          ? 'border-red-500 focus:ring-red-400'
                          : 'border-white/20 focus:ring-cyan-400'
                      }`}
                    />
                    {errors.launchTime && (
                      <p className="text-red-400 text-base mt-4 flex items-center space-x-3">
                        <span className="text-xl">⚠️</span>
                        <span>{errors.launchTime}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* API Feedback */}
              {apiError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 text-red-300 text-base">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}
              {apiSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3 text-green-300 text-base">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{apiSuccess}</span>
                </div>
              )}

              {/* Preview */}
              {isComplete && (
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-8 mt-12">
                  <h4 className="text-white font-semibold mb-8 flex items-center space-x-4 text-xl">
                    <Shield className="w-6 h-6 text-cyan-400" />
                    <span>Aperçu de la campagne</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-gray-300 mb-3 text-lg">Nom :</p>
                      <p className="text-white font-medium text-2xl">{formData.campaignName}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 mb-3 text-lg">Lancement prévu :</p>
                      <p className="text-white font-medium text-2xl">
                        {new Date(
                          `${formData.launchDate}T${formData.launchTime}`
                        ).toLocaleDateString('fr-FR', {
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

              {/* Navigation - Boutons plus petits */}
              <div className="flex justify-between items-center mt-16 pt-10 border-t border-white/10">
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 text-base font-medium hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Retour</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={!isComplete || loading} // Désactiver pendant le chargement
                  className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 text-base font-medium"
                >
                  {loading ? ( // Afficher un spinner ou un texte de chargement
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                  <span>{loading ? 'Chargement...' : 'Suivant'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
