// src/components/Step1_Targets.jsx
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import {
  getTargets,
  updateStep1,
  updateTarget
  // deleteTarget <- REMOVED - plus besoin !
} from '../api/campaigns';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Step1_Targets({ campaignId, onNext, onBack }) {
  const [targets, setTargets] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', position: '', country: '', office: ''
  });
  const [error, setError] = useState('');

  // 1) Chargement initial des cibles
  useEffect(() => {
    if (!campaignId) return;
    getTargets(campaignId)
      .then(data => setTargets(data))
      .catch(() => toast.error('Impossible de charger les cibles'));
  }, [campaignId]);

  // 1. Gestion de l'ajout manuel
  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddManual = e => {
    e.preventDefault();
    const { firstName, lastName, email, position, country, office } = formData;
    if (!firstName || !lastName || !email) {
      setError('Prénom, Nom et Email sont obligatoires.');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Email invalide.');
      return;
    }
    // Génère un ID temporaire pour les cibles ajoutées manuellement
    const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setTargets(t => [...t, { _id: tempId, firstName, lastName, email, position, country, office, isManual: true }]);
    setFormData({ firstName: '', lastName: '', email: '', position: '', country: '', office: '' });
    setError('');
  };

  // 2) Sélection/désélection
  const toggleSelect = id => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };

  // 3) Import CSV
  const handleCSVImport = e => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const parsed = results.data.map(row => ({
          firstName: row.firstName?.trim() || '',
          lastName:  row.lastName?.trim()  || '',
          email:     row.email?.trim()     || '',
          position:  row.position?.trim()  || '',
          country:   row.country?.trim()   || '',
          office:    row.office?.trim()    || ''
        }));
        updateStep1(campaignId, parsed)
          .then(updatedCamp => {
            toast.success('Cibles importées !');
            setTargets(updatedCamp.targets);
            setSelectedIds(new Set());
          })
          .catch(() => toast.error('Erreur mise à jour'));
      }
    });
  };

  // 4) Supprimer une cible (UNIQUEMENT côté front - AUCUN APPEL API)
  const handleDelete = (id) => {
    console.log('🗑️ Suppression front-end pour ID:', id);
    
    // Suppression directe du state local
    setTargets(currentTargets => currentTargets.filter(t => t._id !== id));
    
    // Suppression de la sélection
    setSelectedIds(currentSelected => {
      const newSet = new Set(currentSelected);
      newSet.delete(id);
      return newSet;
    });
    
    toast.success('Cible supprimée !');
  };

  // 5) Démarrer l'édition inline
  const startEdit = t => {
    setEditing(t);
    setFormData({ ...t });
  };

  // 6) Enregistrer l'édition
  const saveEdit = () => {
    if (!EMAIL_REGEX.test(formData.email)) {
      toast.error('Email invalide');
      return;
    }
    
    // Si c'est une cible manuelle, met à jour seulement le state
    if (editing.isManual) {
      setTargets(ts => ts.map(t => t._id === editing._id ? { ...t, ...formData } : t));
      setEditing(null);
      toast.success('Cible modifiée');
      return;
    }
    
    // Sinon appel API pour les cibles du serveur
    updateTarget(campaignId, editing._id, formData)
      .then(updated => {
        setTargets(ts => ts.map(t => t._id === updated._id ? updated : t));
        setEditing(null);
        toast.success('Cible modifiée');
      })
      .catch(() => toast.error('Erreur modification'));
  };

  // 7) Envoyer les cibles sélectionnées pour l'étape suivante
  const handleSubmit = () => {
    if (selectedIds.size === 0) {
      toast.error('Sélectionne au moins une cible');
      return;
    }
    const chosen = targets.filter(t => selectedIds.has(t._id));
    updateStep1(campaignId, chosen)
      .then(onNext)
      .catch(() => toast.error('Erreur envoi'));
  };

  return (
    <div className="p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl">Étape 1 – Gestion des cibles</h2>

      {/* Formulaire d'ajout manuel */}
      <div className="p-4 bg-blue-50 border rounded">
        <h3 className="font-medium mb-3">Ajouter une cible manuellement</h3>
        <form onSubmit={handleAddManual} className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Prénom *"
              className="border p-2 rounded"
              required
            />
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Nom *"
              className="border p-2 rounded"
              required
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email *"
              className="border p-2 rounded"
              required
            />
            <input
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Poste"
              className="border p-2 rounded"
            />
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Pays"
              className="border p-2 rounded"
            />
            <input
              name="office"
              value={formData.office}
              onChange={handleChange}
              placeholder="Bureau"
              className="border p-2 rounded"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ajouter la cible
          </button>
        </form>
      </div>

      <div>
        <label className="block font-medium mb-1">Importer un CSV :</label>
        <input type="file" accept=".csv" onChange={handleCSVImport} />
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th></th>
            {['Prénom','Nom','Email','Poste','Pays','Bureau','Actions'].map(h => (
              <th key={h} className="border p-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {targets.map(t => {
            const invalid = !EMAIL_REGEX.test(t.email);
            return (
              <tr key={t._id}>
                <td className="border p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(t._id)}
                    onChange={() => toggleSelect(t._id)}
                  />
                </td>
                <td className="border p-2">{t.firstName}</td>
                <td className="border p-2">{t.lastName}</td>
                <td className={`border p-2 ${invalid ? 'text-red-500' : ''}`}>
                  {t.email}
                </td>
                <td className="border p-2">{t.position}</td>
                <td className="border p-2">{t.country}</td>
                <td className="border p-2">{t.office}</td>
                <td className="border p-2 space-x-2">
                  <button onClick={() => startEdit(t)}>✏️</button>
                  <button onClick={() => handleDelete(t._id)}>❌</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {editing && (
        <div className="p-4 bg-gray-50 border rounded">
          <h3>Modifier {editing.firstName} {editing.lastName}</h3>
          <div className="flex flex-wrap">
            {['firstName','lastName','email','position','country','office'].map(f => (
              <input
                key={f}
                name={f}
                value={formData[f] || ''}
                onChange={e => setFormData({ ...formData, [f]: e.target.value })}
                placeholder={f}
                className="border p-2 m-1 rounded"
              />
            ))}
          </div>
          <div className="mt-2 space-x-2">
            <button onClick={saveEdit} className="bg-green-500 text-white px-3 py-1 rounded">
              Enregistrer
            </button>
            <button onClick={() => setEditing(null)} className="px-3 py-1 rounded">
              Annuler
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between">
        <button onClick={onBack} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
          Précédent
        </button>
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Suivant
        </button>
      </div>
    </div>
  );}