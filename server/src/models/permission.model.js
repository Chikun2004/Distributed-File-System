const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
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
    permissions: {
        type: [String],
        enum: ['read', 'write', 'share', 'delete'],
        default: ['read']
    },
    grantedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient permission lookup
permissionSchema.index({ fileId: 1, userId: 1 });

module.exports = mongoose.model('Permission', permissionSchema);
