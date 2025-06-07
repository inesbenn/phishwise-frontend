import React, { useState, useEffect } from 'react';
import { Mail, Shield, CheckCircle, XCircle, AlertCircle, Loader, Eye, Copy, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';

const SMTP = ({ campaignId, onNext, onBack, savedData = {} }) => {
  // Reset default styles
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  const [smtpConfig, setSmtpConfig] = useState({
    fromEmail: savedData.fromEmail || '',
    fromName: savedData.fromName || ''
  });

  const [dnsValidation, setDnsValidation] = useState(savedData.dnsValidation || {
    spf: { status: 'pending', message: '', record: '' },
    dkim: { status: 'pending', message: '', record: '' },
    dmarc: { status: 'pending', message: '', record: '' }
  });

  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationComplete, setValidationComplete] = useState(savedData.validationComplete || false);
  const [notification, setNotification] = useState(null);
  const [showRecord, setShowRecord] = useState(null);

  // Function to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateDNSRecords = async () => {
    if (!smtpConfig.fromEmail) {
      showNotification('Veuillez entrer une adresse email', 'error');
      return;
    }
    
    setIsValidating(true);
    const domain = smtpConfig.fromEmail.split('@')[1];
    
    try {
      // Simulation de validation DNS - remplacer par votre API
      setTimeout(() => {
        setDnsValidation({
          spf: { 
            status: 'success', 
            message: 'Enregistrement SPF valide trouvé',
            record: `v=spf1 include:_spf.${domain} ~all`
          },
          dkim: { 
            status: 'error', 
            message: 'Clé publique non trouvée pour selector1',
            record: `selector1._domainkey.${domain} IN TXT "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3..."`
          },
          dmarc: { 
            status: 'error', 
            message: 'Aucun enregistrement DMARC trouvé',
            record: `_dmarc.${domain} IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}"`
          }
        });
        setValidationComplete(true);
      }, 2000);
    } catch (error) {
      showNotification('Erreur de validation DNS', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSmtpConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'fromEmail') {
      setValidationComplete(false);
      setDnsValidation({
        spf: { status: 'pending', message: '', record: '' },
        dkim: { status: 'pending', message: '', record: '' },
        dmarc: { status: 'pending', message: '', record: '' }
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Enregistrement copié dans le presse-papier', 'success');
  };

  const handleNext = async () => {
    if (!smtpConfig.fromEmail || !smtpConfig.fromName) {
      showNotification('Veuillez remplir tous les champs requis', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Simulation de sauvegarde - remplacer par votre API
      setTimeout(() => {
        showNotification('Configuration SMTP sauvegardée !', 'success');
        if (onNext) {
          const formData = {
            fromEmail: smtpConfig.fromEmail,
            fromName: smtpConfig.fromName,
            dnsValidation,
            validationComplete
          };
          onNext(null, formData);
        }
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      showNotification('Erreur de connexion au serveur', 'error');
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-400/50 bg-green-500/20';
      case 'warning':
        return 'border-amber-400/50 bg-amber-500/10';
      case 'error':
        return 'border-red-400/50 bg-red-500/20';
      default:
        return 'border-white/20 bg-white/5';
    }
  };

  const isFormValid = () => {
    return smtpConfig.fromEmail && 
           smtpConfig.fromName && 
           smtpConfig.fromEmail.includes('@') && 
           smtpConfig.fromEmail.length >= 5;
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto"
      style={{ margin: 0, padding: 0, top: 0, left: 0 }}
    >
      {/* Notification */}
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

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-10">
            {/* Section Header */}
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
                      <span>Vérification...</span>
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

            {/* DNS Validation Results */}
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
                {validationComplete && (
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

              {smtpConfig.fromEmail && validationComplete ? (
                <div className="space-y-6">
                  {/* SPF */}
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
                           dnsValidation.spf.status === 'warning' ? 'Attention' : 'Erreur'}
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

                  {/* DKIM */}
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
                           dnsValidation.dkim.status === 'warning' ? 'Attention' : 'Erreur'}
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

                  {/* DMARC */}
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
                           dnsValidation.dmarc.status === 'warning' ? 'Attention' : 'Erreur'}
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

            {/* Summary Block */}
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
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-16 pt-10 border-t border-white/10">
              <button 
                onClick={handleBack}
                className="flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 text-base font-medium hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>
              
              <button 
                onClick={handleNext}
                disabled={!isFormValid() || isSaving}
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
// SMTP.jsx
export default SMTP;