import express from 'express';
import {
  toggleReaction,
  getPostReactions,
} from '../controllers/reactionController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { authActionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/:postId', optionalAuth, getPostReactions);
router.post('/', requireAuth, authActionLimiter, toggleReaction);

export default router;
