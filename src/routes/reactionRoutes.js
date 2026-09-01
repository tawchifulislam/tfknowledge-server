import express from 'express';
import {
  toggleReaction,
  getPostReactions,
} from '../controllers/reactionController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/:postId', getPostReactions);
router.post('/', requireAuth, toggleReaction);

export default router;
