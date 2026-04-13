import client from './client';

export const searchAPI = {
  searchAll: async (params) => {
    try {
      const queryParams = {
        q: params.keyword || '',
        source: params.source || 'local',
        type: params.ipType === 'both' ? 'ALL' : (params.ipType || 'ALL').toUpperCase(),
        
        jurisdictions: Array.isArray(params.jurisdictions) && params.jurisdictions.length > 0 
            ? params.jurisdictions.join(',') 
            : null,
        
        status: Array.isArray(params.statuses) && params.statuses.length > 0 
            ? params.statuses.join(',') 
            : null,
        
        page: params.page || 0,
        size: params.size || 10,
        sortBy: params.sortBy || 'filingDate',
        sortDirection: params.sortDirection || 'desc'
      };

      const response = await client.get('/search', { params: queryParams });
      const data = response.data;
      
      if (Array.isArray(data)) {
        return {
          content: data,
          totalElements: data.length,
          totalPages: 1
        };
      } else {
        return {
          content: data.content || [],
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0
        };
      }

    } catch (error) {
      console.error("API Call Failed:", error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  }
};