import client from '../api/client';

export const ipAssetAPI = {
    // Standard search for the repository
    getAssets: async (params) => {
        const response = await client.get(`/assets/search`, { params });
        return response.data;
    },
    
    // Fetches specifically tracked assets for the tracker page
    getTrackedAssets: async (userId) => {
        const response = await client.get(`/tracker/my-tracked-assets`, {
            params: { userId }
        });
        return response.data;
    }
};