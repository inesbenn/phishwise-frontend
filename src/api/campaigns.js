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

export function getNewsThemes() {
  return client.get('/news/themes').then(res => res.data);
}

export function getNewsCountries() {
  return client.get('/news/countries').then(res => res.data);
}

export function fetchCampaignNews(campaignId, filters) {
  // Les filtres sont envoyés en tant que query parameters
  return client.get(`/campaigns/${campaignId}/news`, { params: filters }).then(res => res.data);
}

export function saveSelectedNews(campaignId, selectedNews) {
  return client.post(`/campaigns/${campaignId}/news/select`, { selectedNews }).then(res => res.data);
}

export function generateAISuggestions(campaignId, newsForSuggestions) {
  return client.post(`/campaigns/${campaignId}/suggestions/generate`, { selectedNews: newsForSuggestions }).then(res => res.data);
}
/**
 * Récupère toutes les données sauvegardées pour l'étape 2 d'une campagne.
 * @param {string} campaignId - L'ID de la campagne.
 * @returns {Promise<object>} - Les données de l'étape 2.
 */
export function getCampaignStep2Data(campaignId) {
  return client.get(`/campaigns/${campaignId}/step2`).then(res => res.data);
}


/**
 * Met à jour les données de l'étape 2 d'une campagne.
 * @param {string} campaignId - L'ID de la campagne.
 * @param {object} data - Les données à mettre à jour (filters, news, suggestions).
 * @returns {Promise<object>} - Les données de l'étape 2 mises à jour.
 */
export function updateCampaignStep2Data(campaignId, data) {
  return client.put(`/campaigns/${campaignId}/step2`, data).then(res => res.data);
}