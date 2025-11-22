import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Like must have a user']
  },
  targetType: {
    type: String,
    required: [true, 'Like must have a target type'],
    enum: ['Post', 'Comment', 'Reply']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Like must have a target ID'],
    refPath: 'targetType'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
likeSchema.index({ targetType: 1, targetId: 1 });

// Unique compound index to prevent duplicate likes
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

export default Like;
