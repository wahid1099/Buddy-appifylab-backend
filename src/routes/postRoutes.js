import express from 'express';
import { createPost, getPosts, getPost, deletePost } from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { createPostValidation, validate } from '../utils/validators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Post routes
router.post('/', upload.single('image'), createPostValidation, validate, createPost);
router.get('/', getPosts);
router.get('/:id', getPost);
router.delete('/:id', deletePost);

export default router;
