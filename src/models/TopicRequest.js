import mongoose from 'mongoose';

const topicRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'written'],
      default: 'pending',
    },
    voteScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model('TopicRequest', topicRequestSchema);
