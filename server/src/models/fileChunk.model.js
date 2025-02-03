const mongoose = require('mongoose');

const fileChunkSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },
    chunkIndex: {
        type: Number,
        required: true
    },
    data: {
        type: Buffer,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    version: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient chunk retrieval
fileChunkSchema.index({ fileId: 1, chunkIndex: 1 });

module.exports = mongoose.model('FileChunk', fileChunkSchema);
