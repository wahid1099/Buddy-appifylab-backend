import Post from '../models/Post.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';
import { uploadToImgBB } from '../utils/imgbbUpload.js';

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res, next) => {
  try {
    const { content, visibility = 'public' } = req.body;

    // Create post object
    const postData = {
      author: req.user.id,
      content,
      visibility
    };

    // Upload image to ImgBB if provided
    if (req.file) {
      try {
        const imageUrl = await uploadToImgBB(req.file.buffer, req.file.originalname);
        postData.image = imageUrl;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadError.message
        });
      }
    }

    const post = await Post.create(postData);

    // Populate author details
    await post.populate('author', 'firstName lastName profileImage');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Get all posts (public + user's private posts)
 * @route   GET /api/posts
 * @access  Private
 */
export const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query: public posts OR user's own posts (including private)
    const query = {
      $or: [
        { visibility: 'public' },
        { author: req.user.id }
      ]
    };

    // Get posts with pagination
    const posts = await Post.find(query)
      .populate('author', 'firstName lastName profileImage')
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    // For each post, get likes count, comments count, and check if current user liked it
    const postsWithDetails = await Promise.all(posts.map(async (post) => {
      const likesCount = await Like.countDocuments({ targetType: 'Post', targetId: post._id });
      const commentsCount = await Comment.countDocuments({ post: post._id });
      const userLiked = await Like.exists({ targetType: 'Post', targetId: post._id, user: req.user.id });

      return {
        ...post,
        likesCount,
        commentsCount,
        isLiked: !!userLiked
      };
    }));

    res.status(200).json({
      success: true,
      posts: postsWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single post by ID
 * @route   GET /api/posts/:id
 * @access  Private
 */
export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName profileImage')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user has access to this post
    if (post.visibility === 'private' && post.author._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this post'
      });
    }

    // Get likes count, comments count, and check if current user liked it
    const likesCount = await Like.countDocuments({ targetType: 'Post', targetId: post._id });
    const commentsCount = await Comment.countDocuments({ post: post._id });
    const userLiked = await Like.exists({ targetType: 'Post', targetId: post._id, user: req.user.id });

    res.status(200).json({
      success: true,
      post: {
        ...post,
        likesCount,
        commentsCount,
        isLiked: !!userLiked
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }

    await post.deleteOne();

    // Also delete associated likes and comments
    await Like.deleteMany({ targetType: 'Post', targetId: post._id });
    await Comment.deleteMany({ post: post._id });

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
