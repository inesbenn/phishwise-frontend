// src/api/campaigns.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const createCampaign = payload =>
  API.post('/campaigns', payload).then(res => res.data);

export const updateStep0 = (id, payload) =>
  API.put(`/campaigns/${id}/step/0`, payload).then(res => res.data);

// ← Nouvelle fonction pour Step 1
export const updateStep1 = (id, targets) =>
  API.put(`/campaigns/${id}/step/1`, { targets }).then(res => res.data);
