// src/pages/CampaignWizard.jsx
import React, { useState } from 'react';
import Step0_General from '../components/Step0_General';
import Step1_Targets from '../components/Step1_Targets';
import ModelMail from '../components/ModelMail';
import LandingPage from '../components/LandingPage'; 
import SMTP from '../components/SMTP';
import LearningPage from '../components/LearningPage'; 
import PhishWiseFinalValidation from '../components/PhishWiseFinalValidation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ 8 étapes au total (0 à 7)
const TOTAL_STEPS = 8; 

export default function CampaignWizard() {
  const [step, setStep] = useState(0);
  const [campaignId, setCampaignId] = useState(null);
  
  // État pour sauvegarder les données de chaque étape
  const [step0Data, setStep0Data] = useState({});
  const [step1Data, setStep1Data] = useState({});
  const [step2Data, setStep2Data] = useState({}); // Pour ModelMail
  const [step3Data, setStep3Data] = useState({}); // Pour LandingPage
  const [step4Data, setStep4Data] = useState({}); // Pour SMTP
  const [step5Data, setStep5Data] = useState({}); // Pour LearningPage

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

    // À l'étape 2, sauvegarder les données des modèles d'emails
    if (step === 2 && formData) {
      setStep2Data(formData);
      toast.success('Modèles d\'emails sauvegardés !', {
        position: 'top-center',
        autoClose: 2000
      });
    }

    // À l'étape 3, sauvegarder les données de la landing page
    if (step === 3 && formData) {
      setStep3Data(formData);
      toast.success('Page d\'atterrissage sauvegardée !', {
        position: 'top-center',
        autoClose: 2000
      });
    }

    // À l'étape 4, sauvegarder les données SMTP
    if (step === 4 && formData) {
      setStep4Data(formData);
      toast.success('Configuration SMTP sauvegardée !', {
        position: 'top-center',
        autoClose: 2000
      });
    }

    // ✅ À l'étape 5, sauvegarder les données de formation
    if (step === 5 && formData) {
      setStep5Data(formData);
      toast.success('Formation sauvegardée !', {
        position: 'top-center',
        autoClose: 2000
      });
    }

    // ✅ À l'étape 6 (PhishWiseFinalValidation), pas de toast ici car c'est géré dans le composant
    // Le lancement de la campagne sera géré par PhishWiseFinalValidation directement

    // ✅ Passer à l'étape suivante (max étape 7 = index 6)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  // ✅ Fonction pour gérer le lancement depuis PhishWiseFinalValidation
  const handleLaunchCampaign = () => {
    toast.success('Campagne lancée avec succès !', {
      position: 'top-center',
      autoClose: 5000
    });
    // Ici vous pouvez rediriger vers la liste des campagnes ou le dashboard
    console.log('Campaign launched successfully!');
    // Exemple: window.location.href = '/campaigns';
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
          savedData={step1Data}
        />
      );
      break;
    case 2:
      CurrentStep = (
        <ModelMail
          campaignId={campaignId}
          onNext={handleNext}
          onBack={handleBack}
          savedData={step2Data}
        />
      );
      break;
    case 3:
      CurrentStep = (
        <LandingPage 
          campaignId={campaignId}
          onNext={handleNext}
          onBack={handleBack}
          savedData={step3Data}
        />
      );
      break;
    case 4:
      CurrentStep = (
        <SMTP
          campaignId={campaignId}
          onNext={handleNext}
          onBack={handleBack}
          savedData={step4Data}
        />
      );
      break;
    // ✅ Étape 5 - LearningPage (Formation)
    case 5:
      CurrentStep = (
        <LearningPage
          campaignId={campaignId}
          onNext={handleNext}
          onBack={handleBack}
          savedData={step5Data}
        />
      );
      break;
    // ✅ Étape 6 - PhishWiseFinalValidation (Finalisation)
    case 6:
      CurrentStep = (
        <PhishWiseFinalValidation
          campaignId={campaignId}
        onBack={handleBack}
          onLaunch={handleLaunchCampaign}
          // Passer toutes les données des étapes précédentes
          allStepsData={{
            step0: step0Data,
            step1: step1Data,
            step2: step2Data,
            step3: step3Data,
            step4: step4Data,
            step5: step5Data
          }}
        />
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