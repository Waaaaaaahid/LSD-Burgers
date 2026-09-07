import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((v) => v.trim())
    : true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    service: 'lsd-burgers-api',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health/db', (_req, res) => {
  res.json({
    success: true,
    connected: mongoose.connection.readyState === 1,
  });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LSD API listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
