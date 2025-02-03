const mongoose = require('mongoose');

const storageUsageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usageBytes: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for time-series queries
storageUsageSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('StorageUsage', storageUsageSchema);
