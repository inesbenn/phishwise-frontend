import { useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import { updateStep1 } from '../api/campaigns';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Step1_Targets({ campaignId, onNext, onBack }) {
  const [targets, setTargets] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', position: '', country: '', office: ''
  });
  const [error, setError] = useState('');

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
    setTargets(t => [...t, { firstName, lastName, email, position, country, office }]);
    setFormData({ firstName: '', lastName: '', email: '', position: '', country: '', office: '' });
    setError('');
  };

  // 2. Gestion de l'import CSV
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
        // validation
        const invalid = parsed.filter(t => !EMAIL_REGEX.test(t.email));
        if (invalid.length) {
          toast.error(`Emails invalides : ${invalid.map(t => t.email).join(', ')}`);
          return;
        }
        setTargets(parsed);
        toast.success('CSV importé avec succès !');
      },
      error: () => toast.error('Erreur de lecture du CSV')
    });
  };

  // 3. Envoi au backend
  const handleSubmit = async () => {
    if (targets.length === 0) {
      setError('Ajoute au moins une cible.');
      return;
    }
    try {
      await updateStep1(campaignId, targets);
      toast.success('Cibles enregistrées !');
      onNext();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur serveur');
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold">Étape 1 – Gestion des cibles</h2>

      {/* Ajout manuel */}
      <form onSubmit={handleAddManual} className="grid grid-cols-2 gap-4">
        {['firstName','lastName','email','position','country','office'].map(name => (
          <input
            key={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
            className="border p-2 rounded"
            required={['firstName','lastName','email'].includes(name)}
          />
        ))}
        <button
          type="submit"
          className="col-span-2 bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          Ajouter cible
        </button>
      </form>

      {/* Import CSV */}
      <div>
        <label className="block font-medium mb-1">Importer un CSV :</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVImport}
          className="border p-2 rounded"
        />
      </div>

      {/* Aperçu */}
      {targets.length > 0 && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {['Prénom','Nom','Email','Poste','Pays','Bureau'].map(h => (
                <th key={h} className="border p-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {targets.map((t, i) => (
              <tr key={i}>
                <td className="border p-2">{t.firstName}</td>
                <td className="border p-2">{t.lastName}</td>
                <td className="border p-2">{t.email}</td>
                <td className="border p-2">{t.position}</td>
                <td className="border p-2">{t.country}</td>
                <td className="border p-2">{t.office}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Précédent
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
