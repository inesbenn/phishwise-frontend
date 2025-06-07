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
  const [step1Data, setStep1Data] = useState({});
  const [step2Data, setStep2Data] = useState({}); // Nouvelle ligne pour ModelMail
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

    // À l'étape 5, sauvegarder les données de formation
    if (step === 5 && formData) {
      setStep5Data(formData);
      toast.success('Formation sauvegardée !', {
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
          onNext={handleNext}
          onBack={handleBack}
          savedData={step2Data} // Passer les données sauvegardées
        />
      );
      break;
    case 3:
      CurrentStep = (
        <LandingPage 
          campaignId={campaignId}
          onNext={handleNext}
          onBack={handleBack}
          savedData={step3Data} // Passer les données sauvegardées
        />
      );
      break;
    case 4:
      CurrentStep = (
        <SMTP
          campaignId={campaignId}
          onNext={handleNext}
          onBack={handleBack}
          savedData={step4Data} // Passer les données sauvegardées
        />
      );
      break;
    case 5:
      CurrentStep = (
        <LearningPage
          campaignId={campaignId}
          onNext={handleNext}
          onBack={handleBack}
          savedData={step5Data} // Passer les données sauvegardées
        />
      );
      break;
    case 6:
      CurrentStep = (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Campagne Configurée !</h2>
            <p className="text-gray-300">Votre campagne de phishing éducatif est prête.</p>
            <div className="mt-8 p-4 bg-white/10 rounded-lg max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Résumé de la campagne :</h3>
              <div className="text-left space-y-2">
                <p><strong>Étape 0:</strong> {Object.keys(step0Data).length} paramètres généraux</p>
                <p><strong>Étape 1:</strong> {Object.keys(step1Data).length} configurations de cibles</p>
                <p><strong>Étape 2:</strong> {step2Data.selectedTemplates?.length || 0} modèles d'emails sélectionnés</p>
                <p><strong>Étape 3:</strong> {Object.keys(step3Data).length} configurations de landing page</p>
                <p><strong>Étape 4:</strong> {Object.keys(step4Data).length} configurations SMTP</p>
                <p><strong>Étape 5:</strong> {Object.keys(step5Data).length} configurations de formation</p>
              </div>
            </div>
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