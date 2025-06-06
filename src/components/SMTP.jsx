import React, { useState, useEffect } from 'react';
import { Mail, Shield, CheckCircle, XCircle, AlertCircle, Loader, Eye, Copy, RefreshCw } from 'lucide-react';

// Déclaration explicite du composant SMTP
const SMTP = ({ campaignId, onNext, onBack }) => {
  const [smtpConfig, setSmtpConfig] = useState({
    fromEmail: '',
    fromName: ''
  });

  const [dnsValidation, setDnsValidation] = useState({
    spf: { status: 'pending', message: '', record: '' },
    dkim: { status: 'pending', message: '', record: '' },
    dmarc: { status: 'pending', message: '', record: '' }
  });

  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
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
      // const response = await fetch(`/api/dns-validation/${domain}`, {
      //   method: 'GET',
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
      // Simulation des résultats pour la démo
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

  const handleSave = async () => {
    if (!smtpConfig.fromEmail || !smtpConfig.fromName) {
      showNotification('Veuillez remplir tous les champs requis', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Simulation de sauvegarde - remplacer par votre API
      // const response = await fetch(`/api/campaigns/${campaignId}/smtp`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(smtpConfig)
      // });

      // Simulation de succès
      setTimeout(() => {
        showNotification('Configuration SMTP sauvegardée !', 'success');
        setTimeout(() => onNext(), 1000);
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      showNotification('Erreur de connexion au serveur', 'error');
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />;
      default:
        return <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-600" />;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              PhishWise
            </h1>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">
              Nouvelle Campagne
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Progress Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Création de Campagne</h2>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full" style={{width: '71.43%'}}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Général</span>
            <span>Cibles</span>
            <span>Email</span>
            <span>Landing</span>
            <span className="text-cyan-300">SMTP</span>
            <span>Formation</span>
            <span>Révision</span>
          </div>
        </div>

        {/* Main Section - SMTP Configuration */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Configuration SMTP</h3>
              <p className="text-gray-300">Paramètres d'envoi d'email et validation DNS</p>
            </div>
          </div>

          {/* SMTP Configuration Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Adresse Email d'Expédition *
                </label>
                <input
                  type="email"
                  value={smtpConfig.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                  placeholder="noreply@votre-domaine.com"
                />
                <p className="text-xs text-gray-400 mt-1">Format valide requis avec @ et domaine</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nom d'Affichage *
                </label>
                <input
                  type="text"
                  value={smtpConfig.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                  placeholder="Équipe Sécurité"
                  minLength="2"
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 2 caractères</p>
              </div>
            </div>

            {/* DNS Verification Button */}
            <div className="flex justify-center">
              <button
                onClick={validateDNSRecords}
                disabled={!isFormValid() || isValidating}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
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
        </div>

        {/* DNS Validation */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Résultats de Validation DNS</h3>
                <p className="text-gray-300">Vérification des enregistrements SPF, DKIM et DMARC</p>
              </div>
            </div>
            {validationComplete && (
              <button
                onClick={validateDNSRecords}
                disabled={isValidating || !isFormValid()}
                className="bg-white/10 text-white border border-white/20 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Revérifier</span>
              </button>
            )}
          </div>

          {smtpConfig.fromEmail && validationComplete ? (
            <div className="space-y-4">
              {/* SPF */}
              <div className={`p-4 rounded-lg border ${getStatusColor(dnsValidation.spf.status)} transition-all duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(dnsValidation.spf.status)}
                    <div className="flex-1">
                      <div className="text-base font-medium text-white">
                        SPF (Sender Policy Framework)
                      </div>
                      {dnsValidation.spf.message && (
                        <div className="text-sm text-gray-300 mt-1">
                          {dnsValidation.spf.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm rounded-full border ${
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
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {showRecord === 'spf' && dnsValidation.spf.record && (
                  <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Enregistrement à ajouter :</span>
                      <button
                        onClick={() => copyToClipboard(dnsValidation.spf.record)}
                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded"
                        title="Copier"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <code className="text-xs text-cyan-300 break-all block">{dnsValidation.spf.record}</code>
                  </div>
                )}
              </div>

              {/* DKIM */}
              <div className={`p-4 rounded-lg border ${getStatusColor(dnsValidation.dkim.status)} transition-all duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(dnsValidation.dkim.status)}
                    <div className="flex-1">
                      <div className="text-base font-medium text-white">
                        DKIM (DomainKeys Identified Mail)
                      </div>
                      {dnsValidation.dkim.message && (
                        <div className="text-sm text-gray-300 mt-1">
                          {dnsValidation.dkim.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm rounded-full border ${
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
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {showRecord === 'dkim' && dnsValidation.dkim.record && (
                  <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Enregistrement à ajouter :</span>
                      <button
                        onClick={() => copyToClipboard(dnsValidation.dkim.record)}
                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded"
                        title="Copier"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <code className="text-xs text-cyan-300 break-all block">{dnsValidation.dkim.record}</code>
                  </div>
                )}
              </div>

              {/* DMARC */}
              <div className={`p-4 rounded-lg border ${getStatusColor(dnsValidation.dmarc.status)} transition-all duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(dnsValidation.dmarc.status)}
                    <div className="flex-1">
                      <div className="text-base font-medium text-white">
                        DMARC (Domain-based Message Authentication)
                      </div>
                      {dnsValidation.dmarc.message && (
                        <div className="text-sm text-gray-300 mt-1">
                          {dnsValidation.dmarc.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm rounded-full border ${
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
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {showRecord === 'dmarc' && dnsValidation.dmarc.record && (
                  <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Enregistrement à ajouter :</span>
                      <button
                        onClick={() => copyToClipboard(dnsValidation.dmarc.record)}
                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded"
                        title="Copier"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <code className="text-xs text-cyan-300 break-all block">{dnsValidation.dmarc.record}</code>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-base text-gray-400">
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
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Résumé de Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Email d'Expédition :</span>
                <span className="text-white ml-2">{smtpConfig.fromEmail}</span>
              </div>
              <div>
                <span className="text-gray-400">Nom d'Affichage :</span>
                <span className="text-white ml-2">{smtpConfig.fromName}</span>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="text-gray-400">Statut DNS :</span>
                <span className="ml-2">
                  {dnsValidation.spf.status === 'success' && dnsValidation.dkim.status === 'success' && dnsValidation.dmarc.status === 'success' ? (
                    <span className="text-green-400">✓ Tous les enregistrements sont valides</span>
                  ) : (
                    <span className="text-amber-400">⚠ Certains enregistrements nécessitent une attention</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6">
          <button
            onClick={onBack}
            className="bg-white/10 text-white border border-white/20 hover:bg-white/20 px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Précédent
          </button>

          <button
            onClick={handleSave}
            disabled={!isFormValid() || isSaving}
            className="bg-gradient-to-r from-cyan-400 to-purple-400 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
          >
            {isSaving ? 'Sauvegarde...' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Export par défaut explicite
export default SMTP;