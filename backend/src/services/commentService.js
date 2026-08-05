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

  async deleteComment(id) {
    return commentRepository.delete(id);
  }
}

module.exports = new CommentService();
