import express from 'express';
import {
  toggleReaction,
  getPostReactions,
} from '../controllers/reactionController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = express.Router();

router.get('/:postId', optionalAuth, getPostReactions);
router.post('/', requireAuth, toggleReaction);

export default router;
