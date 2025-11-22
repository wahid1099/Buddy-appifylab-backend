import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: [true, 'Reply must belong to a comment'],
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reply must have an author']
  },
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    trim: true,
    maxlength: [2000, 'Reply cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
replySchema.index({ comment: 1, createdAt: -1 });

// Virtual for likes count
replySchema.virtual('likesCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'targetId',
  count: true,
  match: { targetType: 'Reply' }
});

// Virtual populate for likes
replySchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'targetId',
  match: { targetType: 'Reply' }
});

const Reply = mongoose.model('Reply', replySchema);

export default Reply;
