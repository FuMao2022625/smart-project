const configManager = require('../config/configManager');

class AIService {
  constructor() {
    this.openai = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      const OpenAI = require('openai');
      
      this.openai = new OpenAI({
        apiKey: configManager.get('ai.apiKey', 'sk-6607a35e69d243749e6769768fc24882'),
        baseURL: configManager.get('ai.baseURL', 'https://dashscope.aliyuncs.com/compatible-mode/v1')
      });
      
      this.isInitialized = true;
      console.log('AI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Service:', error.message);
      this.isInitialized = false;
    }
  }

  async chatWithAI(prompt, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isInitialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      const messages = [
        {
          role: 'system',
          content: options.systemPrompt || '你是一个智能助手，提供专业、准确的回答。'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await this.openai.chat.completions.create({
        model: options.model || 'qwen3.6-plus',
        messages,
        stream: options.stream || false,
        enable_thinking: options.enableThinking || true,
        temperature: options.temperature || 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  }

  async streamChatWithAI(prompt, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isInitialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      const messages = [
        {
          role: 'system',
          content: options.systemPrompt || '你是一个智能助手，提供专业、准确的回答。'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const stream = await this.openai.chat.completions.create({
        model: options.model || 'qwen3.6-plus',
        messages,
        stream: true,
        enable_thinking: options.enableThinking || true,
        temperature: options.temperature || 0.7
      });

      return stream;
    } catch (error) {
      console.error('AI stream chat error:', error);
      throw error;
    }
  }

  async analyzeText(text, options = {}) {
    const prompt = `请分析以下文本，并提供${options.analysisType || '情感分析、关键词提取和摘要'}：\n\n${text}`;
    return this.chatWithAI(prompt, options);
  }

  async generateContent(topic, options = {}) {
    const prompt = `请围绕"${topic}"生成${options.contentType || '详细、专业的内容'}，${options.requirement || '确保内容准确、有深度'}`;
    return this.chatWithAI(prompt, options);
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      ready: this.openai !== null
    };
  }
}

const aiService = new AIService();

module.exports = {
  AIService,
  aiService
};