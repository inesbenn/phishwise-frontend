// src/components/Step0_General.jsx
import { useState } from 'react';
import { createCampaign, updateStep0 } from '../api/campaigns';

export default function Step0_General({ campaignId, onNext }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (!campaignId) {
        // création
        const camp = await createCampaign({ name, startDate });
        onNext(camp._id);
      } else {
        // mise à jour
        await updateStep0(campaignId, { name, startDate });
        onNext(campaignId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur serveur');
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

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Suivant
      </button>
    </form>
  );
}
