const express = require('express');
const router = express.Router();
const SharingService = require('../services/sharing.service');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/:fileId/user', authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params;
        const { userId, permissions } = req.body;

        const share = await SharingService.shareWithUser(
            fileId,
            req.user.id,
            userId,
            permissions
        );

        res.status(201).json(share);
    } catch (error) {
        res.status(500).json({ message: 'Error sharing file', error: error.message });
    }
});

router.post('/:fileId/link', authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params;
        const { expiresAt, password, permissions } = req.body;

        const shareLink = await SharingService.createShareLink(
            fileId,
            req.user.id,
            { expiresAt, password, permissions }
        );

        res.status(201).json(shareLink);
    } catch (error) {
        res.status(500).json({ message: 'Error creating share link', error: error.message });
    }
});

router.delete('/:fileId/link/:token', authMiddleware, async (req, res) => {
    try {
        const { fileId, token } = req.params;

        await SharingService.revokeShareLink(
            fileId,
            req.user.id,
            token
        );

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error revoking share link', error: error.message });
    }
});

router.put('/:fileId/permissions/:userId', authMiddleware, async (req, res) => {
    try {
        const { fileId, userId } = req.params;
        const { permissions } = req.body;

        await SharingService.updatePermissions(
            fileId,
            req.user.id,
            userId,
            permissions
        );

        res.status(200).json({ message: 'Permissions updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating permissions', error: error.message });
    }
});

router.get('/link/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.query;

        const fileAccess = await SharingService.validateShareLink(token, password);
        res.json(fileAccess);
    } catch (error) {
        res.status(401).json({ message: 'Invalid share link', error: error.message });
    }
});

module.exports = router;
