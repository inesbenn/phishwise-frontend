// src/api/campaigns.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const createCampaign = payload =>
  API.post('/campaigns', payload).then(res => res.data);

export const updateStep0 = (id, payload) =>
  API.put(`/campaigns/${id}/step/0`, payload).then(res => res.data);
