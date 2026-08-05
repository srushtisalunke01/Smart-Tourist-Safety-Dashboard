const commentService = require('../services/commentService');

class CommentController {
  async getAllComments(req, res, next) {
    try {
      const comments = await commentService.getAllComments();
      res.json(comments);
    } catch (err) {
      next(err);
    }
  }

  async createComment(req, res, next) {
    try {
      const comment = await commentService.createComment({ user: req.user.id, ...req.body });
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  }

  async updateComment(req, res, next) {
    try {
      const comment = await commentService.updateComment(req.params.id, req.body.text);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
      res.json(comment);
    } catch (err) {
      next(err);
    }
  }

  async deleteComment(req, res, next) {
    try {
      await commentService.deleteComment(req.params.id);
      res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CommentController();
