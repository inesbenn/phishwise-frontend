import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
});

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('accessToken');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default client;
