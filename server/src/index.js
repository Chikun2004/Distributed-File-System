require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { rateLimit } = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes');
const shareRoutes = require('./routes/share.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Import middlewares
const { errorHandler, notFound, multerErrorHandler } = require('./middleware/error.middleware');
const { authMiddleware } = require('./middleware/auth.middleware');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', authMiddleware, fileRoutes);
app.use('/api/share', authMiddleware, shareRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
    });

    socket.on('file-change', (data) => {
        socket.to(data.roomId).emit('file-updated', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Error handling
app.use(notFound);
app.use(multerErrorHandler);
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
const server = httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
        httpServer.listen(PORT + 1);
    } else {
        console.error('Server error:', err);
    }
});
