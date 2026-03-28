import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import goalRoutes from './routes/goalRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mentorai_db';

// Middleware
app.use(cors());
app.use(express.json());

// Future routes
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/goals', goalRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Database Connection
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB via Mongoose');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
