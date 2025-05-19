// src/components/Step0_General.jsx
import { useState } from 'react';
import { createCampaign, updateStep0 } from '../api/campaigns';
import { toast } from 'react-toastify';

export default function Step0_General({ campaignId, onNext }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('')

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      let camp;
      if (!campaignId) {
        camp = await createCampaign({ name, startDate });
        toast.success('Campagne créée avec succès 🎉');
        onNext(camp._id);
      } else {
        await updateStep0(campaignId, { name, startDate });
        toast.info('Paramètres mis à jour.');
        onNext(campaignId);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur serveur';
      toast.error(`Échec : ${msg}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block font-medium">Nom de la campagne</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="mt-1 w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block font-medium">Date & heure de lancement</label>
        <input
          type="datetime-local"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          required
          className="mt-1 w-full border rounded p-2"
        />
      </div>
      
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Suivant
      </button>
    </form>
  );
}
