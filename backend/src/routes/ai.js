const express = require('express');
const router = express.Router();
const AIService = require('../services/ai.service');

router.post('/chat', async (req, res) => {
  try {
    const reply = await AIService.getChatResponse(req.body.message);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
