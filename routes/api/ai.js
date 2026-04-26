const express = require('express');
const router = express.Router();
const { aiService } = require('../../services/aiService');
const { auditLogger } = require('../../utils/auditLogger');

router.post('/chat', async (req, res) => {
  try {
    const { prompt, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    auditLogger.info('AI chat request', {
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      userId: req.user?.userId
    });

    const response = await aiService.chatWithAI(prompt, options);

    auditLogger.info('AI chat response', {
      response: response.substring(0, 100) + (response.length > 100 ? '...' : ''),
      userId: req.user?.userId
    });

    res.json({
      success: true,
      data: {
        response
      }
    });
  } catch (error) {
    auditLogger.error('AI chat error', {
      error: error.message,
      userId: req.user?.userId
    });

    res.status(500).json({
      success: false,
      message: 'AI service error: ' + error.message
    });
  }
});

router.post('/stream', async (req, res) => {
  try {
    const { prompt, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await aiService.streamChatWithAI(prompt, options);

    let isAnswering = false;

    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta;
      
      if (delta.reasoning_content) {
        if (!isAnswering) {
          res.write(`event: thinking\ndata: ${JSON.stringify({ content: delta.reasoning_content })}\n\n`);
        }
      }
      
      if (delta.content) {
        if (!isAnswering) {
          isAnswering = true;
        }
        res.write(`event: message\ndata: ${JSON.stringify({ content: delta.content })}\n\n`);
      }
    }

    res.write(`event: done\ndata: ${JSON.stringify({ completed: true })}\n\n`);
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI service error: ' + error.message
    });
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { text, options } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    const analysis = await aiService.analyzeText(text, options);

    res.json({
      success: true,
      data: {
        analysis
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI service error: ' + error.message
    });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { topic, options } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const content = await aiService.generateContent(topic, options);

    res.json({
      success: true,
      data: {
        content
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI service error: ' + error.message
    });
  }
});

router.get('/status', async (req, res) => {
  try {
    const status = aiService.getStatus();
    
    res.json({
      success: true,
      data: {
        status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Status check error: ' + error.message
    });
  }
});

module.exports = router;