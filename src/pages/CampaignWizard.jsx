// src/pages/CampaignWizard.jsx
import { useState } from 'react';
import Step0_General  from '../components/Step0_General';
import Step1_Targets  from '../components/Step1_Targets';

// Import pour React-Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CampaignWizard() {
  const [step, setStep] = useState(0);
  const [campaignId, setCampaignId] = useState(null);

  // Passe à l'étape suivante; newId n'est défini que pour l'étape 0
  const handleNext = newId => {
    if (step === 0 && newId) {
      setCampaignId(newId);
      toast.success('Campagne créée !', {
        position: 'top-center',
        autoClose: 3000
      });
    }
    setStep(s => s + 1);
  };

  // Reculer d'une étape
  const handleBack = () => {
    setStep(s => Math.max(s - 1, 0));
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <ToastContainer />

      <h1 className="text-2xl font-bold">Création de campagne</h1>

      {step === 0 && (
        <Step0_General campaignId={campaignId} onNext={handleNext} />
      )}

      {step === 1 && (
        <Step1_Targets
          campaignId={campaignId}
          onNext={() => handleNext()}  // pas de newId à cette étape
          onBack={handleBack}
        />
      )}

      {/* À venir : Steps 2 à 6 */}
    </div>
  );
}
