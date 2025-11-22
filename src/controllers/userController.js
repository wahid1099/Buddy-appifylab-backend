import User from '../models/User.js';
import Post from '../models/Post.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'firstName lastName profileImage')
      .populate('following', 'firstName lastName profileImage');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get post count
    const postCount = await Post.countDocuments({ author: user._id });

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        postCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is updating their own profile
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const { firstName, lastName, bio } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;

    // Handle image uploads if present
    if (req.files) {
      if (req.files.profileImage) {
        updateData.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
      }
      if (req.files.coverImage) {
        updateData.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: id })
      .populate('author', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: id });

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user posts',
      error: error.message
    });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const { id } = req.params; // User to follow
    const currentUserId = req.user.id;

    if (id === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already following
    if (currentUser.following.includes(id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Add to following list
    currentUser.following.push(id);
    await currentUser.save();

    // Add to followers list
    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error following user',
      error: error.message
    });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params; // User to unfollow
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const userToUnfollow = await User.findById(id);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(
      followingId => followingId.toString() !== id
    );
    await currentUser.save();

    // Remove from followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
      followerId => followerId.toString() !== currentUserId
    );
    await userToUnfollow.save();

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unfollowing user',
      error: error.message
    });
  }
};

// Get followers list
export const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(id)
      .populate({
        path: 'followers',
        select: 'firstName lastName profileImage bio',
        options: {
          skip,
          limit
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const total = user.followers.length;

    res.status(200).json({
      success: true,
      followers: user.followers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching followers',
      error: error.message
    });
  }
};

// Get following list
export const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(id)
      .populate({
        path: 'following',
        select: 'firstName lastName profileImage bio',
        options: {
          skip,
          limit
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const total = user.following.length;

    res.status(200).json({
      success: true,
      following: user.following,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching following',
      error: error.message
    });
  }
};
