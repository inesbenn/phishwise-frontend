import React, { useState, useEffect } from 'react';
import { Mail, Shield, CheckCircle, XCircle, AlertCircle, Loader, Eye, Copy, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
// Import the API functions from your campaigns.js file
import {
  configureCampaignDNS,
  getCampaignDNSStatus
} from '../api/campaigns';

const SMTP = ({ campaignId, onNext, onBack, savedData = {} }) => {
  // Reset default styles for body and html elements
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  // State for SMTP configuration (from email, from name)
  const [smtpConfig, setSmtpConfig] = useState({
    fromEmail: savedData.fromEmail || '',
    fromName: savedData.fromName || ''
  });

  // State for DNS validation results
  const [dnsValidation, setDnsValidation] = useState(savedData.dnsValidation || {
    spf: { status: 'pending', message: '', record: '' },
    dkim: { status: 'pending', message: '', record: '' },
    dmarc: { status: 'pending', message: '', record: '' }
  });

  // State for UI loading/saving indicators and notifications
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationComplete, setValidationComplete] = useState(savedData.validationComplete || false);
  const [notification, setNotification] = useState(null);
  const [showRecord, setShowRecord] = useState(null); // To toggle visibility of DNS records

  // Function to display temporary notifications to the user
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Hide notification after 3 seconds
  };

  // Effect hook to fetch existing campaign data when the component mounts or campaignId changes
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) {
        // If no campaignId is provided, there's nothing to fetch
        return;
      }
      try {
        // Fetch the DNS status for the current campaign from the backend
        const response = await getCampaignDNSStatus(campaignId);
        if (response.success && response.data) {
          const { 
            domain, 
            dnsValidation: fetchedDnsValidation, 
            validationComplete: fetchedValidationComplete, 
            fromEmail, 
            fromName 
          } = response.data;
          
          // Update SMTP config with fetched data
          setSmtpConfig(prev => ({
            fromEmail: fromEmail || prev.fromEmail,
            fromName: fromName || prev.fromName
          }));
          
          // Update DNS validation state with fetched data, or reset to pending if none
          setDnsValidation(fetchedDnsValidation || {
            spf: { status: 'pending', message: '', record: '' },
            dkim: { status: 'pending', message: '', record: '' },
            dmarc: { status: 'pending', message: '', record: '' }
          });
          
          // Update overall validation complete status
          setValidationComplete(fetchedValidationComplete || false);

          console.log('✅ Données de campagne chargées:', {
            fromEmail: fromEmail || 'Non défini',
            fromName: fromName || 'Non défini',
            domain: domain || 'Non défini',
            validationComplete: fetchedValidationComplete || false
          });
        }
      } catch (error) {
        console.error("Error fetching campaign DNS status:", error);
        // Display an error notification to the user
        showNotification(error.message || 'Erreur lors du chargement des données de campagne DNS.', 'error');
      }
    };
    fetchCampaignData();
  }, [campaignId]); // Dependency array: re-run effect if campaignId changes

  // Function to trigger DNS record validation via backend API
  const validateDNSRecords = async () => {
    if (!smtpConfig.fromEmail) {
      showNotification('Veuillez entrer une adresse email', 'error');
      return;
    }

    setIsValidating(true); // Set loading state
    // Extract domain from email for the backend payload
    const domainToValidate = smtpConfig.fromEmail.split('@')[1]; 

    try {
      console.log('🔍 Début validation DNS/SMTP:', {
        domain: domainToValidate,
        fromEmail: smtpConfig.fromEmail,
        fromName: smtpConfig.fromName,
        campaignId
      });

      // Call the backend API to configure and validate DNS for the campaign
      // This will also save the SMTP configuration (fromEmail, fromName)
      const response = await configureCampaignDNS(campaignId, { 
        domain: domainToValidate,
        fromEmail: smtpConfig.fromEmail,
        fromName: smtpConfig.fromName
      });

      if (response.success && response.data.validationResults) {
        const results = response.data.validationResults;
        // Update local state with the validation results from the backend
        setDnsValidation({
          spf: results.spf,
          dkim: results.dkim,
          dmarc: results.dmarc
        });
        setValidationComplete(results.validationComplete);
        
        console.log('✅ Validation DNS/SMTP terminée:', {
          validationComplete: results.validationComplete,
          spfStatus: results.spf.status,
          dkimStatus: results.dkim.status,
          dmarcStatus: results.dmarc.status,
          smtpSaved: response.data.smtpData ? 'Oui' : 'Non'
        });

        showNotification('Validation DNS terminée et configuration SMTP sauvegardée !', 'success');
      } else {
        // Show error message from backend if validation was not successful
        showNotification(response.message || 'La validation DNS a échoué.', 'error');
      }
    } catch (error) {
      console.error('API Error during DNS validation:', error);
      // Display a general error notification for API call failures
      showNotification(error.message || 'Erreur lors de la validation DNS. Vérifiez la console.', 'error');
    } finally {
      setIsValidating(false); // Reset loading state
    }
  };

  // Handler for input field changes
  const handleInputChange = (field, value) => {
    setSmtpConfig(prev => ({
      ...prev,
      [field]: value
    }));

    // If the email changes, reset the DNS validation status to prompt re-validation
    if (field === 'fromEmail') {
      setValidationComplete(false);
      setDnsValidation({
        spf: { status: 'pending', message: '', record: '' },
        dkim: { status: 'pending', message: '', record: '' },
        dmarc: { status: 'pending', message: '', record: '' }
      });
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    // Using document.execCommand('copy') for broader compatibility in some iframe environments
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showNotification('Enregistrement copié dans le presse-papier', 'success');
    } catch (err) {
      console.error('Failed to copy: ', err);
      showNotification('Échec de la copie dans le presse-papier', 'error');
    }
    document.body.removeChild(textArea);
  };

  // Handler for the "Next" button
  const handleNext = async () => {
    if (!smtpConfig.fromEmail || !smtpConfig.fromName) {
      showNotification('Veuillez remplir tous les champs requis', 'error');
      return;
    }
    
    // Ensure DNS validation is complete and successful before allowing to proceed
    if (!validationComplete) {
        showNotification('Veuillez valider la configuration DNS avant de continuer.', 'warning');
        return;
    }

    setIsSaving(true); // Set saving state
    try {
      console.log('💾 Passage à l\'étape suivante avec configuration SMTP:', {
        fromEmail: smtpConfig.fromEmail,
        fromName: smtpConfig.fromName,
        validationComplete,
        domain: smtpConfig.fromEmail.split('@')[1]
      });

      // The SMTP configuration is already saved in the backend via the validateDNSRecords call
      // which uses configureCampaignDNS. No additional save is needed here.
      
      showNotification('Configuration SMTP validée ! Passage à l\'étape suivante...', 'success');
      
      if (onNext) {
          // Pass the necessary data for the next step.
          // This includes the current SMTP config and the final DNS validation state.
          onNext(null, {
            fromEmail: smtpConfig.fromEmail,
            fromName: smtpConfig.fromName,
            dnsValidation: dnsValidation, // Pass the current state of DNS validation
            validationComplete: validationComplete,
            domain: smtpConfig.fromEmail.split('@')[1] // The domain derived from email
          });
      }
    } catch (error) {
      console.error('Error during next step transition:', error);
      showNotification(error.message || 'Erreur lors du passage à l\'étape suivante.', 'error');
    } finally {
      setIsSaving(false); // Reset saving state
    }
  };

  // Handler for the "Back" button
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Helper function to determine the icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending': // Icon for pending status
        return <Loader className="w-5 h-5 animate-spin text-gray-400" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-600" />; // Default placeholder
    }
  };

  // Helper function to determine the border and background color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-400/50 bg-green-500/20';
      case 'warning':
        return 'border-amber-400/50 bg-amber-500/10';
      case 'error':
        return 'border-red-400/50 bg-red-500/20';
      default:
        return 'border-white/20 bg-white/5'; // Default for pending/initial
    }
  };

  // Function to check if the form inputs are valid for submission/validation
  const isFormValid = () => {
    // Basic email format check using a regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return smtpConfig.fromEmail &&
           smtpConfig.fromName &&
           emailRegex.test(smtpConfig.fromEmail) &&
           smtpConfig.fromName.length >= 2;
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto"
      style={{ margin: 0, padding: 0, top: 0, left: 0 }}
    >
      {/* Notification Display */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[60] p-4 rounded-lg border backdrop-blur-lg transform transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500/20 border-green-400/50 text-green-400' :
          notification.type === 'error' ? 'bg-red-500/20 border-red-400/50 text-red-400' :
          notification.type === 'warning' ? 'bg-amber-500/10 border-amber-400/50 text-amber-400' :
          'bg-blue-500/20 border-blue-400/50 text-blue-400'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5" />}
            {notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
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
          {/* Progress Bar and Step Indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Création de Campagne</h2>
              <span className="text-lg text-gray-300">Étape 5 sur 7</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-3 rounded-full w-[71.43%] transition-all duration-500"></div>
            </div>

            <div className="grid grid-cols-7 gap-4 mt-4 text-sm text-gray-400">
              {['Paramètres', 'Cibles', 'Modèles', "Page d'atterrissage", 'SMTP', 'Formation', 'Finaliser'].map((step, i) => (
                <span
                  key={step}
                  className={`text-center font-medium ${i === 4 ? 'text-cyan-400' : ''}`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-10">
            {/* Section Header: SMTP Configuration */}
            <div className="flex items-center space-x-6 mb-10">
              <div className="p-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Configuration SMTP</h3>
                <p className="text-lg text-gray-300">
                  Paramètres d'envoi d'email et validation DNS
                </p>
              </div>
            </div>

            {/* SMTP Configuration Form */}
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* From Email Input */}
                <div>
                  <label className="block text-white text-xl font-medium mb-5">
                    Adresse Email d'Expédition *
                  </label>
                  <input
                    type="email"
                    value={smtpConfig.fromEmail}
                    onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                    className="w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                    placeholder="noreply@votre-domaine.com"
                  />
                  <p className="text-base text-gray-400 mt-3">Format valide requis avec @ et domaine</p>
                </div>

                {/* From Name Input */}
                <div>
                  <label className="block text-white text-xl font-medium mb-5">
                    Nom d'Affichage *
                  </label>
                  <input
                    type="text"
                    value={smtpConfig.fromName}
                    onChange={(e) => handleInputChange('fromName', e.target.value)}
                    className="w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                    placeholder="Équipe Sécurité"
                    minLength="2"
                  />
                  <p className="text-base text-gray-400 mt-3">Minimum 2 caractères</p>
                </div>
              </div>

              {/* DNS Verification Button */}
              <div className="flex justify-center">
                <button
                  onClick={validateDNSRecords}
                  disabled={!isFormValid() || isValidating}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium text-base rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 hover:scale-105 disabled:hover:scale-100"
                >
                  {isValidating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Vérification et sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Vérifier la Configuration DNS</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* DNS Validation Results Section */}
            <div className="mt-16 pt-10 border-t border-white/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-xl">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">Résultats de Validation DNS</h4>
                    <p className="text-lg text-gray-300">Vérification des enregistrements SPF, DKIM et DMARC</p>
                  </div>
                </div>
                {smtpConfig.fromEmail && ( // Only show re-check button if an email is entered
                  <button
                    onClick={validateDNSRecords}
                    disabled={isValidating || !isFormValid()}
                    className="flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 disabled:opacity-50 border border-white/20 text-base font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Revérifier</span>
                  </button>
                )}
              </div>

              {smtpConfig.fromEmail ? ( // Display results if email is entered
                <div className="space-y-6">
                  {/* SPF Result Block */}
                  <div className={`p-6 rounded-xl border ${getStatusColor(dnsValidation.spf.status)} transition-all duration-200`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(dnsValidation.spf.status)}
                        <div className="flex-1">
                          <div className="text-lg font-medium text-white">
                            SPF (Sender Policy Framework)
                          </div>
                          {dnsValidation.spf.message && (
                            <div className="text-base text-gray-300 mt-2">
                              {dnsValidation.spf.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-4 py-2 text-base rounded-full border ${
                          dnsValidation.spf.status === 'success' ? 'border-green-400/50 text-green-400' :
                          dnsValidation.spf.status === 'warning' ? 'border-amber-400/50 text-amber-400' :
                          dnsValidation.spf.status === 'error' ? 'border-red-400/50 text-red-400' :
                          'border-white/20 text-gray-400'
                        }`}>
                          {dnsValidation.spf.status === 'success' ? 'OK' :
                           dnsValidation.spf.status === 'warning' ? 'Attention' :
                           dnsValidation.spf.status === 'pending' ? 'En attente' : 'Erreur'}
                        </span>
                        {dnsValidation.spf.status === 'error' && dnsValidation.spf.record && (
                          <button
                            onClick={() => setShowRecord(showRecord === 'spf' ? null : 'spf')}
                            className="text-cyan-400 hover:text-cyan-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Voir l'enregistrement à copier"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {showRecord === 'spf' && dnsValidation.spf.record && (
                      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-base text-gray-300">Enregistrement à ajouter :</span>
                          <button
                            onClick={() => copyToClipboard(dnsValidation.spf.record)}
                            className="text-cyan-400 hover:text-cyan-300 p-1 rounded"
                            title="Copier"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <code className="text-sm text-cyan-300 break-all block">{dnsValidation.spf.record}</code>
                      </div>
                    )}
                  </div>

                  {/* DKIM Result Block */}
                  <div className={`p-6 rounded-xl border ${getStatusColor(dnsValidation.dkim.status)} transition-all duration-200`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(dnsValidation.dkim.status)}
                        <div className="flex-1">
                          <div className="text-lg font-medium text-white">
                            DKIM (DomainKeys Identified Mail)
                          </div>
                          {dnsValidation.dkim.message && (
                            <div className="text-base text-gray-300 mt-2">
                              {dnsValidation.dkim.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-4 py-2 text-base rounded-full border ${
                          dnsValidation.dkim.status === 'success' ? 'border-green-400/50 text-green-400' :
                          dnsValidation.dkim.status === 'warning' ? 'border-amber-400/50 text-amber-400' :
                          dnsValidation.dkim.status === 'error' ? 'border-red-400/50 text-red-400' :
                          'border-white/20 text-gray-400'
                        }`}>
                          {dnsValidation.dkim.status === 'success' ? 'OK' :
                           dnsValidation.dkim.status === 'warning' ? 'Attention' :
                           dnsValidation.dkim.status === 'pending' ? 'En attente' : 'Erreur'}
                        </span>
                        {dnsValidation.dkim.status === 'error' && dnsValidation.dkim.record && (
                          <button
                            onClick={() => setShowRecord(showRecord === 'dkim' ? null : 'dkim')}
                            className="text-cyan-400 hover:text-cyan-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Voir l'enregistrement à copier"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {showRecord === 'dkim' && dnsValidation.dkim.record && (
                      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-base text-gray-300">Enregistrement à ajouter :</span>
                          <button
                            onClick={() => copyToClipboard(dnsValidation.dkim.record)}
                            className="text-cyan-400 hover:text-cyan-300 p-1 rounded"
                            title="Copier"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <code className="text-sm text-cyan-300 break-all block">{dnsValidation.dkim.record}</code>
                      </div>
                    )}
                  </div>

                  {/* DMARC Result Block */}
                  <div className={`p-6 rounded-xl border ${getStatusColor(dnsValidation.dmarc.status)} transition-all duration-200`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(dnsValidation.dmarc.status)}
                        <div className="flex-1">
                          <div className="text-lg font-medium text-white">
                            DMARC (Domain-based Message Authentication)
                          </div>
                          {dnsValidation.dmarc.message && (
                            <div className="text-base text-gray-300 mt-2">
                              {dnsValidation.dmarc.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-4 py-2 text-base rounded-full border ${
                          dnsValidation.dmarc.status === 'success' ? 'border-green-400/50 text-green-400' :
                          dnsValidation.dmarc.status === 'warning' ? 'border-amber-400/50 text-amber-400' :
                          dnsValidation.dmarc.status === 'error' ? 'border-red-400/50 text-red-400' :
                          'border-white/20 text-gray-400'
                        }`}>
                          {dnsValidation.dmarc.status === 'success' ? 'OK' :
                           dnsValidation.dmarc.status === 'warning' ? 'Attention' :
                           dnsValidation.dmarc.status === 'pending' ? 'En attente' : 'Erreur'}
                        </span>
                        {dnsValidation.dmarc.status === 'error' && dnsValidation.dmarc.record && (
                          <button
                            onClick={() => setShowRecord(showRecord === 'dmarc' ? null : 'dmarc')}
                            className="text-cyan-400 hover:text-cyan-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Voir l'enregistrement à copier"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {showRecord === 'dmarc' && dnsValidation.dmarc.record && (
                      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-base text-gray-300">Enregistrement à ajouter :</span>
                          <button
                            onClick={() => copyToClipboard(dnsValidation.dmarc.record)}
                            className="text-cyan-400 hover:text-cyan-300 p-1 rounded"
                            title="Copier"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <code className="text-sm text-cyan-300 break-all block">{dnsValidation.dmarc.record}</code>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Placeholder message if no email is entered or validation hasn't started
                <div className="text-center py-16">
                  <Shield className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                  <p className="text-lg text-gray-400">
                    {!smtpConfig.fromEmail ?
                      'Entrez une adresse email et cliquez sur "Vérifier la Configuration DNS"' :
                      'Cliquez sur "Vérifier la Configuration DNS" pour commencer la validation'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Summary Block (displayed only if validation is complete) */}
            {validationComplete && (
              <div className="mt-16 pt-10 border-t border-white/10">
                <h4 className="text-2xl font-bold text-white mb-8">Résumé de Configuration</h4>
                <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                    <div>
                      <span className="text-gray-400">Email d'Expédition :</span>
                      <span className="text-white ml-3 font-medium">{smtpConfig.fromEmail}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Nom d'Affichage :</span>
                      <span className="text-white ml-3 font-medium">{smtpConfig.fromName}</span>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <span className="text-gray-400">Statut DNS :</span>
                      <span className="ml-3">
                        {dnsValidation.spf.status === 'success' && dnsValidation.dkim.status === 'success' && dnsValidation.dmarc.status === 'success' ? (
                          <span className="text-green-400 font-medium">✓ Tous les enregistrements sont valides</span>
                        ) : (
                          <span className="text-amber-400 font-medium">⚠ Certains enregistrements nécessitent une attention</span>
                        )}
                      </span>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <span className="text-gray-400">Configuration SMTP :</span>
                      <span className="text-green-400 font-medium ml-3">✓ Sauvegardée dans la campagne</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-16 pt-10 border-t border-white/10">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 text-base font-medium hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>
              
              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={!isFormValid() || isSaving || !validationComplete} // Disabled if form invalid, saving, or validation not complete
                className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 text-base font-medium"
              >
                <span>{isSaving ? 'Sauvegarde...' : 'Suivant'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMTP;
