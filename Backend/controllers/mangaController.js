// controllers/mangaController.js
const { validationResult } = require('express-validator');
const Manga = require('../models/Manga');
const { searchMangaDx } = require('../utils/apiClient');

class MangaController {
    async searchManga(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0].msg });
            }

            const { q } = req.query;

            if (!q || q.trim().length < 2) {
                return res.status(400).json({ 
                    error: 'Search query must be at least 2 characters' 
                });
            }

            const results = await searchMangaDx(q.trim());

            const formattedResults = results.map(manga => {
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

    async saveManga(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0].msg });
            }

            const { title, externalId, description, author, genres, status, coverImage, chapters, year } = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!title || !externalId || !status) {
                return res.status(400).json({
                    error: 'Missing required fields: title, externalId, and status'
                });
            }

            let manga = await Manga.findOne({ externalId, userId });

            if (manga) {
                manga.status = status;
                manga.lastUpdated = new Date();
                await manga.save();

                return res.json({
                    success: true,
                    message: 'Manga status updated',
                    data: manga
                });
            }

            manga = new Manga({
                title,
                externalId,
                description,
                author,
                genres,
                status,
                coverImage,
                chapters,
                year,
                userId
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

    async getLibrary(req, res) {
        try {
            const { status } = req.query;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const filter = {};

            if (status && ['liked', 'read'].includes(status)) {
                filter.status = status;
            }

            filter.userId = userId;

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

    async deleteManga(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const manga = await Manga.findOneAndDelete({ _id: id, userId });

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
