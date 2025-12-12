// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    ME: `${API_BASE_URL}/api/auth/me`,

    // User endpoints
    PROFILE: `${API_BASE_URL}/api/users/profile`,
    PREFERENCES: `${API_BASE_URL}/api/users/preferences`,
    MENTAL_HEALTH: `${API_BASE_URL}/api/users/mental-health`,
    GOALS: `${API_BASE_URL}/api/users/goals`,

    // Health check
    HEALTH: `${API_BASE_URL}/api/health`,
    TEST: `${API_BASE_URL}/api/test`
};

// Default headers for API requests
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// API helper function
export const apiRequest = async (url, options = {}) => {
    const config = {
        headers: getAuthHeaders(),
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'API request failed');
            error.status = response.status;
            // Pass through any additional data from the response (like verificationStatus)
            Object.assign(error, data);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

export default API_BASE_URL;