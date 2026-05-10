import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

import expertRoutes from './routes/experts.js';
import bookingRoutes from './routes/bookings.js';
import authRoutes from './routes/auth.js';
import reviewRoutes from './routes/reviews.js';
import waitlistRoutes from './routes/waitlist.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173'
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH']
  }
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/auth', authRoutes);
app.use('/experts', expertRoutes);
app.use('/bookings', bookingRoutes);
app.use('/reviews', reviewRoutes);
app.use('/waitlist', waitlistRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => {
    const isAtlas = MONGO_URI.includes('mongodb+srv') || MONGO_URI.includes('mongodb.net');
    console.log(`MongoDB connected (${isAtlas ? 'Atlas Cloud' : 'Local'})`);
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    if (err.message.includes('ENOTFOUND') || err.message.includes('failed to connect')) {
      console.error('Hint: Check your MongoDB Atlas connection string, network access (IP whitelist), and credentials.');
    }
    process.exit(1);
  });
