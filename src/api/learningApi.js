// src/api/learningApi.js
import axios from 'axios';

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const learningAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
learningAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
learningAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Learning API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ==================== FORMATIONS =====================

/**
 * Récupère toutes les formations
 */
export const getAllFormations = async () => {
  try {
    const response = await learningAPI.get('/learning/formations');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des formations');
  }
};

/**
 * Crée une nouvelle formation
 * @param {Object} formationData - Données de la formation
 */
export const createFormation = async (formationData) => {
  try {
    const response = await learningAPI.post('/learning/formations', formationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la formation:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de la formation');
  }
};

/**
 * Met à jour une formation
 * @param {string} formationId - ID de la formation
 * @param {Object} updates - Données à mettre à jour
 */
export const updateFormation = async (formationId, updates) => {
  try {
    const response = await learningAPI.put(`/learning/formations/${formationId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la formation:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la formation');
  }
};

/**
 * Supprime une formation
 * @param {string} formationId - ID de la formation
 */
export const deleteFormation = async (formationId) => {
  try {
    const response = await learningAPI.delete(`/learning/formations/${formationId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la formation:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la formation');
  }
};

/**
 * Récupère une formation spécifique
 * @param {string} formationId - ID de la formation
 */
export const getFormation = async (formationId) => {
  try {
    const response = await learningAPI.get(`/learning/formations/${formationId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la formation');
  }
};

// ==================== CAMPAGNES ET ASSIGNATIONS =====================

/**
 * Assigne des formations à une campagne
 * @param {string} campaignId - ID de la campagne
 * @param {Object} assignmentData - Données d'assignation
 */
export const assignFormationsToCampaign = async (campaignId, assignmentData) => {
  try {
    const response = await learningAPI.post(`/learning/campaigns/${campaignId}/assign-formations`, assignmentData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'assignation des formations:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'assignation des formations');
  }
};

/**
 * Récupère les statistiques d'une campagne
 * @param {string} campaignId - ID de la campagne
 */
export const getCampaignStats = async (campaignId) => {
  try {
    const response = await learningAPI.get(`/learning/campaigns/${campaignId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
  }
};

// ==================== PROGRESSION UTILISATEUR =====================

/**
 * Récupère les formations d'une campagne pour un utilisateur
 * @param {string} campaignId - ID de la campagne
 * @param {string} targetEmail - Email de l'utilisateur cible
 */
export const getCampaignFormations = async (campaignId, targetEmail) => {
  try {
    const response = await learningAPI.get(`/learning/campaigns/${campaignId}/users/${targetEmail}/formations`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des formations de la campagne:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des formations');
  }
};

/**
 * Démarre une formation pour un utilisateur
 * @param {Object} startData - Données pour démarrer la formation
 */
export const startFormation = async (startData) => {
  try {
    const response = await learningAPI.post('/learning/progress/start-formation', startData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du démarrage de la formation:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors du démarrage de la formation');
  }
};

/**
 * Soumet le progrès d'un module
 * @param {Object} progressData - Données de progression du module
 */
export const submitModuleProgress = async (progressData) => {
  try {
    const response = await learningAPI.post('/learning/progress/submit-module', progressData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la soumission du progrès:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la soumission du progrès');
  }
};

// ==================== FONCTIONS UTILITAIRES =====================

/**
 * Test de connexion à l'API
 */
export const testLearningConnection = async () => {
  try {
    const response = await learningAPI.get('/learning/formations');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Test de connexion échoué:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fonction helper pour créer une formation de test (développement uniquement)
 */
export const createTestFormation = async (formationData) => {
  try {
    // Utilise la route temporaire sans authentification
    const response = await learningAPI.post('/learning/formations/no-auth', formationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la formation test:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de la formation test');
  }
};

export default learningAPI;