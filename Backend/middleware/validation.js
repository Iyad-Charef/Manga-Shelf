const { body, query } = require('express-validator');

const validateRegistration = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be 3-30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username: letters, numbers, underscore only'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
];

const validateLogin = [
    body('login').notEmpty().withMessage('Email or username required').trim(),
    body('password').notEmpty().withMessage('Password required')
];

const validateManga = [
    body('title').notEmpty().withMessage('Title required').trim(),
    body('externalId').notEmpty().withMessage('External ID required'),
    body('status')
        .isIn(['liked', 'read', 'reading', 'plan-to-read', 'dropped'])
        .withMessage('Invalid status'),
    body('personalRating')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Rating: 1-10'),
    body('currentChapter')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Chapter must be positive')
];

const validateSearch = [
    query('q')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('Search: 2-100 characters')
        .trim()
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateManga,
    validateSearch
};
