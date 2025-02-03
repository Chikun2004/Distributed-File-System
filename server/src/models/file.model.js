const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    chunks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileChunk'
    }],
    hash: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentFolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null
    },
    version: {
        type: Number,
        default: 1
    },
    sharedWith: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        permissionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Permission'
        }
    }],
    publicLinks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShareLink'
    }],
    isFolder: {
        type: Boolean,
        default: false
    },
    mimeType: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('File', fileSchema);
