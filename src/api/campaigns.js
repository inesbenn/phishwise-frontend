import axios from 'axios';

// Configuration unifiée de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for regular operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs globalement
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // More specific error handling
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout: La requête a pris trop de temps. Veuillez réessayer.');
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_RESET') {
      throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est en cours d\'exécution sur le port 3000.');
    } else if (error.code === 'ERR_CONNECTION_REFUSED') {
      throw new Error('Connexion refusée. Le serveur backend n\'est pas accessible.');
    } else if (error.response?.status === 404) {
      throw new Error('Endpoint non trouvé. Vérifiez l\'URL de l\'API.');
    } else if (error.response?.status >= 500) {
      throw new Error('Erreur serveur. Vérifiez les logs du backend.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Requête invalide.');
    } else if (error.response?.status === 401) {
      throw new Error('Non autorisé. Vérifiez vos permissions.');
    } else if (error.response?.status === 403) {
      throw new Error('Accès interdit.');
    }
    
    return Promise.reject(error);
  }
);

// Create a special API instance for VERY heavy operations like cloning
const UNLIMITED_API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0, // No timeout - let it run until completion
  headers: {
    'Content-Type': 'application/json',
  },
  // Additional config to handle long-running requests
  maxRedirects: 5,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Apply same interceptor to unlimited API but with different timeout handling
UNLIMITED_API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Unlimited API Error:', error);
    
    // For unlimited API, we don't expect timeout errors, but handle network issues
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_RESET') {
      throw new Error('Connexion interrompue pendant le clonage. Cela peut être dû à la complexité de la page ou à un problème de réseau. Veuillez réessayer.');
    } else if (error.code === 'ERR_CONNECTION_REFUSED') {
      throw new Error('Connexion refusée. Le serveur backend n\'est pas accessible.');
    } else if (error.response?.status === 404) {
      throw new Error('Endpoint non trouvé. Vérifiez l\'URL de l\'API.');
    } else if (error.response?.status >= 500) {
      throw new Error('Erreur serveur lors du clonage. Vérifiez les logs du backend.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'URL invalide ou impossible à cloner.');
    } else if (error.response?.status === 401) {
      throw new Error('Non autorisé. Vérifiez vos permissions.');
    } else if (error.response?.status === 403) {
      throw new Error('Accès interdit.');
    }
    
    return Promise.reject(error);
  }
);

// Regular API functions
export const createCampaign = payload =>
  API.post('/campaigns', payload).then(res => res.data);

export const updateStep0 = (id, payload) =>
    API.put(`/campaigns/${id}/step/0`, payload).then(res => res.data);



export const updateStep1 = (id, targets) =>
  API.put(`/campaigns/${id}/step/1`, { targets }).then(res => res.data);


export function getTargets(id) {
  return API.get(`/campaigns/${id}/targets`).then(res => res.data);
}

export function getNewsThemes() {
  return API.get('/news/themes').then(res => res.data);
}

export function getNewsCountries() {
  return API.get('/news/countries').then(res => res.data);
}

export function fetchCampaignNews(campaignId, filters) {
  return API.get(`/campaigns/${campaignId}/news`, { params: filters }).then(res => res.data);
}

export function saveSelectedNews(campaignId, selectedNews) {
  return API.post(`/campaigns/${campaignId}/news/select`, { selectedNews }).then(res => res.data);
}

export function generateAISuggestions(campaignId, newsForSuggestions) {
  return API.post(`/campaigns/${campaignId}/suggestions/generate`, { selectedNews: newsForSuggestions }).then(res => res.data);
}

export function getCampaignStep2Data(campaignId) {
  return API.get(`/campaigns/${campaignId}/step2`).then(res => res.data);
}export function updateCampaignStep2Data(campaignId, data) {
  return API.put(`/campaigns/${campaignId}/step2`, data).then(res => res.data);
}

// Email template functions
export function generateEmailTemplates(campaignId, useSelectedNews = true, customParams = {}) {
  return API.post(`/campaigns/${campaignId}/templates/generate`, { useSelectedNews, customParams }).then(res => res.data);
}export function getEmailTemplates(campaignId) {
  return API.get(`/campaigns/${campaignId}/templates`).then(res => res.data);
}export function selectEmailTemplate(campaignId, templateId) {
  return API.put(`/campaigns/${campaignId}/templates/${templateId}/select`).then(res => res.data);
}export function generateCustomTemplate(campaignId, params) {
  return API.post(`/campaigns/${campaignId}/templates/custom`, params).then(res => res.data);
}export function deleteEmailTemplate(campaignId, templateId) {
  return API.delete(`/campaigns/${campaignId}/templates/${templateId}`).then(res => res.data);
}export function previewEmailTemplate(campaignId, templateId, sampleData = {}) {
  return API.post(`/campaigns/${campaignId}/templates/${templateId}/preview`, { sampleData }).then(res => res.data);
}

// Landing page functions - using UNLIMITED_API for cloning operations
export function getLandingPageData(campaignId) {
  return API.get(`/landingpage/${campaignId}`).then(res => res.data);
}

// Use UNLIMITED_API for cloning since it's a very heavy operation that needs unlimited time
export function cloneUrl(campaignId, url) {
  return UNLIMITED_API.post(`/landingpage/${campaignId}/clone`, { url }).then(res => res.data);
}

// FIXED: Changed parameter name from 'template' to 'templateId' to match the actual usage
// and send the templateId directly instead of wrapping it in an object
export function selectLandingPageTemplate(campaignId, templateId) {
  return API.post(`/landingpage/${campaignId}/template`, { templateId }).then(res => res.data);
}export function getLandingPageTemplates() {
  return API.get(`/landingpage/templates`).then(res => res.data);
}export function updatePostSubmissionActions(campaignId, actions) {
  return API.put(`/landingpage/${campaignId}/post-submission`, { postSubmissionActions: actions }).then(res => res.data);
}export function validateLandingPageStep(campaignId) {
  return API.post(`/landingpage/${campaignId}/validate`).then(res => res.data);
}

// Test de connexion
export function testConnection() {
  return API.get('/health').then(res => res.data);
}
