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
// === NOUVELLES FONCTIONS POUR L'ÉTAPE 3 (MODÈLES D'EMAILS) ===

/**
 * Génère des templates d'emails via l'IA pour une campagne.
 * @param {string} campaignId - L'ID de la campagne.
 * @param {boolean} useSelectedNews - Indique si les templates doivent être basés sur les actualités sélectionnées.
 * @param {object} customParams - Paramètres additionnels pour la génération.
 * @returns {Promise<object>} - Les templates générés.
 */
export function generateEmailTemplates(campaignId, useSelectedNews = true, customParams = {}) {
  return client.post(`/campaigns/${campaignId}/templates/generate`, { useSelectedNews, customParams }).then(res => res.data);
}

/**
 * Récupère tous les templates d'emails existants pour une campagne.
 * @param {string} campaignId - L'ID de la campagne.
 * @returns {Promise<object>} - Les templates de la campagne.
 */
export function getEmailTemplates(campaignId) {
  return client.get(`/campaigns/${campaignId}/templates`).then(res => res.data);
}

/**
 * Sélectionne un template d'email spécifique pour une campagne.
 * @param {string} campaignId - L'ID de la campagne.
 * @param {string} templateId - L'ID du template à sélectionner.
 * @returns {Promise<object>} - La confirmation de sélection.
 */
export function selectEmailTemplate(campaignId, templateId) {
  return client.put(`/campaigns/${campaignId}/templates/${templateId}/select`).then(res => res.data);
}

/**
 * Génère un template d'email personnalisé via l'IA.
 * @param {string} campaignId - L'ID de la campagne.
 * @param {object} params - Paramètres de génération (type, sophistication, newsId, customInstructions).
 * @returns {Promise<object>} - Le template personnalisé généré.
 */
export function generateCustomTemplate(campaignId, params) {
  return client.post(`/campaigns/${campaignId}/templates/custom`, params).then(res => res.data);
}

/**
 * Supprime un template d'email d'une campagne.
 * @param {string} campaignId - L'ID de la campagne.
 * @param {string} templateId - L'ID du template à supprimer.
 * @returns {Promise<object>} - La confirmation de suppression.
 */
export function deleteEmailTemplate(campaignId, templateId) {
  return client.delete(`/campaigns/${campaignId}/templates/${templateId}`).then(res => res.data);
}

/**
 * Prévisualise un template d'email avec des données de test.
 * @param {string} campaignId - L'ID de la campagne.
 * @param {string} templateId - L'ID du template à prévisualiser.
 * @param {object} sampleData - Données de test pour la personnalisation.
 * @returns {Promise<object>} - Le template avec le contenu prévisualisé.
 */
export function previewEmailTemplate(campaignId, templateId, sampleData = {}) {
  return client.post(`/campaigns/${campaignId}/templates/${templateId}/preview`, { sampleData }).then(res => res.data);
}
// === NOUVELLES FONCTIONS POUR L'ÉTAPE 4 (LANDING PAGE) ===

/**
 * Récupère les données de la landing page pour une campagne spécifique.
 * @param {string} campaignId - L'ID de la campagne.
 * @returns {Promise<object>} - Les données de l'étape 4.
 */
export function getLandingPageData(campaignId) {
  return client.get(`/landingpage/${campaignId}`).then(res => res.data);
}

/**
 * Clone une URL pour une campagne.
 * @param {string} campaignId - L'ID de la campagne.
 * @param {string} url - L'URL à cloner.
 * @returns {Promise<object>} - Le résultat du clonage.
 */
export function cloneUrl(campaignId, url) {
  return client.post(`/landingpage/${campaignId}/clone`, { url }).then(res => res.data);
}

/**
 * Sélectionne un template prédéfini pour une campagne.
 * @param {string} campaignId - L'ID de la campagne.
 * @param {object} template - L'objet template sélectionné.
 * @returns {Promise<object>} - Le résultat de la sélection.
 */
export function selectLandingPageTemplate(campaignId, template) {
  return client.post(`/landingpage/${campaignId}/template`, { template }).then(res => res.data);
}

/**
 * Récupère la liste de tous les templates de landing page disponibles.
 * @returns {Promise<object>} - La liste des templates.
 */
export function getLandingPageTemplates() {
  return client.get(`/landingpage/templates`).then(res => res.data);
}

/**
 * Met à jour les actions post-soumission pour une landing page.
 * @param {string} campaignId - L'ID de la campagne.
 * @param {object} actions - Les actions à mettre à jour.
 * @returns {Promise<object>} - La confirmation de la mise à jour.
 */
export function updatePostSubmissionActions(campaignId, actions) {
  return client.put(`/landingpage/${campaignId}/post-submission`, { postSubmissionActions: actions }).then(res => res.data);
}

/**
 * Valide l'étape de la landing page.
 * @param {string} campaignId - L'ID de la campagne.
 * @returns {Promise<object>} - La confirmation de la validation.
 */
export function validateLandingPageStep(campaignId) {
  return client.post(`/landingpage/${campaignId}/validate`).then(res => res.data);
}
