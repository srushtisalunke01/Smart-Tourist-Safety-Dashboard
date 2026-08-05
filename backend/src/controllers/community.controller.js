const communityService = require('../services/communityService');
const commentService = require('../services/commentService');
const likeService = require('../services/likeService');
const { getIO } = require('../config/socket');

class CommunityController {
  async getAllPosts(req, res, next) {
    try {
      const { search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10, location } = req.query;

      // Filtering & Searching logic
      const filter = {};
      if (location) filter.location = new RegExp(location, 'i');
      if (search) {
        filter.$or = [
          { title: new RegExp(search, 'i') },
          { content: new RegExp(search, 'i') },
          { location: new RegExp(search, 'i') }
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;

      const skip = (Number(page) - 1) * Number(limit);

      const posts = await communityService.getAllPosts({
        populate: { path: 'user', select: 'name role' },
        sort: sortOptions,
        limit: Number(limit),
        skip: skip
      });

      res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  async getPostById(req, res, next) {
    try {
      const post = await communityService.getPostById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      res.json(post);
    } catch (err) {
      next(err);
    }
  }

  async createPost(req, res, next) {
    try {
      const { title, content, location, safetyRating, experienceRating, imageUrl } = req.body;
      const post = await communityService.createPost({
        user: req.user.id,
        title,
        content,
        location,
        safetyRating: Number(safetyRating),
        experienceRating: experienceRating ? Number(experienceRating) : undefined,
        imageUrl
      });

      const populated = await communityService.getPostById(post._id);

      const io = getIO();
      if (io) io.emit('community_post_created', populated);

      res.status(201).json(populated);
    } catch (err) {
      next(err);
    }
  }

  async updatePost(req, res, next) {
    try {
      const post = await communityService.getPostById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      if (post.user._id.toString() !== req.user.id && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Access denied: You can only edit your own posts' });
      }

      const updated = await communityService.updatePost(req.params.id, req.body);
      const populated = await communityService.getPostById(updated._id);

      const io = getIO();
      if (io) io.emit('community_post_updated', populated);

      res.json(populated);
    } catch (err) {
      next(err);
    }
  }

  async deletePost(req, res, next) {
    try {
      const post = await communityService.getPostById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      if (post.user._id.toString() !== req.user.id && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Access denied: You can only delete your own posts' });
      }

      await communityService.deletePost(req.params.id);

      const io = getIO();
      if (io) io.emit('community_post_deleted', req.params.id);

      res.json({ message: 'Post deleted successfully', id: req.params.id });
    } catch (err) {
      next(err);
    }
  }

  async likePost(req, res, next) {
    try {
      const result = await likeService.toggleLike(req.user.id, req.params.id);
      const likesCount = await likeService.getLikesByPost(req.params.id);
      
      const post = await communityService.getPostById(req.params.id);
      post.likes = likesCount.length;
      await post.save();

      const io = getIO();
      if (io) io.emit('community_post_liked', { postId: req.params.id, likes: post.likes });

      res.json(post);
    } catch (err) {
      next(err);
    }
  }

  async commentOnPost(req, res, next) {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ message: 'Comment text is required' });

      const comment = await commentService.createComment({
        user: req.user.id,
        post: req.params.id,
        text,
        userName: req.user.name
      });

      const post = await communityService.getPostById(req.params.id);
      post.comments.push({
        user: req.user.id,
        text,
        userName: req.user.name,
        createdAt: comment.createdAt
      });
      await post.save();

      const io = getIO();
      if (io) io.emit('community_post_commented', { postId: req.params.id, comments: post.comments });

      res.json(post);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CommunityController();
