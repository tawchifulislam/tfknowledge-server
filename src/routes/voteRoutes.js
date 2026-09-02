import express from 'express';
import { castVote, getUserVote } from '../controllers/voteController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/:topicRequestId', requireAuth, getUserVote);
router.post('/', requireAuth, castVote);

export default router;
