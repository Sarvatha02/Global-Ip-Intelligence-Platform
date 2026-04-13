import { GoogleGenAI } from "@google/genai";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// --- Helper for API calls ---
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

// --- 1. Auth API ---
export const authAPI = {
  login: async (credentials) => {
    // POST /api/auth/login
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  register: async (userData) => {
    // POST /api/auth/register
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  getCurrentUser: async () => {
    // GET /api/auth/me
    return fetchWithAuth('/auth/me');
  },
  logout: async () => {
    // Optional: Call backend to invalidate token if needed
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// --- 2. Dashboard API ---
export const dashboardAPI = {
  getStats: async () => {
    return fetchWithAuth('/dashboard/stats');
  }
};

// --- 3. Profile API ---
export const profileAPI = {
  updateProfile: async (data) => {
    return fetchWithAuth('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};

// --- 4. Patents API ---
export const patentsAPI = {
  // Use a GET request to fetch the list of all patents
  getPatents: async () => {
    // Assuming '/patents' returns the full list of patents
    return fetchWithAuth('/patents'); 
  },
  
  search: async (query) => {
    // Keep your existing search function, assuming '/patents/search?q=' handles the query
    return fetchWithAuth(`/patents/search?q=${query}`);
  },
  
  // You may want to add these later:
  // getPatentDetails: async (id) => {
  //   return fetchWithAuth(`/patents/${id}`);
  // }
};

// --- 5. AI Generation (Your existing code, updated for Vite) ---
export const generateAIResponse = async (prompt) => {
  // In Vite, use import.meta.env, not process.env
  const apiKey = import.meta.env.VITE_API_KEY; 

  if (!apiKey) {
    console.error("API_KEY is missing. Check your .env.local file.");
    return "Configuration Error: API Key is missing.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Adjust model name if needed (e.g., 'gemini-pro' or 'gemini-1.5-flash')
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' }); 
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm having trouble connecting to the AI right now.";
  }
};