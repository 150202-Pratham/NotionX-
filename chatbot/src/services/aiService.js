const axios = require('axios');
const logger = require('../utils/logger');

/**
 * AI Service for Ollama integration
 * Handles LLM inference and embedding generation
 */
class AIService {
  constructor() {
    this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'qwen3:0.6b';
    this.embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
    this.timeout = parseInt(process.env.OLLAMA_REQUEST_TIMEOUT || '60000');
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
    });
  }

  /**
   * Check if Ollama service is available
   * @returns {Promise<boolean>} True if available
   */
  async isHealthy() {
    try {
      const response = await this.client.get('/api/tags');
      return response.status === 200;
    } catch (error) {
      logger.warn('Ollama health check failed:', error.message);
      return false;
    }
  }

  /**
   * Generate embedding for text using Ollama
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} Embedding vector
   */
  async generateEmbedding(text) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid text for embedding');
      }

      const response = await this.client.post('/api/embeddings', {
        model: this.embeddingModel,
        prompt: text,
      });

      if (!response.data.embedding || !Array.isArray(response.data.embedding)) {
        throw new Error('Invalid embedding response');
      }

      return response.data.embedding;
    } catch (error) {
      logger.error('Embedding generation failed:', {
        error: error.message,
        text: text.substring(0, 100),
      });
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts
   * @param {string[]} texts - Array of texts
   * @returns {Promise<number[][]>} Array of embeddings
   */
  async generateBatchEmbeddings(texts) {
    try {
      const embeddings = [];
      for (const text of texts) {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      }
      return embeddings;
    } catch (error) {
      logger.error('Batch embedding generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate response from Ollama with context
   * @param {string} prompt - Full prompt with context
   * @returns {Promise<string>} Generated response
   */
  async generateResponse(prompt) {
    try {
      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Invalid prompt');
      }

      const response = await this.client.post(
        '/api/generate',
        {
          model: this.model,
          prompt: prompt,
          stream: false,
        },
        {
          timeout: this.timeout,
        },
      );

      if (!response.data.response) {
        throw new Error('Empty response from model');
      }

      return response.data.response.trim();
    } catch (error) {
      logger.error('Response generation failed:', {
        error: error.message,
        promptLength: prompt ? prompt.length : 0,
      });
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Stream response from Ollama
   * @param {string} prompt - Prompt text
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<string>} Full response
   */
  async generateResponseStream(prompt, onChunk) {
    try {
      let fullResponse = '';
      const response = await this.client.post('/api/generate', {
        model: this.model,
        prompt: prompt,
        stream: true,
      });

      // For non-streaming API, return regular response
      if (response.data.response) {
        fullResponse = response.data.response;
        if (onChunk) {
          onChunk(fullResponse);
        }
      }

      return fullResponse;
    } catch (error) {
      logger.error('Stream response generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Get available models from Ollama
   * @returns {Promise<Object>} Models list
   */
  async getAvailableModels() {
    try {
      const response = await this.client.get('/api/tags');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch models:', error.message);
      throw error;
    }
  }

  /**
   * Get model information
   * @param {string} modelName - Model name
   * @returns {Promise<Object>} Model info
   */
  async getModelInfo(modelName) {
    try {
      const response = await this.client.post('/api/show', {
        name: modelName,
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to get info for model ${modelName}:`, error.message);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

/**
 * Get or create AIService instance
 * @returns {AIService} AI Service instance
 */
function getAIService() {
  if (!instance) {
    instance = new AIService();
  }
  return instance;
}

module.exports = {
  AIService,
  getAIService,
};
