const likeRepository = require('../repositories/LikeRepository');

class LikeService {
  async getAllLikes() {
    return likeRepository.find();
  }

  async getLikesByPost(postId) {
    return likeRepository.find({ post: postId });
  }

  async toggleLike(userId, postId) {
    const existing = await likeRepository.findOne({ user: userId, post: postId });
    if (existing) {
      await likeRepository.delete(existing._id);
      return { liked: false };
    } else {
      await likeRepository.create({ user: userId, post: postId });
      return { liked: true };
    }
  }

  async deleteLike(id) {
    return likeRepository.delete(id);
  }
}

module.exports = new LikeService();

