import Like from '../models/Like.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Reply from '../models/Reply.js';

/**
 * @desc    Toggle like on a post/comment/reply
 * @route   POST /api/likes
 * @access  Private
 */
export const toggleLike = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.body;

    // Validate targetType
    if (!['Post', 'Comment', 'Reply'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target type. Must be Post, Comment, or Reply'
      });
    }

    // Check if target exists
    let target;
    if (targetType === 'Post') {
      target = await Post.findById(targetId);
    } else if (targetType === 'Comment') {
      target = await Comment.findById(targetId);
    } else if (targetType === 'Reply') {
      target = await Reply.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({
        success: false,
        message: `${targetType} not found`
      });
    }

    // Check if user already liked this target
    const existingLike = await Like.findOne({
      user: req.user.id,
      targetType,
      targetId
    });

    let liked;
    if (existingLike) {
      // Unlike - remove the like
      await existingLike.deleteOne();
      liked = false;
    } else {
      // Like - create new like
      await Like.create({
        user: req.user.id,
        targetType,
        targetId
      });
      liked = true;
    }

    // Get updated likes count
    const likesCount = await Like.countDocuments({ targetType, targetId });

    res.status(200).json({
      success: true,
      message: liked ? 'Liked successfully' : 'Unliked successfully',
      liked,
      likesCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get users who liked a post/comment/reply
 * @route   GET /api/likes/:targetType/:targetId
 * @access  Private
 */
export const getLikes = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;

    // Validate targetType
    if (!['Post', 'Comment', 'Reply'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target type. Must be Post, Comment, or Reply'
      });
    }

    // Check if target exists
    let target;
    if (targetType === 'Post') {
      target = await Post.findById(targetId);
    } else if (targetType === 'Comment') {
      target = await Comment.findById(targetId);
    } else if (targetType === 'Reply') {
      target = await Reply.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({
        success: false,
        message: `${targetType} not found`
      });
    }

    // Get all likes for this target
    const likes = await Like.find({ targetType, targetId })
      .populate('user', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      likes: likes.map(like => ({
        user: like.user,
        createdAt: like.createdAt
      })),
      count: likes.length
    });
  } catch (error) {
    next(error);
  }
};
