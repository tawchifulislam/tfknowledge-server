import Reaction from '../models/Reaction.js';

export const toggleReaction = async (req, res) => {
  try {
    const { postId, type } = req.body;
    const userId = req.user.id;

    const existing = await Reaction.findOne({ postId, userId });

    if (!existing) {
      const reaction = await Reaction.create({ postId, userId, type });
      return res.status(201).json({ action: 'added', reaction });
    }

    if (existing.type === type) {
      await existing.deleteOne();
      return res.json({ action: 'removed' });
    }

    existing.type = type;
    await existing.save();
    return res.json({ action: 'updated', reaction: existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostReactions = async (req, res) => {
  try {
    const { postId } = req.params;

    const reactions = await Reaction.find({ postId });

    const counts = reactions.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    let userReaction = null;
    if (req.user) {
      const mine = reactions.find(r => r.userId.toString() === req.user.id);
      userReaction = mine ? mine.type : null;
    }

    res.json({ counts, total: reactions.length, userReaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
