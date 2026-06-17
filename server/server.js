import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import goalRoutes from './routes/goalRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/goals', goalRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', database: mongoose.connection.readyState === 1 ? 'connected' : 'offline' });
});

// ── Serve React frontend in production ──────────────────────────────────────
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
});

// ── Start server immediately (don't wait for DB) ────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 MentorAI server running on port ${PORT}`);
});

// ── MongoDB: connect in background (optional) ────────────────────────────────
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('✅ Connected to MongoDB'))
        .catch((err) => console.warn('⚠️ MongoDB unavailable — running in offline mode:', err.message));
} else {
    console.log('ℹ️  No MONGO_URI set — running in offline/localStorage mode');
}
