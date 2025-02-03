const crypto = require('crypto');
const { Readable } = require('stream');
const mongoose = require('mongoose');
const File = require('../models/file.model');
const FileChunk = require('../models/fileChunk.model');
const FileVersion = require('../models/fileVersion.model');
const redis = require('../config/redis');

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

class FileService {
    async uploadFile(fileStream, fileName, fileSize, userId, parentFolderId = null) {
        const fileId = new mongoose.Types.ObjectId();
        const chunks = [];
        let currentChunk = 0;
        
        // Create file hash for deduplication
        const fileHash = crypto.createHash('sha256');
        
        // Process file in chunks
        for await (const chunk of this._splitIntoChunks(fileStream, CHUNK_SIZE)) {
            fileHash.update(chunk);
            
            // Encrypt chunk
            const encryptedChunk = await this._encryptChunk(chunk);
            
            // Store chunk
            const chunkId = new mongoose.Types.ObjectId();
            await FileChunk.create({
                _id: chunkId,
                fileId,
                chunkIndex: currentChunk,
                data: encryptedChunk,
                size: chunk.length
            });
            
            chunks.push(chunkId);
            currentChunk++;
        }
        
        const fileHashValue = fileHash.digest('hex');
        
        // Check for duplicate file
        const existingFile = await File.findOne({ hash: fileHashValue });
        if (existingFile) {
            // Delete uploaded chunks and reuse existing file
            await FileChunk.deleteMany({ fileId });
            return existingFile._id;
        }
        
        // Create file record
        const file = await File.create({
            _id: fileId,
            name: fileName,
            size: fileSize,
            chunks: chunks,
            hash: fileHashValue,
            owner: userId,
            parentFolder: parentFolderId,
            version: 1
        });
        
        // Create initial version
        await FileVersion.create({
            fileId: file._id,
            version: 1,
            chunks: chunks,
            size: fileSize,
            createdBy: userId
        });
        
        // Cache file metadata
        await redis.set(`file:${file._id}`, JSON.stringify(file), 'EX', 3600);
        
        return file._id;
    }
    
    async downloadFile(fileId, userId) {
        const file = await File.findOne({ _id: fileId });
        if (!file) throw new Error('File not found');
        
        // Check access permissions
        if (!await this._hasAccess(fileId, userId)) {
            throw new Error('Access denied');
        }
        
        const chunks = await FileChunk.find({ fileId }).sort({ chunkIndex: 1 });
        const stream = new Readable({
            async read() {
                if (chunks.length === 0) {
                    this.push(null);
                    return;
                }
                const chunk = chunks.shift();
                const decryptedChunk = await this._decryptChunk(chunk.data);
                this.push(decryptedChunk);
            }
        });
        
        return { stream, fileName: file.name };
    }
    
    async createVersion(fileId, fileStream, userId) {
        const file = await File.findOne({ _id: fileId });
        if (!file) throw new Error('File not found');
        
        const newVersion = file.version + 1;
        const chunks = [];
        let currentChunk = 0;
        let totalSize = 0;
        
        // Process new version chunks
        for await (const chunk of this._splitIntoChunks(fileStream, CHUNK_SIZE)) {
            const encryptedChunk = await this._encryptChunk(chunk);
            const chunkId = new mongoose.Types.ObjectId();
            
            await FileChunk.create({
                _id: chunkId,
                fileId,
                chunkIndex: currentChunk,
                data: encryptedChunk,
                size: chunk.length,
                version: newVersion
            });
            
            chunks.push(chunkId);
            totalSize += chunk.length;
            currentChunk++;
        }
        
        // Create version record
        await FileVersion.create({
            fileId: file._id,
            version: newVersion,
            chunks: chunks,
            size: totalSize,
            createdBy: userId
        });
        
        // Update file record
        file.version = newVersion;
        file.size = totalSize;
        file.modifiedAt = new Date();
        await file.save();
        
        // Update cache
        await redis.del(`file:${file._id}`);
        
        return newVersion;
    }
    
    async *_splitIntoChunks(stream, size) {
        let buffer = Buffer.alloc(0);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
            
            while (buffer.length >= size) {
                yield buffer.slice(0, size);
                buffer = buffer.slice(size);
            }
        }
        
        if (buffer.length > 0) {
            yield buffer;
        }
    }
    
    async _encryptChunk(chunk) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', process.env.ENCRYPTION_KEY, iv);
        const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);
        const authTag = cipher.getAuthTag();
        
        return Buffer.concat([iv, authTag, encrypted]);
    }
    
    async _decryptChunk(encryptedData) {
        const iv = encryptedData.slice(0, 16);
        const authTag = encryptedData.slice(16, 32);
        const encrypted = encryptedData.slice(32);
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', process.env.ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);
        
        return Buffer.concat([decipher.update(encrypted), decipher.final()]);
    }
    
    async _hasAccess(fileId, userId) {
        const file = await File.findOne({ _id: fileId })
            .populate('sharedWith')
            .populate('publicLinks');
            
        return file.owner.equals(userId) || 
               file.sharedWith.some(share => share.userId.equals(userId)) ||
               file.publicLinks.some(link => link.isActive);
    }
}

module.exports = new FileService();
