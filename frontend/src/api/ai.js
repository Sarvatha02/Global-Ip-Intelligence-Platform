import { GoogleGenAI } from "@google/genai";
import client from './client'; 

export const authAPI = {
  // Login Endpoint
  login: async (credentials) => {
    const response = await client.post('/auth/login', credentials);
    return response.data;
  },
  // Register Endpoint
  register: async (userData) => {
    const response = await client.post('/auth/register', userData);
    return response.data;
  },
  // ✅ Firebase Login Endpoint (Fixed for React pages)
  firebaseLogin: async (idToken) => {
    const response = await client.post('/auth/firebase-login', { idToken });
    return response.data;
  },
  // Get User Endpoint
  getCurrentUser: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  }
};
