import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { supabase } from '../supabaseClient'; // Import Supabase client

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({ baseURL });

// Add request interceptor to include JWT and for debugging
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => { // Make interceptor async
    // Get the current Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error getting Supabase session:', sessionError);
      // Optionally, you could prevent the request or handle this error
    }

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log('Authorization header added to API request.');
    } else {
      console.log('No active session found, Authorization header not added.');
    }

    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.data ? `Data: ${JSON.stringify(config.data)}` : '',
      config.headers.Authorization ? 'Token: Present' : 'Token: Absent'
    );
    return config;
  },
  (error: AxiosError) => {
    console.error('API Request Error Interceptor:', error);
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
    console.error('API Response Error Interceptor:', error.response?.status, error.config?.url, error.response?.data || error.message);
    return Promise.reject(error);
  }
); 