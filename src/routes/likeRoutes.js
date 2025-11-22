import express from 'express';
import { toggleLike, getLikes } from '../controllers/likeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Like routes
router.post('/', toggleLike);
router.get('/:targetType/:targetId', getLikes);

export default router;
