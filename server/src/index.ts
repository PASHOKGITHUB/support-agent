import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const clientUrls = (process.env.CLIENT_URL || '').split(',').map(url => url.trim());
const allowedOrigins = [
  ...clientUrls,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // Dynamically allow any origin and echo it back.
    // This allows credentials/cookies for the main admin console,
    // and also allows the public widget to be embedded on any external client website.
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Health Check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

