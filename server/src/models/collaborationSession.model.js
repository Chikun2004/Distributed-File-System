const mongoose = require('mongoose');

const collaborationSessionSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        default: 0
    },
    activeUsers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
});

// Index for quick session lookup
collaborationSessionSchema.index({ fileId: 1 });

module.exports = mongoose.model('CollaborationSession', collaborationSessionSchema);
