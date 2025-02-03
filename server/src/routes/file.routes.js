const express = require('express');
const router = express.Router();
const multer = require('multer');
const FileService = require('../services/file.service');
const { authMiddleware } = require('../middleware/auth.middleware');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB default
    }
});

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { file } = req;
        const { parentFolderId } = req.body;

        if (!file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        const fileStream = Buffer.from(file.buffer);
        const fileId = await FileService.uploadFile(
            fileStream,
            file.originalname,
            file.size,
            req.user.id,
            parentFolderId
        );

        res.status(201).json({ fileId });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
});

router.get('/download/:fileId', authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params;
        const { stream, fileName } = await FileService.downloadFile(fileId, req.user.id);

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        stream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: 'Error downloading file', error: error.message });
    }
});

router.post('/folder', authMiddleware, async (req, res) => {
    try {
        const { name, parentFolderId } = req.body;

        const folder = await FileService.createFolder(
            name,
            req.user.id,
            parentFolderId
        );

        res.status(201).json(folder);
    } catch (error) {
        res.status(500).json({ message: 'Error creating folder', error: error.message });
    }
});

router.get('/list', authMiddleware, async (req, res) => {
    try {
        const { folderId } = req.query;
        const files = await FileService.listFiles(req.user.id, folderId);
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'Error listing files', error: error.message });
    }
});

router.delete('/:fileId', authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params;
        await FileService.deleteFile(fileId, req.user.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
});

module.exports = router;
