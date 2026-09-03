import express from 'express';
import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { authActionLimiter } from '../middleware/rateLimiter.js';
import { validateComment } from '../middleware/validate.js';

const router = express.Router();

router.get('/:postId', getPostComments);
router.post(
  '/',
  requireAuth,
  authActionLimiter,
  validateComment,
  createComment,
);
router.put('/:id', requireAuth, validateComment, updateComment);
router.delete('/:id', requireAuth, deleteComment);

export default router;
