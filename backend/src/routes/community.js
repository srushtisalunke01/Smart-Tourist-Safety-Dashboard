const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const { authenticateToken } = require('../middlewares/auth');
const { getIO } = require('../config/socket');

// Helper to populate post author user info
const populatePost = (query) => {
  return query.populate('user', 'name role');
};

// --- GET ALL POSTS ---
const getAllPosts = async (req, res) => {
  try {
    const posts = await populatePost(CommunityPost.find())
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
router.get('/', getAllPosts);
router.get('/posts', getAllPosts);

// --- GET SINGLE POST ---
const getSinglePost = async (req, res) => {
  try {
    const post = await populatePost(CommunityPost.findById(req.params.id));
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
router.get('/:id', getSinglePost);
router.get('/posts/:id', getSinglePost);

// --- CREATE POST ---
const createPost = async (req, res) => {
  console.log('[Controller] createPost execution started');
  const { title, content, location, safetyRating, experienceRating, imageUrl } = req.body;
  
  if (!title || !content || !location || !safetyRating) {
    console.log('[Controller] createPost validation failed: Missing required fields');
    return res.status(400).json({ message: 'Missing required post fields: title, content, location, safetyRating' });
  }

  try {
    const post = new CommunityPost({
      user: req.user.id,
      title,
      content,
      location,
      safetyRating: Number(safetyRating),
      experienceRating: experienceRating ? Number(experienceRating) : undefined,
      imageUrl
    });
    
    console.log('[Database] Attempting to save new CommunityPost to MongoDB...');
    await post.save();
    console.log(`[Database] CommunityPost successfully saved. ID: ${post._id}`);
    
    // Populate before returning and emitting
    const populated = await populatePost(CommunityPost.findById(post._id));

    // Socket broadcast
    const io = getIO();
    if (io) {
      io.emit('community_post_created', populated);
      console.log('[Socket] Emitted community_post_created');
    }

    console.log('[Response] Sending 201 Created');
    res.status(201).json(populated);
  } catch (error) {
    console.error('[Error] createPost failed:', error.message);
    res.status(500).json({ message: error.message });
  }
};
router.post('/', authenticateToken, createPost);
router.post('/posts', authenticateToken, createPost);

// --- UPDATE POST ---
const updatePost = async (req, res) => {
  const { title, content, location, safetyRating, experienceRating, imageUrl } = req.body;
  try {
    let post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Authorization: User must be the author of the post to edit it
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You can only edit your own posts' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.location = location || post.location;
    post.safetyRating = safetyRating !== undefined ? Number(safetyRating) : post.safetyRating;
    post.experienceRating = experienceRating !== undefined ? Number(experienceRating) : post.experienceRating;
    post.imageUrl = imageUrl !== undefined ? imageUrl : post.imageUrl;

    await post.save();
    const populated = await populatePost(CommunityPost.findById(post._id));

    // Socket broadcast
    const io = getIO();
    if (io) {
      io.emit('community_post_updated', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
router.put('/:id', authenticateToken, updatePost);
router.put('/posts/:id', authenticateToken, updatePost);

// --- DELETE POST ---
const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Authorization: User must be the author OR an admin
    const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';
    if (post.user.toString() !== req.user.id && !isAdmin) {
      return res.status(403).json({ message: 'Access denied: You can only delete your own posts' });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);

    // Socket broadcast
    const io = getIO();
    if (io) {
      io.emit('community_post_deleted', req.params.id);
    }

    res.json({ message: 'Post deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
router.delete('/:id', authenticateToken, deletePost);
router.delete('/posts/:id', authenticateToken, deletePost);

// --- LIKE POST ---
const likePostRoute = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.likes += 1;
    await post.save();

    // Socket broadcast
    const io = getIO();
    if (io) {
      io.emit('community_post_liked', { postId: post._id, likes: post.likes });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
router.post('/:id/like', authenticateToken, likePostRoute);
router.post('/posts/:id/like', authenticateToken, likePostRoute);

// --- COMMENT ON POST ---
const commentPostRoute = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.comments.push({
      user: req.user.id,
      text,
      userName: req.user.name,
      createdAt: new Date()
    });
    
    await post.save();

    // Socket broadcast
    const io = getIO();
    if (io) {
      io.emit('community_post_commented', { postId: post._id, comments: post.comments });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
router.post('/:id/comment', authenticateToken, commentPostRoute);
router.post('/posts/:id/comment', authenticateToken, commentPostRoute);

module.exports = router;

