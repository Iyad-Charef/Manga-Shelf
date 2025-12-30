// routes/manga.js
const express = require('express');
const mangaController = require('../controllers/mangaController');
const { authenticate } = require('../middleware/auth');
const { validateManga, validateSearch } = require('../middleware/validation');
const router = express.Router();

router.get('/search', validateSearch, mangaController.searchManga);

router.post('/library', authenticate, validateManga, mangaController.saveManga);
router.get('/library', authenticate, mangaController.getLibrary);
router.delete('/library/:id', authenticate, mangaController.deleteManga);

router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;