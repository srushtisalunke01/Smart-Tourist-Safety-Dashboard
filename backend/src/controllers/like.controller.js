const likeService = require('../services/likeService');

class LikeController {
  async getAllLikes(req, res, next) {
    try {
      const likes = await likeService.getAllLikes();
      res.json(likes);
    } catch (err) {
      next(err);
    }
  }

  async toggleLike(req, res, next) {
    try {
      const result = await likeService.toggleLike(req.user.id, req.body.postId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LikeController();
