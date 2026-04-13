import client from '../api/client';

export const notificationAPI = {
    // Fetches real-time alerts using the authenticated client
    getLatest: async (userId) => {
        // client.js automatically adds Base URL and Token
        const response = await client.get(`/notifications/user/${userId}`);
        return response.data;
    },
    
    markAsRead: async (id) => {
        await client.put(`/notifications/read/${id}`);
    }
};