const axios = require('axios');

const MANGADEX_BASE_URL = process.env.MANGADEX_API_BASE || 'https://api.mangadex.org';

const apiClient = axios.create({
    baseURL: MANGADEX_BASE_URL,
    timeout: 10000,
    headers: {
        'User-Agent': 'MangaLibraryTracker/1.0.0'
    }
});

apiClient.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);
async function searchMangaDx(title, limit = 20) {
    try {
        const response = await apiClient.get('/manga', {
            params: {
                title: title,
                limit: Math.min(limit, 100), // MangaDx max limit is 100
                includes: ['author', 'artist', 'cover_art'],
                'order[relevance]': 'desc'
            }
        });

        return response.data.data || [];

    } catch (error) {
        console.error('MangaDx search error:', error);
        throw new Error(`MangaDx API search failed: ${error.message}`);
    }
}

async function getMangaCover(mangaId, coverId) {
    try {
        const response = await apiClient.get(`/cover/${coverId}`);
        const filename = response.data.data.attributes.fileName;

        return `https://uploads.mangadx.org/covers/${mangaId}/${filename}.512.jpg`;

    } catch (error) {
        console.error('Cover fetch error:', error);
        return null;
    }
}

async function getMangaDetails(mangaId) {
    try {
        const response = await apiClient.get(`/manga/${mangaId}`, {
            params: {
                includes: ['author', 'artist', 'cover_art']
            }
        });

        return response.data.data;

    } catch (error) {
        console.error('Manga details error:', error);
        throw new Error(`Failed to get manga details: ${error.message}`);
    }
}

module.exports = {
    searchMangaDx,
    getMangaCover,
    getMangaDetails,
    apiClient

};