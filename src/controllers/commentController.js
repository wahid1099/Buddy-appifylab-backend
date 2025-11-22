import Comment from '../models/Comment.js';
import Reply from '../models/Reply.js';
import Post from '../models/Post.js';
import Like from '../models/Like.js';

/**
 * @desc    Create a comment on a post
 * @route   POST /api/comments
 * @access  Private
 */
export const createComment = async (req, res, next) => {
  try {
    const { postId, content } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user has access to this post
    if (post.visibility === 'private' && post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this post'
      });
    }

    // Create comment
    const comment = await Comment.create({
      post: postId,
      author: req.user.id,
      content
    });

    // Populate author details
    await comment.populate('author', 'firstName lastName profileImage');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comments for a post
 * @route   GET /api/comments/:postId
 * @access  Private
 */
export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if post exists and user has access
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.visibility === 'private' && post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this post'
      });
    }

    // Get comments
    const comments = await Comment.find({ post: postId })
      .populate('author', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments({ post: postId });

    // For each comment, get likes count, replies count, and check if current user liked it
    const commentsWithDetails = await Promise.all(comments.map(async (comment) => {
      const likesCount = await Like.countDocuments({ targetType: 'Comment', targetId: comment._id });
      const repliesCount = await Reply.countDocuments({ comment: comment._id });
      const userLiked = await Like.exists({ targetType: 'Comment', targetId: comment._id, user: req.user.id });

      return {
        ...comment,
        likesCount,
        repliesCount,
        isLiked: !!userLiked
      };
    }));

    res.status(200).json({
      success: true,
      comments: commentsWithDetails,
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
 * @desc    Create a reply to a comment
 * @route   POST /api/comments/:commentId/reply
 * @access  Private
 */
export const createReply = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Check if comment exists
    const comment = await Comment.findById(commentId).populate('post');
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user has access to the post
    const post = comment.post;
    if (post.visibility === 'private' && post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this post'
      });
    }

    // Create reply
    const reply = await Reply.create({
      comment: commentId,
      author: req.user.id,
      content
    });

    // Populate author details
    await reply.populate('author', 'firstName lastName profileImage');

    res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      reply
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get replies for a comment
 * @route   GET /api/comments/:commentId/replies
 * @access  Private
 */
export const getReplies = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if comment exists
    const comment = await Comment.findById(commentId).populate('post');
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user has access to the post
    const post = comment.post;
    if (post.visibility === 'private' && post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this post'
      });
    }

    // Get replies
    const replies = await Reply.find({ comment: commentId })
      .populate('author', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Reply.countDocuments({ comment: commentId });

    // For each reply, get likes count and check if current user liked it
    const repliesWithDetails = await Promise.all(replies.map(async (reply) => {
      const likesCount = await Like.countDocuments({ targetType: 'Reply', targetId: reply._id });
      const userLiked = await Like.exists({ targetType: 'Reply', targetId: reply._id, user: req.user.id });

      return {
        ...reply,
        likesCount,
        isLiked: !!userLiked
      };
    }));

    res.status(200).json({
      success: true,
      replies: repliesWithDetails,
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
