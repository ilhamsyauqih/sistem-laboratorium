import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
// Increase limit to 10MB for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Simple logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Helper to wrap Vercel-style async handlers
const wrap = (handler) => async (req, res) => {
    try {
        // Vercel puts params in query - override the getter to make it writable
        const mergedQuery = { ...req.query, ...req.params };
        Object.defineProperty(req, 'query', {
            value: mergedQuery,
            writable: true,
            enumerable: true,
            configurable: true
        });
        await handler(req, res);
    } catch (err) {
        console.error('Handler error:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal Server Error: ' + err.message });
        }
    }
};

// Import Handlers
// Note: We need absolute paths or correct relative paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// We need to dynamically import the handlers
const importHandler = async (relativePath) => {
    const module = await import(relativePath);
    return module.default;
};

// Define Routes matching file structure
// /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    const handler = await importHandler('./api/auth/login.js');
    wrap(handler)(req, res);
});

app.post('/api/auth/register', async (req, res) => {
    const handler = await importHandler('./api/auth/register.js');
    wrap(handler)(req, res);
});

// /api/alat
app.use('/api/alat', async (req, res, next) => {
    // Middleware to decide which handler to use based on path length/params?
    // Express routing is easier.
    next();
});

app.get('/api/alat', async (req, res) => {
    const handler = await importHandler('./api/alat.js');
    wrap(handler)(req, res);
});
app.post('/api/alat', async (req, res) => {
    const handler = await importHandler('./api/alat.js');
    wrap(handler)(req, res);
});

// Handle OPTIONS for CORS preflight
app.options('/api/alat/:id', (req, res) => {
    res.status(200).end();
});

app.put('/api/alat/:id', async (req, res) => {
    const handler = await importHandler('./api/alat/[id].js');
    wrap(handler)(req, res);
});
app.delete('/api/alat/:id', async (req, res) => {
    const handler = await importHandler('./api/alat/[id].js');
    wrap(handler)(req, res);
});

// /api/peminjaman
app.get('/api/peminjaman', async (req, res) => {
    const handler = await importHandler('./api/peminjaman.js');
    wrap(handler)(req, res);
});
app.post('/api/peminjaman', async (req, res) => {
    const handler = await importHandler('./api/peminjaman.js');
    wrap(handler)(req, res);
});
app.put('/api/peminjaman/:id', async (req, res) => {
    const handler = await importHandler('./api/peminjaman/[id].js');
    wrap(handler)(req, res);
});

// /api/dashboard
app.get('/api/dashboard', async (req, res) => {
    const handler = await importHandler('./api/dashboard.js');
    wrap(handler)(req, res);
});

// /api/ai-recommendation
app.post('/api/ai-recommendation', async (req, res) => {
    const handler = await importHandler('./api/ai-recommendation.js');
    wrap(handler)(req, res);
});

app.listen(PORT, () => {
    console.log(`Local API Server running on http://localhost:${PORT}`);
});
