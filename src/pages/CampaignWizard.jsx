// src/pages/CampaignWizard.jsx
import React, { useState } from 'react';
import Step0_General from '../components/Step0_General';
import Step1_Targets from '../components/Step1_Targets';
import NewsPage from '../components/NewsPage';
import EmailTemplatesPage from '../components/EmailTemplatesPage'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TOTAL_STEPS = 4;

export default function CampaignWizard() {
  const [step, setStep] = useState(0);
  const [campaignId, setCampaignId] = useState(null);

  const handleNext = (newId) => {
    // À l'étape 0, on doit absolument recevoir un newId pour continuer
    if (step === 0) {
      if (!newId) {
        toast.error('Erreur : impossible de créer la campagne.', {
          position: 'top-center',
          autoClose: 3000
        });
        return;
      }
      setCampaignId(newId);
      toast.success('Campagne créée !', {
        position: 'top-center',
        autoClose: 3000
      });
    }

    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  let CurrentStep;
  switch (step) {
    case 0:
      CurrentStep = <Step0_General onNext={handleNext} />;
      break;
    case 1:
      CurrentStep = (
        <Step1_Targets
          campaignId={campaignId}
          onNext={() => handleNext()}
          onBack={handleBack}
        />
      );
      break;
    case 2:
      CurrentStep = (
        <NewsPage
          campaignId={campaignId}
          onNext={() => handleNext()}
          onBack={handleBack}
        />
      );
      break;
    case 3:
      CurrentStep = (
        <EmailTemplatesPage
          campaignId={campaignId}
          onNext={() => handleNext()}
          onBack={handleBack}
        />
      );
      break;
    default:
      CurrentStep = null;
  }

  return (
    <div className="w-full mx-auto mt-8 space-y-6 px-4">
      <ToastContainer />

      {CurrentStep}
      {/* Vous pouvez ajouter un petit indicateur de progression ici si besoin */}
    </div>
  );
}
