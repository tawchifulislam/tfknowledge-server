import TopicRequest from '../models/TopicRequest.js';

export const createTopicRequest = async (req, res) => {
  try {
    const { title, reason } = req.body;

    const topic = await TopicRequest.create({
      title,
      reason,
      requestedBy: req.user.id,
      requestedByName: req.user.name,
    });

    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTopicRequests = async (req, res) => {
  try {
    const topics = await TopicRequest.find().sort({
      voteScore: -1,
      createdAt: -1,
    });

    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTopicRequests = async (req, res) => {
  try {
    const topics = await TopicRequest.find({
      requestedBy: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTopicStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const topic = await TopicRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!topic) {
      return res.status(404).json({ message: 'Topic request not found' });
    }

    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTopicRequest = async (req, res) => {
  try {
    const topic = await TopicRequest.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic request not found' });
    }

    const isOwner = topic.requestedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await topic.deleteOne();
    res.json({ message: 'Topic request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
