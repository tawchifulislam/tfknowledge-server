import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'love', 'insightful', 'curious'],
      default: 'like',
    },
  },
  { timestamps: true },
);

reactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Reaction', reactionSchema);
