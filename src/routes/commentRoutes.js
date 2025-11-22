import express from 'express';
import { createComment, getComments, createReply, getReplies } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { createCommentValidation, createReplyValidation, validate } from '../utils/validators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Comment routes
router.post('/', createCommentValidation, validate, createComment);
router.get('/:postId', getComments);

// Reply routes
router.post('/:commentId/reply', createReplyValidation, validate, createReply);
router.get('/:commentId/replies', getReplies);

export default router;
