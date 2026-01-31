import express from 'express';
import cors from 'cors';
import deviceRoutes from './routes/deviceRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use('/api', deviceRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
