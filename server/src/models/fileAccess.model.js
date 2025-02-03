const mongoose = require('mongoose');

const fileAccessSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accessType: {
        type: String,
        enum: ['view', 'download', 'edit', 'share'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    success: {
        type: Boolean,
        default: true
    }
});

// Indexes for analytics queries
fileAccessSchema.index({ fileId: 1, timestamp: -1 });
fileAccessSchema.index({ userId: 1, timestamp: -1 });
fileAccessSchema.index({ timestamp: -1 });

module.exports = mongoose.model('FileAccess', fileAccessSchema);
