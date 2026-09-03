import express from 'express';
import {
  createTopicRequest,
  getAllTopicRequests,
  getMyTopicRequests,
  updateTopicStatus,
  deleteTopicRequest,
} from '../controllers/topicRequestController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { authActionLimiter } from '../middleware/rateLimiter.js';
import { validateTopicRequest } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getAllTopicRequests);
router.get('/mine', requireAuth, getMyTopicRequests);
router.post(
  '/',
  requireAuth,
  authActionLimiter,
  validateTopicRequest,
  createTopicRequest,
);
router.patch('/:id/status', requireAdmin, updateTopicStatus);
router.delete('/:id', requireAuth, deleteTopicRequest);

export default router;
