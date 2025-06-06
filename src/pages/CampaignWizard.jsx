// src/pages/CampaignWizard.jsx
import React, { useState } from 'react';
import Step0_General from '../components/Step0_General';
import Step1_Targets from '../components/Step1_Targets';
import ModelMail from '../components/ModelMail';
import LandingPage from '../components/LandingPage'; 
import SMTP from '../components/SMTP';
import LearningPage from '../components/LearningPage'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TOTAL_STEPS = 7; 

export default function CampaignWizard() {
  const [step, setStep] = useState(0);
  const [campaignId, setCampaignId] = useState(null);
  
  // État pour sauvegarder les données de chaque étape
  const [step0Data, setStep0Data] = useState({});
  const [step1Data, setStep1Data] = useState({}); // Nouvelle ligne pour Step1

  const handleNext = (newId, formData) => {
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
      
      // Sauvegarder les données du formulaire
      if (formData) {
        setStep0Data(formData);
      }
      
      toast.success('Campagne créée !', {
        position: 'top-center',
        autoClose: 3000
      });
    }
    
    // À l'étape 1, sauvegarder les données des cibles
    if (step === 1 && formData) {
      setStep1Data(formData);
      toast.success('Cibles sauvegardées !', {
        position: 'top-center',
        autoClose: 2000
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
      CurrentStep = <Step0_General onNext={handleNext} savedData={step0Data} />;
      break;
    case 1:
      CurrentStep = (
        <Step1_Targets
          campaignId={campaignId}
          onNext={handleNext}
          onBack={handleBack}
          savedData={step1Data} // Passer les données sauvegardées
        />
      );
      break;
    case 2:
      CurrentStep = (
        <ModelMail
          campaignId={campaignId}
          onNext={() => handleNext()}
          onBack={handleBack}
        />
      );
      break;
    case 3:
      CurrentStep = (
        <LandingPage 
          campaignId={campaignId}
          onNext={() => handleNext()}
          onBack={handleBack}
        />
      );
      break;
      case 4:
      CurrentStep = (
        <SMTP
          campaignId={campaignId}
          onNext={() => handleNext()}
          onBack={handleBack}
        />
      );
      break;
       case 5:
      CurrentStep = (
        < LearningPage
          campaignId={campaignId}
          onNext={() => handleNext()}
          onBack={handleBack}
        />
      );
      break;
    case 6:
      CurrentStep = (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Campagne Configurée !</h2>
            <p className="text-gray-300">Votre campagne de phishing éducatif est prête.</p>
          </div>
        </div>
      );
      break;

    default:
      CurrentStep = null;
  }

  return (
  <div className="w-full mx-auto space-y-6">
      <ToastContainer />
    {CurrentStep}
  </div>
  );
}