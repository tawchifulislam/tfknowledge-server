import express from 'express';
import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { authActionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/:postId', getPostComments);
router.post('/', requireAuth, authActionLimiter, createComment);
router.put('/:id', requireAuth, updateComment);
router.delete('/:id', requireAuth, deleteComment);

export default router;
