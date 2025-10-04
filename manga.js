// routes/manga.js
const express = require('express');
const mangaController = require('../controllers/mangaController');
const router = express.Router();

// Search manga via MangaDx API
router.get('/search', mangaController.searchManga);

// Library management
router.post('/library', mangaController.saveManga);
router.get('/library', mangaController.getLibrary);
router.delete('/library/:id', mangaController.deleteManga);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;