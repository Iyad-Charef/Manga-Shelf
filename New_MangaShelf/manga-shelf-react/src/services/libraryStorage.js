/**
 * Local Library Storage Service
 * Manages user's manga library in localStorage
 * Format: 'manga_library_<userId>' stores an array of manga objects
 */

const getLibraryKey = (userId) => `manga_library_${userId}`;

export const libraryStorage = {
    /**
     * Get all manga in user's library
     */
    getLibrary: (userId, statusFilter = null) => {
        try {
            const key = getLibraryKey(userId);
            const data = localStorage.getItem(key);
            let library = data ? JSON.parse(data) : [];

            if (statusFilter && ['liked', 'read', 'reading', 'plan-to-read', 'dropped'].includes(statusFilter)) {
                library = library.filter(m => m.status === statusFilter);
            }

            return library.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        } catch (error) {
            console.error('Error reading library:', error);
            return [];
        }
    },

    /**
     * Add or update manga in library
     */
    addManga: (userId, mangaData) => {
        try {
            if (!userId) throw new Error('User ID is required');
            if (!mangaData.externalId) throw new Error('External ID is required');
            if (!mangaData.title) throw new Error('Title is required');
            if (!mangaData.status) throw new Error('Status is required');

            const key = getLibraryKey(userId);
            let library = libraryStorage.getLibrary(userId);

            // Check if manga already exists in this user's library
            const existingIndex = library.findIndex(m => m.externalId === mangaData.externalId);

            if (existingIndex >= 0) {
                // Update existing
                library[existingIndex] = {
                    ...library[existingIndex],
                    ...mangaData,
                    lastUpdated: new Date().toISOString()
                };
            } else {
                // Add new
                const newManga = {
                    _id: `local_${userId}_${mangaData.externalId}_${Date.now()}`,
                    userId,
                    ...mangaData,
                    dateAdded: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                };
                library.push(newManga);
            }

            localStorage.setItem(key, JSON.stringify(library));
            return existingIndex >= 0 ? library[existingIndex] : library[library.length - 1];
        } catch (error) {
            console.error('Error adding manga:', error);
            throw error;
        }
    },

    /**
     * Remove manga from library
     */
    removeManga: (userId, mangaId) => {
        try {
            const key = getLibraryKey(userId);
            let library = libraryStorage.getLibrary(userId);

            const initialLength = library.length;
            library = library.filter(m => m._id !== mangaId);

            if (library.length === initialLength) {
                throw new Error('Manga not found');
            }

            localStorage.setItem(key, JSON.stringify(library));
            return { success: true, message: 'Manga removed from library' };
        } catch (error) {
            console.error('Error removing manga:', error);
            throw error;
        }
    },

    /**
     * Clear entire library for user (dangerous!)
     */
    clearLibrary: (userId) => {
        try {
            const key = getLibraryKey(userId);
            localStorage.removeItem(key);
            return { success: true, message: 'Library cleared' };
        } catch (error) {
            console.error('Error clearing library:', error);
            throw error;
        }
    },

    /**
     * Get storage info
     */
    getStorageInfo: () => {
        const used = new Blob(Object.values(localStorage)).size;
        const limit = 5 * 1024 * 1024; // 5MB typical limit
        return {
            used: `${(used / 1024).toFixed(2)} KB`,
            limit: `${(limit / 1024 / 1024).toFixed(1)} MB`,
            percentUsed: ((used / limit) * 100).toFixed(1)
        };
    }
};

export default libraryStorage;
