import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({ baseURL });

// Add request interceptor for debugging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 
      config.data ? `Data: ${JSON.stringify(config.data)}` : '');
    return config;
  },
  (error: AxiosError) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, 
      response.data ? `Data: ${JSON.stringify(response.data).substring(0, 200)}${response.data && JSON.stringify(response.data).length > 200 ? '...' : ''}` : '');
    return response;
  },
  (error: AxiosError) => {
    console.error('API Response Error:', error.response?.status, error.config?.url, error.response?.data || error.message);
    return Promise.reject(error);
  }
); 