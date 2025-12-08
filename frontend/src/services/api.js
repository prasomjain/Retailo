import axios from 'axios';

// Use relative path in production to leverage Vercel rewrites, or localhost in dev
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const salesAPI = {
  // Get sales data with filters, search, sort, and pagination
  getSalesData: async (params = {}) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  // Get filter options
  getFilterOptions: async () => {
    const response = await api.get('/sales/filters');
    return response.data;
  },
};

export default api;


