const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    externalId: {
        type: String,
        required: [true, 'External ID is required'],
        unique: true,
        index: true
    },
    description: {
        type: String,
        trim: true
    },
    coverImage: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Cover image must be a valid URL'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['liked', 'read'],
            message: 'Status must be either ""liked"" or ""read""'
        },
        required: [true, 'Status is required']
    },
    author: {
        type: String,
        trim: true
    },
    genres: [{
        type: String,
        trim: true
    }],
    chapters: {
        type: Number,
        min: [0, 'Chapters cannot be negative']
    },
    year: Number,
    dateAdded: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update lastUpdated on save
mangaSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Indexes for better query performance
mangaSchema.index({ status: 1, dateAdded: -1 });
mangaSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Manga', mangaSchema);