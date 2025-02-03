const crypto = require('crypto');
const File = require('../models/file.model');
const ShareLink = require('../models/shareLink.model');
const Permission = require('../models/permission.model');
const redis = require('../config/redis');

class SharingService {
    async shareWithUser(fileId, ownerId, targetUserId, permissions) {
        const file = await File.findOne({ _id: fileId, owner: ownerId });
        if (!file) throw new Error('File not found or access denied');

        // Check if already shared
        if (file.sharedWith.some(share => share.userId.equals(targetUserId))) {
            throw new Error('File already shared with this user');
        }

        // Create permission record
        const permission = await Permission.create({
            fileId,
            userId: targetUserId,
            permissions,
            grantedBy: ownerId
        });

        // Update file sharing info
        file.sharedWith.push({
            userId: targetUserId,
            permissionId: permission._id
        });
        await file.save();

        // Invalidate cache
        await redis.del(`file-permissions:${fileId}`);

        return permission;
    }

    async createShareLink(fileId, ownerId, options = {}) {
        const file = await File.findOne({ _id: fileId, owner: ownerId });
        if (!file) throw new Error('File not found or access denied');

        const {
            expiresAt = null,
            password = null,
            permissions = ['read']
        } = options;

        let hashedPassword = null;
        if (password) {
            const salt = crypto.randomBytes(16).toString('hex');
            hashedPassword = await this._hashPassword(password, salt);
        }

        // Generate unique token
        const token = crypto.randomBytes(32).toString('hex');

        // Create share link
        const shareLink = await ShareLink.create({
            fileId,
            token,
            createdBy: ownerId,
            expiresAt,
            hashedPassword,
            permissions,
            isActive: true
        });

        // Update file
        file.publicLinks.push(shareLink._id);
        await file.save();

        return {
            token,
            url: `${process.env.CLIENT_URL}/share/${token}`
        };
    }

    async revokeShareLink(fileId, ownerId, token) {
        const file = await File.findOne({ _id: fileId, owner: ownerId });
        if (!file) throw new Error('File not found or access denied');

        const shareLink = await ShareLink.findOne({ token });
        if (!shareLink) throw new Error('Share link not found');

        shareLink.isActive = false;
        await shareLink.save();

        // Remove from file's public links
        file.publicLinks = file.publicLinks.filter(
            linkId => !linkId.equals(shareLink._id)
        );
        await file.save();

        return true;
    }

    async validateShareLink(token, password = null) {
        const shareLink = await ShareLink.findOne({ token, isActive: true });
        if (!shareLink) throw new Error('Invalid or expired share link');

        // Check expiration
        if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
            shareLink.isActive = false;
            await shareLink.save();
            throw new Error('Share link has expired');
        }

        // Verify password if required
        if (shareLink.hashedPassword) {
            if (!password) throw new Error('Password required');
            const [hash, salt] = shareLink.hashedPassword.split('.');
            const inputHash = await this._hashPassword(password, salt);
            if (inputHash !== shareLink.hashedPassword) {
                throw new Error('Invalid password');
            }
        }

        return {
            fileId: shareLink.fileId,
            permissions: shareLink.permissions
        };
    }

    async updatePermissions(fileId, ownerId, targetUserId, permissions) {
        const file = await File.findOne({ _id: fileId, owner: ownerId });
        if (!file) throw new Error('File not found or access denied');

        const shareInfo = file.sharedWith.find(
            share => share.userId.equals(targetUserId)
        );
        if (!shareInfo) throw new Error('File not shared with this user');

        // Update permissions
        await Permission.findByIdAndUpdate(shareInfo.permissionId, {
            permissions,
            updatedAt: new Date()
        });

        // Invalidate cache
        await redis.del(`file-permissions:${fileId}`);

        return true;
    }

    async removeSharing(fileId, ownerId, targetUserId) {
        const file = await File.findOne({ _id: fileId, owner: ownerId });
        if (!file) throw new Error('File not found or access denied');

        const shareInfo = file.sharedWith.find(
            share => share.userId.equals(targetUserId)
        );
        if (!shareInfo) throw new Error('File not shared with this user');

        // Remove permission record
        await Permission.findByIdAndDelete(shareInfo.permissionId);

        // Update file
        file.sharedWith = file.sharedWith.filter(
            share => !share.userId.equals(targetUserId)
        );
        await file.save();

        // Invalidate cache
        await redis.del(`file-permissions:${fileId}`);

        return true;
    }

    async getFilePermissions(fileId, userId) {
        // Check cache first
        const cacheKey = `file-permissions:${fileId}:${userId}`;
        const cachedPermissions = await redis.get(cacheKey);
        if (cachedPermissions) {
            return JSON.parse(cachedPermissions);
        }

        const file = await File.findById(fileId)
            .populate('sharedWith.permissionId');

        if (!file) throw new Error('File not found');

        let permissions = [];

        // Check if user is owner
        if (file.owner.equals(userId)) {
            permissions = ['read', 'write', 'share', 'delete'];
        } else {
            // Check shared permissions
            const shareInfo = file.sharedWith.find(
                share => share.userId.equals(userId)
            );
            if (shareInfo && shareInfo.permissionId) {
                permissions = shareInfo.permissionId.permissions;
            }
        }

        // Cache permissions for 5 minutes
        await redis.set(cacheKey, JSON.stringify(permissions), 'EX', 300);

        return permissions;
    }

    async _hashPassword(password, salt) {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
                if (err) reject(err);
                resolve(derivedKey.toString('hex') + '.' + salt);
            });
        });
    }
}

module.exports = new SharingService();
