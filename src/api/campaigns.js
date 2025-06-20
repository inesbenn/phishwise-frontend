// src/api/campaigns.js
import axios from 'axios';
import client from './client';

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

/**
 * Récupère la liste des cibles d'une campagne
 */
export function getTargets(id) {
  return client.get(`/campaigns/${id}/targets`).then(res => res.data);
}
/*
export function updateTarget(campaignId, targetId, data) {
  return client
    .put(`/campaigns/${campaignId}/targets/${targetId}`, data)
    .then(res => res.data);
}

/**
 * Supprime une cible d'une campagne
 *
export function deleteTarget(campaignId, targetId) {
  return client
    .delete(`/campaigns/${campaignId}/targets/${targetId}`)
    .then(res => res.data);
}*/