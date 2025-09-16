import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Globe, 
  Lock, 
  Unlock,
  Eye,
  Calendar,
  Server,
  Activity,
  TrendingUp,
  AlertCircle,
  Info,
  RefreshCw,
  ExternalLink,
  Copy,
  Clock,
  Upload,
  FileText,
  File,
  X,
  Download,
  Trash2
} from 'lucide-react';

// Configuration de l'URL de base du backend
const API_BASE_URL = 'http://localhost:3000/api';

const URLScanner = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [analysisLevel, setAnalysisLevel] = useState('basic');
  const [history, setHistory] = useState([]);
  
  // État pour l'analyse de fichiers
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isAnalyzingFiles, setIsAnalyzingFiles] = useState(false);
  const [fileAnalysisResults, setFileAnalysisResults] = useState([]);
  const fileInputRef = useRef(null);

  // Charger l'historique au montage
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    // État par défaut pour l'historique
    const defaultHistory = [];
    setHistory(defaultHistory);
  };

  const saveToHistory = (scanData) => {
    const newHistory = [
      {
        id: Date.now(),
        url: scanData.url,
        riskLevel: scanData.riskLevel,
        riskScore: scanData.riskScore,
        timestamp: scanData.timestamp
      },
      ...history.slice(0, 4) // Garder seulement les 5 derniers
    ];
    setHistory(newHistory);
  };

  const handleScan = async () => {
    if (!url.trim()) {
      setError('Veuillez entrer une URL à analyser');
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      // Test de connectivité avant l'analyse principale
      const testResponse = await fetch(`${API_BASE_URL}/scanner-test`);
      if (!testResponse.ok) {
        throw new Error('Service d\'analyse non disponible. Les routes ne sont pas configurées correctement.');
      }

      const response = await fetch(`${API_BASE_URL}/check-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url.trim(),
          analysisLevel
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setScanResult(data);
        saveToHistory(data);
      } else {
        setError(data.message || 'Erreur lors de l\'analyse');
      }
    } catch (error) {
      console.error('Erreur scan:', error);
      if (error.message.includes('404')) {
        setError('Service d\'analyse non disponible. Vérifiez que les routes sont configurées dans server.js');
      } else {
        setError(`Erreur de connexion au serveur: ${error.message}`);
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Gestion des fichiers
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setFileAnalysisResults(prev => prev.filter(r => r.fileId !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    
    if (documentTypes.includes(extension)) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const analyzeFiles = async () => {
    if (uploadedFiles.length === 0) {
      setError('Aucun fichier à analyser');
      return;
    }

    setIsAnalyzingFiles(true);
    setError(null);
    
    try {
      const results = [];
      
      for (const fileData of uploadedFiles) {
        // Mettre à jour le statut du fichier
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'analyzing' } : f
        ));

        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('analysisLevel', analysisLevel);

        const response = await fetch(`${API_BASE_URL}/analyze-file`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Erreur analyse fichier ${fileData.name}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          results.push({
            fileId: fileData.id,
            fileName: fileData.name,
            ...data
          });
          
          // Mettre à jour le statut du fichier
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'completed' } : f
          ));
        } else {
          // Marquer le fichier comme ayant échoué
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'error' } : f
          ));
          
          results.push({
            fileId: fileData.id,
            fileName: fileData.name,
            success: false,
            error: data.message || 'Erreur inconnue'
          });
        }
      }
      
      setFileAnalysisResults(results);
      
    } catch (error) {
      console.error('Erreur analyse fichiers:', error);
      setError(`Erreur lors de l'analyse des fichiers: ${error.message}`);
      
      // Marquer tous les fichiers comme ayant échoué
      setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
    } finally {
      setIsAnalyzingFiles(false);
    }
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    setFileAnalysisResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high': return <AlertTriangle className="h-8 w-8 text-red-600" />;
      case 'medium': return <AlertCircle className="h-8 w-8 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-8 w-8 text-green-600" />;
      default: return <Shield className="h-8 w-8 text-gray-600" />;
    }
  };

  const getRiskMessage = (level, score) => {
    switch (level) {
      case 'high': 
        return {
          title: 'DANGER - Ne pas utiliser',
          message: 'Ce contenu présente un risque élevé de sécurité. Évitez de l\'utiliser.',
          color: 'text-red-700'
        };
      case 'medium':
        return {
          title: 'ATTENTION - Soyez prudent',
          message: 'Ce contenu présente des éléments suspects. Procédez avec prudence.',
          color: 'text-yellow-700'
        };
      case 'low':
        return {
          title: 'SÉCURISÉ - Risque faible',
          message: 'Ce contenu semble sûr, mais restez toujours vigilant.',
          color: 'text-green-700'
        };
      default:
        return {
          title: 'Analyse en cours...',
          message: 'Évaluation de la sécurité du contenu.',
          color: 'text-gray-700'
        };
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div className="w-screen bg-gray-50 min-h-screen m-0 p-0 overflow-x-hidden">
      {/* Header - vraie pleine largeur */}
      <div className="bg-white shadow-sm p-6 mb-6 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scanner de Sécurité Avancé</h1>
            <p className="text-gray-600">Analysez la sécurité d'URLs et de fichiers avant de les utiliser</p>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium">
            URLs
          </button>
          <button className="px-4 py-2 rounded-md text-gray-600 hover:text-gray-900">
            Fichiers
          </button>
        </div>

        {/* Section URL */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analyse d'URL</h2>
          
          {/* Formulaire de scan - responsive pleine largeur */}
          <div className="flex flex-col xl:flex-row gap-4 w-full">
            <div className="flex-1">
              <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
                URL à analyser
              </label>
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemple.com ou exemple.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isScanning}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
            
            <div className="xl:w-48">
              <label htmlFor="analysis-level" className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'analyse
              </label>
              <select
                id="analysis-level"
                value={analysisLevel}
                onChange={(e) => setAnalysisLevel(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isScanning}
              >
                <option value="basic">Basique</option>
                <option value="advanced">Avancée</option>
                <option value="full">Complète</option>
              </select>
            </div>
            
            <div className="xl:w-32 flex items-end">
              <button
                onClick={handleScan}
                disabled={isScanning || !url.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Scan...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Analyser
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section Fichiers */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analyse de fichiers</h2>
          
          {/* Zone de téléchargement */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Cliquez pour sélectionner des fichiers
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Formats supportés: PDF, DOC, DOCX, TXT, EXE, ZIP, etc. (max 100MB par fichier)
                  </span>
                </label>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.exe,.zip,.rar,.7z,.tar,.gz,.apk,.ipa,.dmg,.msi"
                />
              </div>
            </div>
          </div>

          {/* Liste des fichiers uploadés */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-gray-900">
                  Fichiers à analyser ({uploadedFiles.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={analyzeFiles}
                    disabled={isAnalyzingFiles || uploadedFiles.every(f => f.status !== 'pending')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                  >
                    {isAnalyzingFiles ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Analyse...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Analyser tout
                      </>
                    )}
                  </button>
                  <button
                    onClick={clearFiles}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Effacer
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {uploadedFiles.map((fileData) => (
                  <div key={fileData.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getFileIcon(fileData.name)}
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {fileData.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(fileData.size)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Indicateur de statut */}
                      <div className="flex items-center gap-2">
                        {fileData.status === 'pending' && (
                          <span className="text-xs text-gray-500">En attente</span>
                        )}
                        {fileData.status === 'analyzing' && (
                          <>
                            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                            <span className="text-xs text-blue-600">Analyse...</span>
                          </>
                        )}
                        {fileData.status === 'completed' && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">Terminé</span>
                          </>
                        )}
                        {fileData.status === 'error' && (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-xs text-red-600">Erreur</span>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeFile(fileData.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 w-full">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Container pour le contenu avec padding latéral */}
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Résultats de l'analyse de fichiers */}
        {fileAnalysisResults.length > 0 && (
          <div className="space-y-6 w-full mb-8">
            <h2 className="text-xl font-bold text-gray-900">Résultats de l'analyse des fichiers</h2>
            
            {fileAnalysisResults.map((result, index) => (
              <div key={index} className={`bg-white shadow-sm border-2 p-6 w-full rounded-lg ${
                result.success ? getRiskColor(result.riskLevel) : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {result.success ? getRiskIcon(result.riskLevel) : <AlertTriangle className="h-8 w-8 text-red-600" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">
                        {result.fileName}
                      </h3>
                      {result.success && (
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {result.riskScore}%
                          </div>
                          <div className="text-sm opacity-75">Score de risque</div>
                        </div>
                      )}
                    </div>
                    
                    {result.success ? (
                      <>
                        <p className={`text-md mb-4 ${getRiskMessage(result.riskLevel, result.riskScore).color}`}>
                          {getRiskMessage(result.riskLevel, result.riskScore).message}
                        </p>
                        
                        {/* Détails de l'analyse fichier */}
                        {result.virusTotal && (
                          <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-gray-900 mb-2">VirusTotal</h4>
                            <div className="text-sm">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-gray-600">Détections:</span>
                                  <span className={`ml-2 font-medium ${result.virusTotal.positives > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {result.virusTotal.positives}/{result.virusTotal.total}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Scan:</span>
                                  <span className="ml-2">{formatDate(result.virusTotal.scanDate)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {result.fileInfo && (
                          <div className="bg-white bg-opacity-50 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-2">Informations du fichier</h4>
                            <div className="text-sm grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-gray-600">Type:</span>
                                <span className="ml-2">{result.fileInfo.type}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Taille:</span>
                                <span className="ml-2">{formatFileSize(result.fileInfo.size)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">MD5:</span>
                                <span className="ml-2 font-mono text-xs">{result.fileInfo.md5}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">SHA256:</span>
                                <span className="ml-2 font-mono text-xs">{result.fileInfo.sha256?.substring(0, 16)}...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-red-700">
                        Erreur lors de l'analyse: {result.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Résultats du scan URL - pleine largeur */}
        {scanResult && (
          <div className="space-y-6 w-full">
            {/* Résultat principal */}
            <div className={`bg-white shadow-sm border-2 p-6 w-full rounded-lg ${getRiskColor(scanResult.riskLevel)}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getRiskIcon(scanResult.riskLevel)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">
                      {getRiskMessage(scanResult.riskLevel, scanResult.riskScore).title}
                    </h2>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {scanResult.riskScore}%
                      </div>
                      <div className="text-sm opacity-75">Score de risque</div>
                    </div>
                  </div>
                  
                  <p className={`text-lg mb-4 ${getRiskMessage(scanResult.riskLevel, scanResult.riskScore).color}`}>
                    {getRiskMessage(scanResult.riskLevel, scanResult.riskScore).message}
                  </p>
                  
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4" />
                      <span className="font-mono text-gray-700 break-all flex-1">{scanResult.url}</span>
                      <button
                        onClick={() => copyToClipboard(scanResult.url)}
                        className="text-gray-500 hover:text-gray-700 p-1 flex-shrink-0"
                        title="Copier l'URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails de l'analyse - grille responsive pleine largeur */}
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
              {/* Vérifications de base */}
              {scanResult.basicChecks && scanResult.basicChecks.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Vérifications de sécurité
                  </h3>
                  <div className="space-y-3">
                    {scanResult.basicChecks.map((check, index) => (
                      <div key={index} className="border-l-4 border-l-red-400 bg-red-50 p-3 rounded-r-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-red-800">{check.message}</div>
                            <div className="text-sm text-red-700 mt-1">{check.details}</div>
                            <div className="text-xs text-red-600 mt-1 font-medium">
                              Gravité: {check.severity.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patterns suspects */}
              {scanResult.suspiciousPatterns && scanResult.suspiciousPatterns.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-yellow-600" />
                    Patterns suspects
                  </h3>
                  <div className="space-y-3">
                    {scanResult.suspiciousPatterns.map((pattern, index) => (
                      <div key={index} className="border-l-4 border-l-yellow-400 bg-yellow-50 p-3 rounded-r-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-yellow-800">{pattern.message}</div>
                            <div className="text-sm text-yellow-700 mt-1">{pattern.details}</div>
                            <div className="text-xs text-yellow-600 mt-1 font-medium">
                              Type: {pattern.type.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structure de l'URL */}
              {scanResult.urlStructure && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gray-600" />
                    Structure de l'URL
                  </h3>
                  {scanResult.urlStructure.isValidUrl ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Protocole:</span>
                          <div className="flex items-center gap-2 mt-1">
                            {scanResult.urlStructure.protocol === 'https:' ? (
                              <Lock className="h-4 w-4 text-green-600" />
                            ) : (
                              <Unlock className="h-4 w-4 text-red-600" />
                            )}
                            <span className={scanResult.urlStructure.protocol === 'https:' ? 'text-green-600' : 'text-red-600'}>
                              {scanResult.urlStructure.protocol}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Domaine:</span>
                          <div className="mt-1 font-mono text-gray-800 break-all">
                            {scanResult.urlStructure.hostname}
                          </div>
                        </div>
                      </div>
                      {scanResult.urlStructure.pathname !== '/' && (
                        <div>
                          <span className="font-medium text-gray-600">Chemin:</span>
                          <div className="mt-1 font-mono text-gray-800 break-all">
                            {scanResult.urlStructure.pathname}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <AlertTriangle className="h-4 w-4 inline mr-2" />
                      URL invalide: {scanResult.urlStructure.error}
                    </div>
                  )}
                </div>
              )}

              {/* Safe Browsing */}
              {scanResult.safeBrowsing && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Google Safe Browsing
                  </h3>
                  {scanResult.safeBrowsing.available ? (
                    <div>
                      {scanResult.safeBrowsing.safe ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Aucune menace détectée</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-medium">Menaces détectées</span>
                          </div>
                          {scanResult.safeBrowsing.threats.map((threat, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded p-2">
                              <div className="text-sm text-red-800">
                                Type: {threat.type.replace('_', ' ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Info className="h-4 w-4 inline mr-2" />
                      Service non disponible
                    </div>
                  )}
                </div>
              )}

              {/* Âge du domaine */}
              {scanResult.domainAge && scanResult.domainAge.available && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Âge du domaine
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Création:</span>
                      <span className="font-medium">
                        {formatDate(scanResult.domainAge.creationDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Âge:</span>
                      <span className="font-medium">
                        {scanResult.domainAge.ageInDays} jours
                      </span>
                    </div>
                    {scanResult.domainAge.suspicious && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">Domaine récent - soyez prudent</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Certificat SSL */}
              {scanResult.sslCertificate && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-green-600" />
                    Certificat SSL
                  </h3>
                  {scanResult.sslCertificate.available && scanResult.sslCertificate.valid ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Certificat valide</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Émetteur: {scanResult.sslCertificate.issuer}</div>
                        <div>Expire le: {formatDate(scanResult.sslCertificate.expiryDate)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <Unlock className="h-4 w-4" />
                      <span className="font-medium">
                        {scanResult.sslCertificate.message || 'Pas de certificat SSL'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Informations sur l'analyse - pleine largeur */}
            <div className="bg-white rounded-lg shadow-sm p-6 w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                Informations sur l'analyse
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Niveau d'analyse:</span>
                  <div className="font-medium text-gray-800 capitalize mt-1">
                    {scanResult.analysisLevel}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Date d'analyse:</span>
                  <div className="font-medium text-gray-800 mt-1">
                    {formatDate(scanResult.timestamp)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Score de risque:</span>
                  <div className="font-medium text-gray-800 mt-1">
                    {scanResult.riskScore}/100
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Niveau de risque:</span>
                  <div className={`font-medium mt-1 capitalize ${
                    scanResult.riskLevel === 'high' ? 'text-red-600' :
                    scanResult.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {scanResult.riskLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandations - pleine largeur */}
            <div className="bg-white rounded-lg shadow-sm p-6 w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Recommandations de sécurité
              </h3>
              <div className="space-y-3">
                {scanResult.riskLevel === 'high' && (
                  <>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="font-medium text-red-800 mb-2">Actions recommandées:</div>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Ne visitez pas cette URL</li>
                        <li>• Signalez-la à votre équipe de sécurité informatique</li>
                        <li>• Vérifiez si d'autres utilisateurs ont reçu des liens similaires</li>
                        <li>• Changez vos mots de passe si vous avez déjà visité ce site</li>
                      </ul>
                    </div>
                  </>
                )}
                
                {scanResult.riskLevel === 'medium' && (
                  <>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="font-medium text-yellow-800 mb-2">Précautions à prendre:</div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Procédez avec une extrême prudence</li>
                        <li>• Ne saisissez aucune information personnelle</li>
                        <li>• Vérifiez l'URL dans la barre d'adresse</li>
                        <li>• Contactez l'expéditeur par un autre moyen pour confirmation</li>
                      </ul>
                    </div>
                  </>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="font-medium text-blue-800 mb-2">Conseils généraux de sécurité:</div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Vérifiez toujours l'URL avant de cliquer</li>
                    <li>• Soyez méfiant des liens raccourcis</li>
                    <li>• Recherchez les fautes d'orthographe dans les domaines</li>
                    <li>• Privilégiez les sites avec HTTPS</li>
                    <li>• Utilisez un antivirus avec protection web</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historique - pleine largeur */}
        {history.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 w-full mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Historique des analyses récentes
            </h3>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.riskLevel === 'high' ? 'bg-red-500' :
                      item.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="font-mono text-sm text-gray-700 truncate max-w-md">
                      {item.url}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{item.riskScore}%</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString('fr-FR')}</span>
                    <button
                      onClick={() => setUrl(item.url)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Réanalyser"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section éducative - pleine largeur */}
        <div className="bg-white rounded-lg shadow-sm p-6 w-full mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Comment identifier des contenus suspects ?
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-red-600 mb-2">Signaux d'alarme - URLs</h4>
              <ul className="text-sm text-gray-700 space-y-1 mb-4">
                <li>• URL avec adresse IP au lieu d'un domaine</li>
                <li>• Nombreux sous-domaines suspects</li>
                <li>• Caractères étranges ou fautes d'orthographe</li>
                <li>• Protocole HTTP non sécurisé</li>
                <li>• Domaine créé récemment</li>
                <li>• Raccourcisseurs d'URL masquant la destination</li>
              </ul>
              
              <h4 className="font-medium text-red-600 mb-2">Signaux d'alarme - Fichiers</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Fichiers exécutables non attendus (.exe, .scr)</li>
                <li>• Extensions doubles (document.pdf.exe)</li>
                <li>• Fichiers provenant de sources inconnues</li>
                <li>• Taille anormale pour le type de fichier</li>
                <li>• Fichiers avec des noms générics (document.zip)</li>
                <li>• Archives avec mots de passe suspects</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-600 mb-2">Bonnes pratiques</h4>
              <ul className="text-sm text-gray-700 space-y-1 mb-4">
                <li>• Survoler les liens avant de cliquer</li>
                <li>• Vérifier le nom de domaine exact</li>
                <li>• Rechercher le certificat SSL (HTTPS)</li>
                <li>• Utiliser des outils de vérification</li>
                <li>• Contacter l'expéditeur en cas de doute</li>
                <li>• Maintenir ses logiciels à jour</li>
              </ul>
              
              <h4 className="font-medium text-green-600 mb-2">Sécurité des fichiers</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Scanner tous les fichiers reçus</li>
                <li>• Éviter d'ouvrir des fichiers inattendus</li>
                <li>• Utiliser un environnement isolé pour tester</li>
                <li>• Vérifier les signatures numériques</li>
                <li>• Faire des sauvegardes régulières</li>
                <li>• Utiliser un antivirus à jour</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default URLScanner;