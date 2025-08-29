import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
});

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('accessToken');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('accessToken');
      window.location.href = '/';
    } else if (error.response?.status === 403) {
      // Accès refusé pour ce rôle
      console.error('Accès refusé:', error.response.data.message);
      // Optionnel : rediriger vers une page d'erreur
    }
    return Promise.reject(error);
  }
);

export default client;
