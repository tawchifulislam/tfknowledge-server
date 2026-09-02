import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema(
  {
    topicRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TopicRequest',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    value: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  { timestamps: true },
);

voteSchema.index({ topicRequestId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);
