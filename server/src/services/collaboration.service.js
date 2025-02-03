const { Server } = require('socket.io');
const redis = require('../config/redis');
const File = require('../models/file.model');
const CollaborationSession = require('../models/collaborationSession.model');

class CollaborationService {
    constructor() {
        this.activeSessions = new Map();
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL,
                methods: ['GET', 'POST']
            }
        });

        this.io.on('connection', (socket) => {
            this._handleConnection(socket);
        });
    }

    async _handleConnection(socket) {
        socket.on('join-session', async (data) => {
            await this._handleJoinSession(socket, data);
        });

        socket.on('leave-session', async (data) => {
            await this._handleLeaveSession(socket, data);
        });

        socket.on('file-operation', async (data) => {
            await this._handleFileOperation(socket, data);
        });

        socket.on('cursor-move', (data) => {
            this._handleCursorMove(socket, data);
        });

        socket.on('disconnect', () => {
            this._handleDisconnect(socket);
        });
    }

    async _handleJoinSession(socket, { fileId, userId }) {
        const file = await File.findById(fileId);
        if (!file) {
            socket.emit('error', { message: 'File not found' });
            return;
        }

        // Check access permissions
        const hasAccess = await this._checkAccess(fileId, userId);
        if (!hasAccess) {
            socket.emit('error', { message: 'Access denied' });
            return;
        }

        // Create or join session
        let session = this.activeSessions.get(fileId);
        if (!session) {
            session = await this._createSession(fileId);
            this.activeSessions.set(fileId, session);
        }

        // Add user to session
        session.users.set(userId, {
            socketId: socket.id,
            cursor: { line: 0, ch: 0 }
        });

        socket.join(fileId);

        // Send current session state
        socket.emit('session-state', {
            users: Array.from(session.users.keys()),
            content: session.content,
            version: session.version
        });

        // Notify others
        socket.to(fileId).emit('user-joined', { userId });
    }

    async _handleLeaveSession(socket, { fileId, userId }) {
        const session = this.activeSessions.get(fileId);
        if (session) {
            session.users.delete(userId);
            socket.to(fileId).emit('user-left', { userId });

            if (session.users.size === 0) {
                await this._saveSession(session);
                this.activeSessions.delete(fileId);
            }
        }

        socket.leave(fileId);
    }

    async _handleFileOperation(socket, { fileId, operation, userId }) {
        const session = this.activeSessions.get(fileId);
        if (!session) return;

        // Apply operation transformation
        const transformedOp = this._transformOperation(operation, session.operations);
        session.operations.push(transformedOp);
        session.version++;

        // Apply operation to session content
        session.content = this._applyOperation(session.content, transformedOp);

        // Broadcast to others
        socket.to(fileId).emit('operation', {
            operation: transformedOp,
            userId,
            version: session.version
        });

        // Periodically save session
        if (session.operations.length >= 50) {
            await this._saveSession(session);
            session.operations = [];
        }
    }

    _handleCursorMove(socket, { fileId, userId, cursor }) {
        const session = this.activeSessions.get(fileId);
        if (!session) return;

        const userInfo = session.users.get(userId);
        if (userInfo) {
            userInfo.cursor = cursor;
            socket.to(fileId).emit('cursor-update', { userId, cursor });
        }
    }

    async _handleDisconnect(socket) {
        for (const [fileId, session] of this.activeSessions) {
            for (const [userId, userInfo] of session.users) {
                if (userInfo.socketId === socket.id) {
                    await this._handleLeaveSession(socket, { fileId, userId });
                    break;
                }
            }
        }
    }

    async _createSession(fileId) {
        const existingSession = await CollaborationSession.findOne({ fileId });
        return {
            fileId,
            users: new Map(),
            content: existingSession?.content || '',
            version: existingSession?.version || 0,
            operations: []
        };
    }

    async _saveSession(session) {
        await CollaborationSession.findOneAndUpdate(
            { fileId: session.fileId },
            {
                content: session.content,
                version: session.version,
                lastModified: new Date()
            },
            { upsert: true }
        );
    }

    _transformOperation(operation, existingOps) {
        // Implement Operational Transformation logic here
        // This is a simplified version
        return operation;
    }

    _applyOperation(content, operation) {
        // Implement operation application logic here
        // This is a simplified version
        switch (operation.type) {
            case 'insert':
                return content.slice(0, operation.position) +
                       operation.text +
                       content.slice(operation.position);
            case 'delete':
                return content.slice(0, operation.position) +
                       content.slice(operation.position + operation.length);
            default:
                return content;
        }
    }

    async _checkAccess(fileId, userId) {
        const file = await File.findById(fileId)
            .populate('sharedWith');
        return file.owner.equals(userId) ||
               file.sharedWith.some(share => share.userId.equals(userId));
    }
}

module.exports = new CollaborationService();
