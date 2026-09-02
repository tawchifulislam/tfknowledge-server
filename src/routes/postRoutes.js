import express from 'express';
import {
  createPost,
  getAllPosts,
  getAllPostsForAdmin,
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/admin/all', requireAdmin, getAllPostsForAdmin);
router.get('/admin/:id', requireAdmin, getPostById);
router.get('/:slug', getPostBySlug);
router.post('/', requireAdmin, createPost);
router.put('/:id', requireAdmin, updatePost);
router.delete('/:id', requireAdmin, deletePost);

export default router;
