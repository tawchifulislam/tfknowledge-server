import Comment from '../models/Comment.js';

export const createComment = async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;

    const comment = await Comment.create({
      postId,
      content,
      parentCommentId: parentCommentId || null,
      authorId: req.user.id,
      authorName: req.user.name,
      authorImage: req.user.image || null,
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isOwner = comment.authorId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    comment.isDeleted = true;
    comment.content = '';
    await comment.save();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
