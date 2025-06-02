import { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ArrowRight, ArrowLeft, Users, Upload, X, Edit3, Trash2, Save, User, Mail, Globe, Building, Plus } from 'lucide-react';

export default function Step1_Targets({ campaignId = "CAMP-2024-001", onNext = () => {}, onBack = () => {} }) {
  const [targets, setTargets] = useState([]);
  const [editingTarget, setEditingTarget] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [showManualForm, setShowManualForm] = useState(false);

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
    
    // Reset input pour permettre re-importation
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

  const handleNext = () => {
    if (targets.length === 0) {
      alert('Veuillez ajouter au moins une cible avant de continuer.');
      return;
    }
    // Appeler la fonction onNext passée par le wizard pour passer à l'étape suivante
    onNext();
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 flex-shrink-0">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">PhishWise</h1>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">Nouvelle Campagne</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4 space-y-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-white">Création de Campagne</h2>
              <span className="text-sm text-gray-300">Étape 2 sur 7</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full w-[28.56%]"></div>
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2 text-xs text-gray-400">
              <span className="text-cyan-400 font-medium text-center">Paramètres</span>
              <span className="text-cyan-400 font-medium text-center">Cibles</span>
              <span className="text-center">Actualités</span>
              <span className="text-center">Modèles</span>
              <span className="text-center">Landing</span>
              <span className="text-center">SMTP</span>
              <span className="text-center">Formation</span>
            </div>
          </div>

          {/* Section Import */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Ajout des Cibles</h3>
                <p className="text-gray-300 text-sm">Importer depuis un fichier ou ajouter manuellement</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg cursor-pointer">
                <Upload className="w-5 h-5" />
                <span>Importer Fichier</span>
                <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFileImport} className="hidden" />
              </label>
              <button onClick={() => setShowManualForm(true)} className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg">
                <Plus className="w-5 h-5" />
                <span>Ajouter Manuellement</span>
              </button>
            </div>
            
            <p className="text-gray-400 text-xs text-center">Formats: CSV, XLS, XLSX - Colonnes: prénom, nom, email, poste, pays, bureau</p>

            {importErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <h5 className="text-red-400 font-medium mb-1 text-sm">Erreurs d'import:</h5>
                <ul className="text-red-300 text-xs space-y-1">
                  {importErrors.map((error, index) => <li key={index}>• {error}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Formulaire d'ajout manuel */}
          {showManualForm && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Plus className="w-6 h-6 text-green-400" />
                <span>Ajouter une Cible</span>
              </h3>
              <ManualTargetForm onAdd={addManualTarget} onCancel={() => setShowManualForm(false)} />
            </div>
          )}

          {/* Liste des cibles */}
          {targets.length > 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Users className="w-6 h-6 text-cyan-400" />
                <span>Cibles ({targets.length})</span>
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {targets.map((target) => (
                  <div key={target.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    {editingTarget === target.id ? (
                      <EditForm target={target} onSave={saveEdit} onCancel={() => setEditingTarget(null)} />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="grid grid-cols-6 gap-3 flex-1 text-sm">
                          <div><span className="text-gray-400 text-xs block">Prénom</span><span className="text-white font-medium">{target.firstName}</span></div>
                          <div><span className="text-gray-400 text-xs block">Nom</span><span className="text-white font-medium">{target.lastName}</span></div>
                          <div><span className="text-gray-400 text-xs block">Email</span><span className="text-white">{target.email}</span></div>
                          <div><span className="text-gray-400 text-xs block">Poste</span><span className="text-white">{target.position || '-'}</span></div>
                          <div><span className="text-gray-400 text-xs block">Pays</span><span className="text-white">{target.country || '-'}</span></div>
                          <div><span className="text-gray-400 text-xs block">Bureau</span><span className="text-white">{target.office || '-'}</span></div>
                        </div>
                        <div className="flex space-x-1 ml-3">
                          <button onClick={() => setEditingTarget(target.id)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => removeTarget(target.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-white font-medium mb-1">Aucune cible ajoutée</h4>
              <p className="text-gray-300 text-sm">Importez un fichier ou ajoutez des cibles manuellement.</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Fixed at bottom */}
      <div className="flex-shrink-0 bg-black/10 backdrop-blur-lg border-t border-white/10 px-6 py-4">
        <div className="flex justify-between">
          <button onClick={onBack} className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          <button onClick={handleNext} disabled={targets.length === 0} className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg disabled:opacity-50">
            <span>Suivant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-white text-sm mb-1">Prénom *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400" placeholder="Prénom" />
          </div>
        </div>
        <div>
          <label className="block text-white text-sm mb-1">Nom *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400" placeholder="Nom" />
          </div>
        </div>
        <div>
          <label className="block text-white text-sm mb-1">Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400" placeholder="email@exemple.com" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-white text-sm mb-1">Poste</label>
          <input type="text" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400" placeholder="Poste" />
        </div>
        <div>
          <label className="block text-white text-sm mb-1">Pays</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400" placeholder="Pays" />
          </div>
        </div>
        <div>
          <label className="block text-white text-sm mb-1">Bureau</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" value={formData.office} onChange={(e) => setFormData({...formData, office: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400" placeholder="Bureau" />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button onClick={onCancel} className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded border border-white/20">
          <X className="w-4 h-4" />
          <span>Annuler</span>
        </button>
        <button onClick={handleSubmit} className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded">
          <Plus className="w-4 h-4" />
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
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-white text-sm mb-1">Prénom</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-cyan-400" />
          </div>
        </div>
        <div>
          <label className="block text-white text-sm mb-1">Nom</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-cyan-400" />
          </div>
        </div>
        <div>
          <label className="block text-white text-sm mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-cyan-400" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <input type="text" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-cyan-400" placeholder="Poste" />
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-cyan-400" placeholder="Pays" />
        </div>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" value={formData.office} onChange={(e) => setFormData({...formData, office: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-cyan-400" placeholder="Bureau" />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button onClick={onCancel} className="flex items-center space-x-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded border border-white/20">
          <X className="w-4 h-4" />
          <span>Annuler</span>
        </button>
        <button onClick={() => onSave(target.id, formData)} className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded">
          <Save className="w-4 h-4" />
          <span>Sauvegarder</span>
        </button>
      </div>
    </div>
  );
}