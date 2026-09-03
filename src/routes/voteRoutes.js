import express from 'express';
import { castVote, getUserVote } from '../controllers/voteController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { authActionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/:topicRequestId', requireAuth, getUserVote);
router.post('/', requireAuth, authActionLimiter, castVote);

export default router;
