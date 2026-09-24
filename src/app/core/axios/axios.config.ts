import axios from 'axios';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'bilanko_jwt_token';

export const apiClient = axios.create({
  baseURL: environment.baseApiUrl,
});

apiClient.interceptors.request.use((config) => {
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});