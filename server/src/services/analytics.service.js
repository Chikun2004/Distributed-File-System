const mongoose = require('mongoose');
const File = require('../models/file.model');
const FileAccess = require('../models/fileAccess.model');
const StorageUsage = require('../models/storageUsage.model');
const redis = require('../config/redis');

class AnalyticsService {
    async trackFileAccess(fileId, userId, accessType) {
        await FileAccess.create({
            fileId,
            userId,
            accessType,
            timestamp: new Date()
        });

        // Update cache for real-time analytics
        const cacheKey = `file-access:${fileId}:${new Date().toISOString().split('T')[0]}`;
        await redis.hincrby(cacheKey, accessType, 1);
        await redis.expire(cacheKey, 86400); // Expire after 24 hours
    }

    async getFileAccessStats(fileId, startDate, endDate) {
        const stats = await FileAccess.aggregate([
            {
                $match: {
                    fileId: new mongoose.Types.ObjectId(fileId),
                    timestamp: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                        accessType: '$accessType'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    accesses: {
                        $push: {
                            type: '$_id.accessType',
                            count: '$count'
                        }
                    }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        return this._formatAccessStats(stats);
    }

    async getUserStorageAnalytics(userId) {
        const storageStats = await File.aggregate([
            {
                $match: { owner: new mongoose.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: null,
                    totalSize: { $sum: '$size' },
                    totalFiles: { $sum: 1 },
                    averageFileSize: { $avg: '$size' }
                }
            }
        ]);

        const fileTypeStats = await File.aggregate([
            {
                $match: { owner: new mongoose.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: { $arrayElemAt: [{ $split: ['$name', '.'] }, -1] },
                    count: { $sum: 1 },
                    totalSize: { $sum: '$size' }
                }
            }
        ]);

        return {
            storage: storageStats[0] || { totalSize: 0, totalFiles: 0, averageFileSize: 0 },
            fileTypes: fileTypeStats
        };
    }

    async getCollaborationAnalytics(userId) {
        const sharedStats = await File.aggregate([
            {
                $match: {
                    $or: [
                        { owner: new mongoose.Types.ObjectId(userId) },
                        { 'sharedWith.userId': new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'fileaccesses',
                    localField: '_id',
                    foreignField: 'fileId',
                    as: 'accesses'
                }
            },
            {
                $project: {
                    fileName: '$name',
                    isOwner: { $eq: ['$owner', new mongoose.Types.ObjectId(userId)] },
                    accessCount: { $size: '$accesses' },
                    collaboratorCount: { $size: '$sharedWith' }
                }
            }
        ]);

        return sharedStats;
    }

    async trackStorageUsage(userId) {
        const stats = await File.aggregate([
            {
                $match: { owner: new mongoose.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: null,
                    totalSize: { $sum: '$size' }
                }
            }
        ]);

        await StorageUsage.create({
            userId,
            usageBytes: stats[0]?.totalSize || 0,
            timestamp: new Date()
        });
    }

    async getStorageUsageTrend(userId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await StorageUsage.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                    },
                    usage: { $avg: '$usageBytes' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);
    }

    _formatAccessStats(stats) {
        return stats.map(day => ({
            date: day._id,
            views: day.accesses.find(a => a.type === 'view')?.count || 0,
            downloads: day.accesses.find(a => a.type === 'download')?.count || 0,
            edits: day.accesses.find(a => a.type === 'edit')?.count || 0
        }));
    }
}

module.exports = new AnalyticsService();
