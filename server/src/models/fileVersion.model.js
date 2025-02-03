const mongoose = require('mongoose');

const fileVersionSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    chunks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileChunk'
    }],
    size: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    comment: {
        type: String
    }
});

// Compound index for efficient version retrieval
fileVersionSchema.index({ fileId: 1, version: 1 });

module.exports = mongoose.model('FileVersion', fileVersionSchema);
