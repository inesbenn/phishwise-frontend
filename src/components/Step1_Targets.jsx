import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
/*import {
  getTargets,
  updateStep1,
  updateTarget,
  deleteTarget
} from '@/api/campaigns';*/


import { updateStep1 } from "../api/campaigns";
import { ArrowRight, ArrowLeft, Users, Upload, X, Edit3, Trash2, Save, User, Mail, Globe, Building, Plus, Info, CheckCircle } from 'lucide-react';

export default function Step1_Targets({ campaignId = "CAMP-2024-001", onNext = () => {}, onBack = () => {}, savedData = {} }) {
  // Reset default styles
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  const [targets, setTargets] = useState([]);
  const [editingTarget, setEditingTarget] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [showManualForm, setShowManualForm] = useState(false);

  // Charger les données sauvegardées au montage du composant
  useEffect(() => {
    if (savedData.targets && Array.isArray(savedData.targets)) {
      setTargets(savedData.targets);
    }
  }, [savedData]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addManualTarget = (targetData) => {
    if (!targetData.firstName || !targetData.lastName || !targetData.email) {
      alert('Prénom, nom et email sont obligatoires');
      return;
    }
    if (!isValidEmail(targetData.email)) {
      alert('Email invalide');
      return;
    }
    if (targets.some(t => t.email.toLowerCase() === targetData.email.toLowerCase())) {
      alert('Email déjà existant');
      return;
    }
    setTargets([...targets, { id: Date.now(), ...targetData }]);
    setShowManualForm(false);
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    setImportErrors([]);
    
    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processImportedData(results.data),
        error: (error) => setImportErrors([`Erreur CSV: ${error.message}`])
      });
    } else if (['xls', 'xlsx'].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          processImportedData(jsonData);
        } catch (error) {
          setImportErrors([`Erreur Excel: ${error.message}`]);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setImportErrors(['Format non supporté. Utilisez CSV ou Excel (.xls/.xlsx)']);
    }
    
  event.target.value = '';
  };

  const processImportedData = (data) => {
    const newTargets = [];
    const errors = [];

    data.forEach((row, index) => {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.trim().toLowerCase()
          .replace(/prénom|firstname|first_name|prenom/i, 'firstName')
          .replace(/nom|lastname|last_name/i, 'lastName')
          .replace(/email|e-mail/i, 'email')
          .replace(/poste|position|job/i, 'position')
          .replace(/pays|country/i, 'country')
          .replace(/bureau|office|ville|city/i, 'office');
        normalizedRow[normalizedKey] = row[key];
      });

      const target = {
        id: Date.now() + index,
        firstName: normalizedRow.firstName || '',
        lastName: normalizedRow.lastName || '',
        email: normalizedRow.email || '',
        position: normalizedRow.position || '',
        country: normalizedRow.country || '',
        office: normalizedRow.office || ''
      };

      if (!target.firstName || !target.lastName || !target.email) {
        errors.push(`Ligne ${index + 2}: Prénom, nom ou email manquant`);
        return;
      }
      if (!isValidEmail(target.email)) {
        errors.push(`Ligne ${index + 2}: Email invalide (${target.email})`);
        return;
      }
      if (targets.some(t => t.email.toLowerCase() === target.email.toLowerCase()) || 
          newTargets.some(t => t.email.toLowerCase() === target.email.toLowerCase())) {
        errors.push(`Ligne ${index + 2}: Email déjà existant (${target.email})`);
        return;
      }
      newTargets.push(target);
    });

    setImportErrors(errors);
    if (newTargets.length > 0) {
      setTargets([...targets, ...newTargets]);
    }
  };

  const saveEdit = (targetId, updatedData) => {
    if (!updatedData.firstName || !updatedData.lastName || !updatedData.email || !isValidEmail(updatedData.email)) return;
    setTargets(targets.map(target => target.id === targetId ? { ...target, ...updatedData } : target));
    setEditingTarget(null);
  };

  const removeTarget = (id) => setTargets(targets.filter(target => target.id !== id));

