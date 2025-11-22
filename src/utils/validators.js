import { body, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

/**
 * Validation rules for creating a post
 */
export const createPostValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Post content is required')
    .isLength({ max: 5000 }).withMessage('Post content cannot exceed 5000 characters'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private']).withMessage('Visibility must be either public or private')
];

/**
 * Validation rules for creating a comment
 */
export const createCommentValidation = [
  body('postId')
    .notEmpty().withMessage('Post ID is required')
    .isMongoId().withMessage('Invalid post ID'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Comment content is required')
    .isLength({ max: 2000 }).withMessage('Comment cannot exceed 2000 characters')
];

/**
 * Validation rules for creating a reply
 */
export const createReplyValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Reply content is required')
    .isLength({ max: 2000 }).withMessage('Reply cannot exceed 2000 characters')
];
