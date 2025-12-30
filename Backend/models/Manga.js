const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    
    title: {
        type: String,
        required: [true, 'Manga title is required'],
        trim: true
    },
    externalId: {
        type: String,
        required: [true, 'External ID is required'],
        index: true
    },
    description: {
        type: String,
        default: ''
    },
    author: {
        type: String,
        default: 'Unknown'
    },
    genres: [{
        type: String,
        trim: true
    }],
    coverImage: {
        type: String,
        default: null
    },
    chapters: {
        type: Number,
        default: 0,
        min: 0
    },
    year: {
        type: Number,
        default: null
    },
    
    status: {
        type: String,
        enum: ['liked', 'read', 'reading', 'plan-to-read', 'dropped'],
        required: [true, 'Status is required'],
        default: 'liked'
    },
    currentChapter: {
        type: Number,
        default: 0,
        min: 0
    },
    personalRating: {
        type: Number,
        min: 1,
        max: 10,
        default: null
    },
    
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

mangaSchema.index({ userId: 1, status: 1, dateAdded: -1 });
mangaSchema.index({ userId: 1, externalId: 1 }, { unique: true });

mangaSchema.pre('save', function(next) {
    this.lastUpdated = Date.now();
    next();
});
mangaSchema.statics.findByUserAndStatus = function(userId, status) {
    const query = { userId };
    if (status) query.status = status;
    return this.find(query).sort({ dateAdded: -1 });
};

mangaSchema.virtual('readingProgress').get(function() {
    if (this.chapters && this.chapters > 0 && this.currentChapter) {
        return Math.round((this.currentChapter / this.chapters) * 100);
    }
    return 0;
});

mangaSchema.set('toJSON', { virtuals: true });
mangaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Manga', mangaSchema);
