// src/services/api.js
import axios from 'axios';
import libraryStorage from './libraryStorage';

const getApiUrl = () => {
    if (import.meta.env.MODE === 'production') {
        return '';
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, 
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`🔵 API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.response?.data || error.message);
        
        // Handle specific error cases
        if (error.response?.status === 404) {
            throw new Error('Resource not found');
        } else if (error.response?.status === 400) {
            throw new Error(error.response.data.error || 'Invalid request');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        
        throw error;
    }
);

// Public search
export const searchManga = async (query) => {
    try {
        const response = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to search manga');
    }
};

// Local library storage
export const fetchLibrary = async (status = null) => {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const library = libraryStorage.getLibrary(userId, status);
        return {
            success: true,
            data: library,
            total: library.length
        };
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch library');
    }
};

export const addToLibrary = async (manga) => {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const savedManga = libraryStorage.addManga(userId, manga);
        return {
            success: true,
            message: 'Manga saved to library',
            data: savedManga
        };
    } catch (error) {
        throw new Error(error.message || 'Failed to add manga to library');
    }
};

export const removeFromLibrary = async (id) => {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            throw new Error('User not authenticated');
        }

        libraryStorage.removeManga(userId, id);
        return {
            success: true,
            message: 'Manga removed from library'
        };
    } catch (error) {
        throw new Error(error.message || 'Failed to remove manga from library');
    }
};

// ============ HEALTH CHECK ============
export const checkHealth = async () => {
    try {
        const response = await api.get('/api/health');
        return response.data;
    } catch (error) {
        throw new Error('Backend is not reachable');
    }
};

// Auth endpoints
export const registerUser = async (userData) => {
    try {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed');
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/api/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

export const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await api.post('/api/auth/refresh', { refreshToken });
        return response.data;
    } catch (error) {
        throw new Error('Session expired. Please login again.');
    }
};

export const getUserProfile = async () => {
    try {
        const response = await api.get('/api/auth/profile');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
};

export default api;

