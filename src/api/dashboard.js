// src/api/dashboard.js
import axios from 'axios';

// Configuration de l'API (réutilise la config existante)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Dashboard API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout: La requête a pris trop de temps. Veuillez réessayer.');
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_RESET') {
      throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est en cours d\'exécution.');
    } else if (error.response?.status === 404) {
      throw new Error('Endpoint non trouvé. Vérifiez l\'URL de l\'API.');
    } else if (error.response?.status >= 500) {
      throw new Error('Erreur serveur. Vérifiez les logs du backend.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Requête invalide.');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Récupère les statistiques générales du dashboard
 * @returns {Promise} Statistiques du dashboard
 */
export function getDashboardStats() {
  return API.get('/dashboard/stats').then(res => res.data);
}

/**
 * Récupère les campagnes actives
 * @returns {Promise} Liste des campagnes actives
 */
export function getActiveCampaigns() {
  return API.get('/dashboard/campaigns').then(res => res.data);
}

/**
 * Récupère l'activité récente
 * @returns {Promise} Liste des activités récentes
 */
export function getRecentActivity() {
  return API.get('/dashboard/recent-activity').then(res => res.data);
}

/**
 * Récupère les recommandations IA
 * @returns {Promise} Liste des recommandations
 */
export function getRecommendations() {
  return API.get('/dashboard/recommendations').then(res => res.data);
}

/**
 * Test de connexion pour le dashboard
 * @returns {Promise} Statut de la connexion
 */
export function testDashboardConnection() {
  return API.get('/dashboard/stats').then(res => ({ success: true, data: res.data }));
}