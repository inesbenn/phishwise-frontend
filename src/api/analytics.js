// src/api/analytics.js
import axios from 'axios';

// Configuration API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const analyticsAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
analyticsAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Analytics API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout: La requête a pris trop de temps. Veuillez réessayer.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Impossible de se connecter au serveur analytics.');
    } else if (error.response?.status >= 500) {
      throw new Error('Erreur serveur analytics. Vérifiez les logs du backend.');
    } else if (error.response?.status === 404) {
      throw new Error('Endpoint analytics non trouvé.');
    }
    
    return Promise.reject(error);
  }
);

// =========================================================================================
// FONCTIONS POUR LES ANALYTICS
// =========================================================================================

/**
 * Récupère les statistiques globales des analytics
 */
export const getAnalyticsOverview = async () => {
  try {
    const response = await analyticsAPI.get('/analytics/overview');
    return response.data;
  } catch (error) {
    console.error('Erreur récupération overview analytics:', error);
    throw error;
  }
};

/**
 * Récupère toutes les campagnes avec leurs statistiques de formation
 */
export const getAnalyticsCampaigns = async () => {
  try {
    const response = await analyticsAPI.get('/analytics/campaigns');
    return response.data;
  } catch (error) {
    console.error('Erreur récupération campagnes analytics:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques détaillées d'une campagne spécifique
 * @param {string} campaignId - ID de la campagne
 */
export const getCampaignAnalytics = async (campaignId) => {
  try {
    const response = await analyticsAPI.get(`/analytics/campaigns/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur récupération analytics campagne ${campaignId}:`, error);
    throw error;
  }
};

/**
 * Récupère tous les progrès utilisateurs avec filtres
 * @param {Object} filters - Filtres à appliquer
 * @param {string} filters.campaignId - ID de campagne (optionnel)
 * @param {string} filters.search - Terme de recherche (optionnel)
 * @param {string} filters.office - Filtre par bureau (optionnel)
 * @param {string} filters.country - Filtre par pays (optionnel)
 * @param {string} filters.status - Filtre par statut (optionnel)
 * @param {string} filters.sortBy - Champ de tri (optionnel)
 * @param {string} filters.sortOrder - Ordre de tri (asc/desc) (optionnel)
 * @param {number} filters.page - Page (optionnel)
 * @param {number} filters.limit - Limite par page (optionnel)
 */
export const getUserProgressAnalytics = async (filters = {}) => {
  try {
    const response = await analyticsAPI.get('/analytics/users/progress', {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Erreur récupération progrès utilisateurs:', error);
    throw error;
  }
};

/**
 * Récupère les détails de progrès d'un utilisateur spécifique
 * @param {string} campaignId - ID de la campagne
 * @param {string} targetEmail - Email de l'utilisateur
 */
export const getUserDetailedProgress = async (campaignId, targetEmail) => {
  try {
    const response = await analyticsAPI.get(`/analytics/users/${campaignId}/${encodeURIComponent(targetEmail)}`);
    return response.data;
  } catch (error) {
    console.error('Erreur récupération détails utilisateur:', error);
    throw error;
  }
};

/**
 * Récupère les données pour les graphiques de progression dans le temps
 * @param {Object} params - Paramètres temporels
 * @param {string} params.timeframe - Période (7d, 30d, 90d, 1y)
 * @param {string} params.campaignId - ID de campagne (optionnel)
 */
export const getProgressOverTime = async (params = {}) => {
  try {
    const response = await analyticsAPI.get('/analytics/progress-over-time', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Erreur récupération progression temporelle:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques de performance par formation
 */
export const getFormationPerformanceStats = async () => {
  try {
    const response = await analyticsAPI.get('/analytics/formations/performance');
    return response.data;
  } catch (error) {
    console.error('Erreur récupération performance formations:', error);
    throw error;
  }
};

/**
 * Récupère les données d'engagement et d'activité
 * @param {Object} params - Paramètres de l'analyse d'engagement
 * @param {string} params.timeframe - Période d'analyse
 * @param {string} params.groupBy - Groupement (day, week, month)
 */
export const getEngagementAnalytics = async (params = {}) => {
  try {
    const response = await analyticsAPI.get('/analytics/engagement', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Erreur récupération analytics engagement:', error);
    throw error;
  }
};

/**
 * Récupère les métriques de completion et d'abandon
 */
export const getCompletionMetrics = async () => {
  try {
    const response = await analyticsAPI.get('/analytics/completion-metrics');
    return response.data;
  } catch (error) {
    console.error('Erreur récupération métriques completion:', error);
    throw error;
  }
};

/**
 * Export des données analytics en différents formats
 * @param {Object} exportParams - Paramètres d'export
 * @param {string} exportParams.format - Format (csv, xlsx, json)
 * @param {string} exportParams.type - Type de données (users, campaigns, overview)
 * @param {Object} exportParams.filters - Filtres à appliquer
 */
export const exportAnalyticsData = async (exportParams) => {
  try {
    const response = await analyticsAPI.post('/analytics/export', exportParams, {
      responseType: 'blob' // Important pour les fichiers
    });
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Déterminer l'extension du fichier
    const extension = exportParams.format === 'xlsx' ? 'xlsx' : 
                     exportParams.format === 'csv' ? 'csv' : 'json';
    
    link.setAttribute('download', `analytics-${exportParams.type}-${new Date().toISOString().split('T')[0]}.${extension}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Export terminé avec succès' };
  } catch (error) {
    console.error('Erreur export données analytics:', error);
    throw error;
  }
};

/**
 * Récupère les recommandations basées sur les analytics
 * @param {string} campaignId - ID de campagne (optionnel)
 */
export const getAnalyticsRecommendations = async (campaignId = null) => {
  try {
    const params = campaignId ? { campaignId } : {};
    const response = await analyticsAPI.get('/analytics/recommendations', { params });
    return response.data;
  } catch (error) {
    console.error('Erreur récupération recommandations analytics:', error);
    throw error;
  }
};

/**
 * Fonction helper pour combiner toutes les données analytics
 * Utilisée par la page Analytics pour récupérer toutes les données nécessaires
 */
export const getAllAnalyticsData = async (filters = {}) => {
  try {
    console.log('📊 Récupération de toutes les données analytics...');
    
    // Exécuter toutes les requêtes en parallèle
    const [
      overviewData,
      campaignsData,
      userProgressData,
      progressOverTimeData,
      formationPerformanceData,
      recommendationsData
    ] = await Promise.all([
      getAnalyticsOverview(),
      getAnalyticsCampaigns(),
      getUserProgressAnalytics(filters),
      getProgressOverTime({ timeframe: '30d' }),
      getFormationPerformanceStats(),
      getAnalyticsRecommendations()
    ]);

    console.log('✅ Toutes les données analytics récupérées');
    
    return {
      success: true,
      data: {
        overview: overviewData.data,
        campaigns: campaignsData.data,
        userProgress: userProgressData.data,
        progressOverTime: progressOverTimeData.data,
        formationPerformance: formationPerformanceData.data,
        recommendations: recommendationsData.data
      }
    };
  } catch (error) {
    console.error('❌ Erreur récupération données analytics complètes:', error);
    throw error;
  }
};

// Export par défaut de l'instance axios pour d'autres utilisations
export default analyticsAPI;