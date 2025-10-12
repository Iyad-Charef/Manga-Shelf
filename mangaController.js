// controllers/mangaController.js
const Manga = require('../models/Manga');
const { searchMangaDx, getMangaCover } = require('../utils/apiClient');

class MangaController {
    // Search manga using MangaDx API
    async searchManga(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length < 2) {
                return res.status(400).json({ 
                    error: 'Search query must be at least 2 characters' 
                });
            }

            const results = await searchMangaDx(q.trim());

            // Transform MangaDx data format
            const formattedResults = results.map(manga => {
            // Find cover_art relationship that contains attributes.fileName
            const coverRel = manga.relationships?.find(
                rel => rel.type === 'cover_art' && rel.attributes && rel.attributes.fileName
            );
            const coverImage = coverRel
                ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.512.jpg`
                : null;

            return {
                externalId: manga.id,
                title: manga.attributes.title?.en || 
                    manga.attributes.title[Object.keys(manga.attributes.title)[0]],
                description: manga.attributes.description?.en ||
                            manga.attributes.description?.[Object.keys(manga.attributes.description)[0]] || '',
                author: manga.relationships?.find(rel => rel.type === 'author')?.attributes?.name || 'Unknown',
                genres: Array.isArray(manga.attributes.tags)
                    ? manga.attributes.tags.map(tag => tag.attributes.name.en)
                    : [],
                chapters: manga.attributes.lastChapter || 0,
                year: manga.attributes.year,
                coverImage
                };
            });

            res.json({
                success: true,
                data: formattedResults,
                total: formattedResults.length
            });

        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({
                error: 'Failed to search manga',
                details: error.message
            });
        }
    }

    // Save manga to library
    async saveManga(req, res) {
        try {
            const { title, externalId, description, author, genres, status, coverImage, chapters, year } = req.body;

            // Validate required fields
            if (!title || !externalId || !status) {
                return res.status(400).json({
                    error: 'Missing required fields: title, externalId, and status'
                });
            }

            // Check if manga already exists
            let manga = await Manga.findOne({ externalId });

            if (manga) {
                // Update existing manga
                manga.status = status;
                manga.lastUpdated = new Date();
                await manga.save();

                return res.json({
                    success: true,
                    message: 'Manga status updated',
                    data: manga
                });
            }

            // Create new manga entry
            manga = new Manga({
                title,
                externalId,
                description,
                author,
                genres,
                status,
                coverImage,
                chapters,
                year
            });

            await manga.save();

            res.status(201).json({
                success: true,
                message: 'Manga saved to library',
                data: manga
            });

        } catch (error) {
            console.error('Save error:', error);

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation error',
                    details: Object.values(error.errors).map(e => e.message)
                });
            }

            res.status(500).json({
                error: 'Failed to save manga',
                details: error.message
            });
        }
    }

    // Get user's library
    async getLibrary(req, res) {
        try {
            const { status } = req.query;
            const filter = {};

            if (status && ['liked', 'read'].includes(status)) {
                filter.status = status;
            }

            const mangas = await Manga.find(filter)
                .sort({ dateAdded: -1 })
                .lean();

            res.json({
                success: true,
                data: mangas,
                total: mangas.length
            });

        } catch (error) {
            console.error('Library fetch error:', error);
            res.status(500).json({
                error: 'Failed to fetch library',
                details: error.message
            });
        }
    }

    // Delete manga from library
    async deleteManga(req, res) {
        try {
            const { id } = req.params;

            const manga = await Manga.findByIdAndDelete(id);

            if (!manga) {
                return res.status(404).json({
                    error: 'Manga not found'
                });
            }

            res.json({
                success: true,
                message: 'Manga removed from library',
                data: manga
            });

        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({
                error: 'Failed to delete manga',
                details: error.message
            });
        }
    }
}


module.exports = new MangaController();