const handleNext = async () => {
  if (targets.length === 0) {
    alert('Veuillez ajouter au moins une cible avant de continuer.');
    return;
  }
  try {
    // Envoi batch au backend via ton controller updateStep1
    await updateStep1(campaignId, targets);
    // Si tout s'est bien passé, on passe à l'étape suivante
    onNext(null, { targets });
  } catch (err) {
    console.error('Erreur updateStep1:', err);
    alert("Erreur lors de la sauvegarde des cibles");
  }
};

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto"
      style={{ margin: 0, padding: 0, top: 0, left: 0 }}
    >
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
              <span className="text-lg text-gray-300">Étape 2 sur 7</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-3 rounded-full w-[28.56%] transition-all duration-500"></div>
            </div>

            <div className="grid grid-cols-7 gap-4 mt-4 text-sm text-gray-400">
              {['Paramètres', 'Cibles', 'Modèles', "Page d'atterrissage", 'SMTP', 'Formation', 'Finaliser'].map((step, i) => (
                <span
                  key={step}
                  className={`text-center font-medium ${i <= 1 ? 'text-cyan-400' : ''}`}
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
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Ajout des Cibles</h3>
                <p className="text-lg text-gray-300">
                  Importez depuis un fichier ou ajoutez des cibles manuellement
                </p>
              </div>
            </div>

            {/* Info Tip */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 mb-10">
              <div className="flex items-start space-x-4">
                <Info className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                <p className="text-cyan-300 text-base leading-relaxed">
                  <strong>Conseil :</strong> Vous pouvez importer des fichiers CSV ou Excel avec les colonnes : prénom, nom, email, poste, pays, bureau. Les champs prénom, nom et email sont obligatoires.
                </p>
              </div>
            </div>

            {/* Import Section */}
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-6">
                <label className="flex items-center justify-center space-x-4 px-8 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 text-lg font-medium">
                  <Upload className="w-6 h-6" />
                  <span>Importer Fichier</span>
                  <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFileImport} className="hidden" />
                </label>
                <button 
                  onClick={() => setShowManualForm(true)} 
                  className="flex items-center justify-center space-x-4 px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 hover:scale-105 text-lg font-medium"
                >
                  <Plus className="w-6 h-6" />
                  <span>Ajouter Manuellement</span>
                </button>
              </div>
              
              <p className="text-gray-400 text-base text-center">Formats supportés: CSV, XLS, XLSX - Colonnes: prénom, nom, email, poste, pays, bureau</p>

              {importErrors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                  <h5 className="text-red-400 font-semibold mb-4 text-lg flex items-center space-x-3">
                    <span className="text-xl">⚠️</span>
                    <span>Erreurs d'import:</span>
                  </h5>
                  <ul className="text-red-300 text-base space-y-2">
                    {importErrors.map((error, index) => <li key={index}>• {error}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Manual Form */}
            {showManualForm && (
              <div className="mt-10 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-8">
                <h4 className="text-2xl font-bold text-white mb-8 flex items-center space-x-4">
                  <Plus className="w-7 h-7 text-green-400" />
                  <span>Ajouter une Cible</span>
                </h4>
                <ManualTargetForm onAdd={addManualTarget} onCancel={() => setShowManualForm(false)} />
              </div>
            )}

            {/* Targets List */}
            {targets.length > 0 ? (
              <div className="mt-10 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-8">
                <h4 className="text-2xl font-bold text-white mb-8 flex items-center space-x-4">
                  <Users className="w-7 h-7 text-cyan-400" />
                  <span>Cibles ({targets.length})</span>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </h4>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {targets.map((target) => (
                    <div key={target.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                      {editingTarget === target.id ? (
                        <EditForm target={target} onSave={saveEdit} onCancel={() => setEditingTarget(null)} />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="grid grid-cols-6 gap-4 flex-1 text-base">
                            <div>
                              <span className="text-gray-400 text-sm block mb-1">Prénom</span>
                              <span className="text-white font-medium">{target.firstName}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm block mb-1">Nom</span>
                              <span className="text-white font-medium">{target.lastName}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm block mb-1">Email</span>
                              <span className="text-white">{target.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm block mb-1">Poste</span>
                              <span className="text-white">{target.position || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm block mb-1">Pays</span>
                              <span className="text-white">{target.country || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm block mb-1">Bureau</span>
                              <span className="text-white">{target.office || '-'}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-6">
                            <button 
                              onClick={() => setEditingTarget(target.id)} 
                              className="p-3 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => removeTarget(target.id)} 
                              className="p-3 hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-10 bg-white/5 rounded-xl border border-white/10 p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h4 className="text-white font-semibold mb-3 text-xl">Aucune cible ajoutée</h4>
                <p className="text-gray-300 text-lg">Importez un fichier ou ajoutez des cibles manuellement pour commencer.</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-16 pt-10 border-t border-white/10">
              <button
                onClick={onBack}
                className="flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 text-base font-medium hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>

              <button
                onClick={handleNext}
                disabled={targets.length === 0}
                className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 text-base font-medium"
              >
                <span>Suivant</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManualTargetForm({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', position: '', country: '', office: ''
  });

  const handleSubmit = () => {
    onAdd(formData);
    setFormData({ firstName: '', lastName: '', email: '', position: '', country: '', office: '' });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-white text-lg font-medium mb-3">Prénom *</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              value={formData.firstName} 
              onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
              className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all duration-200" 
              placeholder="Prénom" 
            />
          </div>
        </div>
        <div>
          <label className="block text-white text-lg font-medium mb-3">Nom *</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              value={formData.lastName} 
              onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
              className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all duration-200" 
              placeholder="Nom" 
            />
          </div>
        </div>
        <div>
          <label className="block text-white text-lg font-medium mb-3">Email *</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all duration-200" 
              placeholder="email@exemple.com" 
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-white text-lg font-medium mb-3">Poste</label>
          <input 
            type="text" 
            value={formData.position} 
            onChange={(e) => setFormData({...formData, position: e.target.value})} 
            className="w-full px-4 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all duration-200" 
            placeholder="Poste" 
          />
        </div>
        <div>
          <label className="block text-white text-lg font-medium mb-3">Pays</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              value={formData.country} 
              onChange={(e) => setFormData({...formData, country: e.target.value})} 
              className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all duration-200" 
              placeholder="Pays" 
            />
          </div>
        </div>
        <div>
          <label className="block text-white text-lg font-medium mb-3">Bureau</label>
          <div className="relative">
            <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              value={formData.office} 
              onChange={(e) => setFormData({...formData, office: e.target.value})} 
              className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all duration-200" 
              placeholder="Bureau" 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button 
          onClick={onCancel} 
          className="flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all duration-300 hover:scale-105 text-base font-medium"
        >
          <X className="w-5 h-5" />
          <span>Annuler</span>
        </button>
        <button 
          onClick={handleSubmit} 
          className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 hover:scale-105 text-base font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter</span>
        </button>
      </div>
    </div>
  );
}

function EditForm({ target, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: target.firstName, lastName: target.lastName, email: target.email,
    position: target.position, country: target.country, office: target.office
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-white text-base font-medium mb-2">Prénom</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              value={formData.firstName} 
              onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
              className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none" 
            />
          </div>
        </div>
        <div>
          <label className="block text-white text-base font-medium mb-2">Nom</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              value={formData.lastName} 
              onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
              className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none" 
            />
          </div>
        </div>
        <div>
          <label className="block text-white text-base font-medium mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none" 
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <input 
          type="text" 
          value={formData.position} 
          onChange={(e) => setFormData({...formData, position: e.target.value})} 
          className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none" 
          placeholder="Poste" 
        />
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            value={formData.country} 
            onChange={(e) => setFormData({...formData, country: e.target.value})} 
            className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none" 
            placeholder="Pays" 
          />
        </div>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            value={formData.office} 
            onChange={(e) => setFormData({...formData, office: e.target.value})} 
            className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none" 
            placeholder="Bureau" 
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button 
          onClick={onCancel} 
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all duration-200"
        >
          <X className="w-4 h-4" />
          <span>Annuler</span>
        </button>
        <button 
          onClick={() => onSave(target.id, formData)} 
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
        >
          <Save className="w-4 h-4" />
          <span>Sauvegarder</span>
        </button>
      </div>
    </div>
  );
}