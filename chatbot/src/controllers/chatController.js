const logger = require('../utils/logger');
const { sanitizeInput, validateMessage } = require('../utils/validation');

/**
 * Chat Controller
 * Handles HTTP requests for chat endpoints
 */
class ChatController {
  constructor(chatService, aiService, databaseService) {
    this.chatService = chatService;
    this.aiService = aiService;
    this.databaseService = databaseService;
  }

  /**
   * POST /api/chatbot/chat
   * Send message and get response
   */
  async chat(req, res, next) {
    try {
      const { message, conversationId, topK } = req.body;

      // Validate input
      const validation = validateMessage(message);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid message',
          details: validation.errors,
        });
      }

      // Sanitize input
      const sanitizedMessage = sanitizeInput(message);

      // Process message
      const result = await this.chatService.processMessage(sanitizedMessage, conversationId);

      res.json(result);
    } catch (error) {
      logger.error('Chat error:', error.message);
      next(error);
    }
  }

  /**
   * GET /api/chatbot/health
   * Check service health
   */
  async health(req, res) {
    try {
      const aiHealth = await this.aiService.isHealthy();
      const dbConnection = this.databaseService.initialized;

      const status = aiHealth && dbConnection ? 'healthy' : 'degraded';

      res.json({
        status,
        services: {
          ai: aiHealth ? 'running' : 'down',
          database: dbConnection ? 'connected' : 'disconnected',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/chatbot/status
   * Get detailed service status
   */
  async status(req, res, next) {
    try {
      const stats = await this.chatService.getStatistics();

      res.json({
        success: true,
        status: 'operational',
        ...stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Status check error:', error.message);
      next(error);
    }
  }

  /**
   * GET /api/chatbot/history/:conversationId
   * Get conversation history
   */
  async getHistory(req, res, next) {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          error: 'Conversation ID required',
        });
      }

      const history = await this.chatService.getConversationHistory(conversationId);

      res.json({
        success: true,
        conversationId,
        messages: history,
      });
    } catch (error) {
      logger.error('Get history error:', error.message);
      next(error);
    }
  }

  /**
   * POST /api/chatbot/documents
   * Add document to knowledge base
   */
  async addDocument(req, res, next) {
    try {
      const { title, content, metadata } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required',
        });
      }

      const document = {
        title: sanitizeInput(title),
        content: sanitizeInput(content),
        metadata: metadata || {},
      };

      const result = await this.chatService.addDocument(document);

      res.status(201).json({
        success: true,
        message: 'Document added successfully',
        document: result,
      });
    } catch (error) {
      logger.error('Add document error:', error.message);
      next(error);
    }
  }

  /**
   * POST /api/chatbot/documents/batch
   * Batch add documents
   */
  async addDocuments(req, res, next) {
    try {
      const { documents } = req.body;

      if (!Array.isArray(documents) || documents.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Documents array is required and must not be empty',
        });
      }

      const sanitizedDocs = documents.map((doc) => ({
        title: sanitizeInput(doc.title),
        content: sanitizeInput(doc.content),
        metadata: doc.metadata || {},
      }));

      const results = await this.chatService.addDocuments(sanitizedDocs);

      res.status(201).json({
        success: true,
        message: `${results.length} documents added successfully`,
        count: results.length,
      });
    } catch (error) {
      logger.error('Batch add documents error:', error.message);
      next(error);
    }
  }

  async loadPlatformKnowledge(req, res, next) {
    try {
      const platformKnowledge = require("../data/platformKnowledge");

      const result = await this.chatService.addDocuments(
        platformKnowledge
      );

      return res.status(200).json({
        success: true,
        message: "Platform knowledge loaded successfully",
        documents: result.length,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}




module.exports = ChatController;
