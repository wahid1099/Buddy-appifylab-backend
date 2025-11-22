import express from 'express';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} from '../controllers/userController.js';

const router = express.Router();

// Public routes
router.get('/:id', getUserProfile);
router.get('/:id/posts', getUserPosts);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes
router.put('/:id', protect, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), updateUserProfile);

router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);

export default router;
