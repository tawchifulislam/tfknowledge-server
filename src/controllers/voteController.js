import Vote from '../models/Vote.js';
import TopicRequest from '../models/TopicRequest.js';

const recalculateScore = async topicRequestId => {
  const votes = await Vote.find({ topicRequestId });
  const score = votes.reduce((sum, v) => sum + v.value, 0);
  await TopicRequest.findByIdAndUpdate(topicRequestId, { voteScore: score });
  return score;
};

export const castVote = async (req, res) => {
  try {
    const { topicRequestId, value } = req.body;
    const userId = req.user.id;

    const existing = await Vote.findOne({ topicRequestId, userId });

    if (!existing) {
      await Vote.create({ topicRequestId, userId, value });
    } else if (existing.value === value) {
      await existing.deleteOne();
    } else {
      existing.value = value;
      await existing.save();
    }

    const voteScore = await recalculateScore(topicRequestId);
    res.json({ voteScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserVote = async (req, res) => {
  try {
    const { topicRequestId } = req.params;
    const userId = req.user.id;

    const vote = await Vote.findOne({ topicRequestId, userId });
    res.json({ value: vote ? vote.value : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
