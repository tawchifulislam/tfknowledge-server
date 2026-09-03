import validator from 'validator';

export const validateComment = (req, res, next) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  if (content.length > 1000) {
    return res
      .status(400)
      .json({ message: 'Comment is too long (max 1000 characters)' });
  }

  req.body.content = validator.escape(content.trim());
  next();
};

export const validateTopicRequest = (req, res, next) => {
  const { title, reason } = req.body;

  if (!title || !title.trim() || !reason || !reason.trim()) {
    return res.status(400).json({ message: 'Title and reason are required' });
  }

  if (title.length > 150) {
    return res
      .status(400)
      .json({ message: 'Title is too long (max 150 characters)' });
  }

  if (reason.length > 500) {
    return res
      .status(400)
      .json({ message: 'Reason is too long (max 500 characters)' });
  }

  req.body.title = validator.escape(title.trim());
  req.body.reason = validator.escape(reason.trim());
  next();
};
