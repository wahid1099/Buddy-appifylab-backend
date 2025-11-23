import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerValidation, loginValidation, validate } from '../utils/validators.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);

// Logout endpoint (client-side token removal, but endpoint for consistency)
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Protected routes
router.get('/me', protect, getMe);

export default router;
