// src/api/geoAPI.js
import client from './client';

export const geoAPI = {
  // Get distribution matches GeoController @GetMapping("/distribution")
  getGeoDistribution: async (params = {}) => {
    const { data } = await client.get('/geo/distribution', { params });
    return data;
  },

  // Search distribution matches GeoController @GetMapping("/distribution/search")
  searchGeoDistribution: async (keyword, ipType = null) => {
    const params = { keyword };
    if (ipType && ipType !== 'both') params.ipType = ipType;
    const { data } = await client.get('/geo/distribution/search', { params });
    return data;
  },

  // Get stats matches GeoController @GetMapping("/stats")
  getGlobalStats: async () => {
    const { data } = await client.get('/geo/stats');
    return data;
  }
};