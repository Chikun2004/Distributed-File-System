const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analytics.service');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/storage', authMiddleware, async (req, res) => {
    try {
        const stats = await AnalyticsService.getUserStorageAnalytics(req.user.id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching storage analytics', error: error.message });
    }
});

router.get('/file/:fileId', authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params;
        const { startDate, endDate } = req.query;

        const stats = await AnalyticsService.getFileAccessStats(
            fileId,
            new Date(startDate),
            new Date(endDate)
        );

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching file analytics', error: error.message });
    }
});

router.get('/collaboration', authMiddleware, async (req, res) => {
    try {
        const stats = await AnalyticsService.getCollaborationAnalytics(req.user.id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching collaboration analytics', error: error.message });
    }
});

router.get('/storage/trend', authMiddleware, async (req, res) => {
    try {
        const { days } = req.query;
        const trend = await AnalyticsService.getStorageUsageTrend(req.user.id, parseInt(days));
        res.json(trend);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching storage trend', error: error.message });
    }
});

module.exports = router;
