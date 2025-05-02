import axios from 'axios';

// API base URL - adjust for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Housing data API
export const housingApi = {
  // Get paginated housing data
  getHousingData: async (limit = 100, offset = 0, country?: string | null) => {
    const countryParam = country ? `&country=${country}` : '';
    const response = await apiClient.get(`/housing/data?limit=${limit}&offset=${offset}${countryParam}`);
    return response.data;
  },

  // Get price statistics
  getPriceStats: async (country?: string | null) => {
    const countryParam = country ? `?country=${country}` : '';
    const response = await apiClient.get(`/housing/price-stats${countryParam}`);
    return response.data;
  },

  // Get area statistics
  getAreaStats: async (country?: string | null) => {
    const countryParam = country ? `?country=${country}` : '';
    const response = await apiClient.get(`/housing/area-stats${countryParam}`);
    return response.data;
  },

  // Get location data for map visualization
  getLocations: async (country?: string | null) => {
    const countryParam = country ? `?country=${country}` : '';
    const response = await apiClient.get(`/housing/locations${countryParam}`);
    return response.data;
  },

  // Get property type distribution
  getPropertyTypes: async (country?: string | null) => {
    const countryParam = country ? `?country=${country}` : '';
    const response = await apiClient.get(`/housing/property-types${countryParam}`);
    return response.data;
  },

  // Get region statistics
  getRegionStats: async (country?: string | null) => {
    const countryParam = country ? `?country=${country}` : '';
    const response = await apiClient.get(`/housing/region-stats${countryParam}`);
    return response.data;
  },

  // Get available countries
  getCountries: async () => {
    const response = await apiClient.get('/housing/countries');
    return response.data;
  },
};

// Model API
export const modelApi = {
  // Get model features
  getFeatures: async () => {
    const response = await apiClient.get('/model/features');
    return response.data;
  },

  // Get feature importance
  getFeatureImportance: async () => {
    const response = await apiClient.get('/model/importance');
    return response.data;
  },

  // Predict housing price
  predictPrice: async (features: Record<string, number>) => {
    const response = await apiClient.post('/model/predict', {
      features,
    });
    return response.data;
  },
};

// Create a named API object to export instead of anonymous default export
const api = {
  housingApi,
  modelApi,
};

export default api;