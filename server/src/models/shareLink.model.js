const mongoose = require('mongoose');

const shareLinkSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date
    },
    hashedPassword: {
        type: String
    },
    permissions: {
        type: [String],
        enum: ['read', 'write'],
        default: ['read']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastAccessed: {
        type: Date
    },
    accessCount: {
        type: Number,
        default: 0
    }
});

// Indexes for efficient queries
shareLinkSchema.index({ token: 1 });
shareLinkSchema.index({ fileId: 1 });
shareLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ShareLink', shareLinkSchema);
