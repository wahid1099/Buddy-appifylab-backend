import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Comment must belong to a post'],
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment must have an author']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
commentSchema.index({ post: 1, createdAt: -1 });

// Virtual for likes count
commentSchema.virtual('likesCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'targetId',
  count: true,
  match: { targetType: 'Comment' }
});

// Virtual for replies count
commentSchema.virtual('repliesCount', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'comment',
  count: true
});

// Virtual populate for likes
commentSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'targetId',
  match: { targetType: 'Comment' }
});

// Virtual populate for replies
commentSchema.virtual('replies', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'comment'
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
