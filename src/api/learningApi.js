// src/api/learningApi.js
import axios from 'axios';

// Configuration de base pour l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// =========================================================================================
// Client API pour les requêtes NÉCESSITANT une authentification (avec token)
// =========================================================================================
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

// Intercepteur pour gérer les erreurs d'authentification (401)
learningAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Learning API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Vérification de l'environnement pour éviter les erreurs côté serveur
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// =========================================================================================
// Client API pour les requêtes qui NE NÉCESSITENT PAS de token d'authentification
// =========================================================================================
const publicLearningAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur d'erreur pour l'API publique
publicLearningAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Public Learning API Error:', error);
    return Promise.reject(error);
  }
);

// ==================== FORMATIONS =====================

/**
 * Récupère toutes les formations
 * Utilise le client PUBLIC qui ne nécessite pas de token.
 */
export const getAllFormations = async () => {
  try {
    const response = await publicLearningAPI.get('/learning/formations');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des formations');
  }
};

/**
 * Crée une nouvelle formation
 * Utilise le client SÉCURISÉ qui nécessite un token.
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
 * Utilise le client SÉCURISÉ qui nécessite un token.
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
 * Utilise le client SÉCURISÉ qui nécessite un token.
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
 * Utilise le client SÉCURISÉ qui nécessite un token.
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
 * Utilise le client SÉCURISÉ qui nécessite un token.
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
 * Utilise le client SÉCURISÉ qui nécessite un token.
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
 * Utilise le client SÉCURISÉ qui nécessite un token.
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
 * Utilise le client SÉCURISÉ qui nécessite un token.
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
 * Utilise le client SÉCURISÉ qui nécessite un token.
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
 * Utilise le client PUBLIC qui ne nécessite pas de token.
 */
export const testLearningConnection = async () => {
  try {
    const response = await publicLearningAPI.get('/learning/formations');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Test de connexion échoué:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fonction helper pour créer une formation de test (développement uniquement)
 * Utilise le client SÉCURISÉ qui nécessite un token.
 * @param {Object} formationData - Données de la formation de test
 */
export const createTestFormation = async (formationData) => {
  try {
    // Utilise la route temporaire sans authentification
    const response = await publicLearningAPI.post('/learning/formations/no-auth', formationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la formation test:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de la formation test');
  }
};

export default learningAPI;