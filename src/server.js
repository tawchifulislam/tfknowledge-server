import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { connectDB } from './config/db.js';
import { auth } from './lib/auth.js';

const startServer = async () => {
  await connectDB();

  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.all('/api/auth/*splat', toNodeHandler(auth));

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
