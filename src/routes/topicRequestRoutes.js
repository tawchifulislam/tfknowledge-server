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

const router = express.Router();

router.get('/', getAllTopicRequests);
router.get('/mine', requireAuth, getMyTopicRequests);
router.post('/', requireAuth, createTopicRequest);
router.patch('/:id/status', requireAdmin, updateTopicStatus);
router.delete('/:id', requireAuth, deleteTopicRequest);

export default router;
