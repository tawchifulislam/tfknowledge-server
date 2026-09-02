import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { connectDB } from './config/db.js';
import { getAuth } from './lib/auth.js';
import postRoutes from './routes/postRoutes.js';
import reactionRoutes from './routes/reactionRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import topicRequestRoutes from './routes/topicRequestRoutes.js';
import voteRoutes from './routes/voteRoutes.js';

const startServer = async () => {
  await connectDB();

  const auth = getAuth();
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.all('/api/auth/*splat', toNodeHandler(auth));

  app.use(express.json());

  app.use('/api/posts', postRoutes);
  app.use('/api/reactions', reactionRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/topic-requests', topicRequestRoutes);
  app.use('/api/votes', voteRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
