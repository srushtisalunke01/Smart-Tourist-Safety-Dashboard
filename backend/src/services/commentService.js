const commentRepository = require('../repositories/CommentRepository');

class CommentService {
  async getAllComments() {
    return commentRepository.find();
  }

  async getCommentsByPost(postId) {
    return commentRepository.find({ post: postId }, { populate: 'user' });
  }

  async createComment(data) {
    return commentRepository.create(data);
  }

  async updateComment(id, text) {
    return commentRepository.update(id, { text });
  }

  async replyToComment(commentId, userId, userName, text) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) return null;
    comment.replies.push({ user: userId, userName, text, createdAt: new Date() });
    return comment.save();
  }

  async deleteComment(id) {
    return commentRepository.delete(id);
  }
}

module.exports = new CommentService();
