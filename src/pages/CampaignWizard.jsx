// src/pages/CampaignWizard.jsx
import { useState } from 'react';
import Step0_General from '../components/Step0_General';
// import Step1_Targets from '../components/Step1_Targets'; // à venir

// Import pour React-Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CampaignWizard() {
  const [step, setStep] = useState(0);
  const [campaignId, setCampaignId] = useState(null);

  const handleNext = newId => {
    if (!campaignId) {
      setCampaignId(newId);

      // Afficher une notification de succès
      toast.success('Campagne créée !', {
        position: 'top-center',
        autoClose: 3000
      });
    }
    setStep(s => s + 1);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <ToastContainer /> {/* ← Obligatoire pour afficher les toasts */}

      <h1 className="text-2xl font-bold mb-4">Création de campagne</h1>

      {step === 0 && (
        <Step0_General campaignId={campaignId} onNext={handleNext} />
      )}

      {step === 1 && (
        <div>
          {/* <Step1_Targets campaignId={campaignId} onNext={handleNext} /> */}
          Étape 1 — Gestion des cibles (à implémenter)
        </div>
      )}

      {/* Etapes 2 à 6 */}
    </div>
  );
}
