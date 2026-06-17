const express = require('express');
const ChatController = require('../controllers/chatController');

/**
 * Create chat routes
 * @param {ChatService} chatService - Chat service instance
 * @param {AIService} aiService - AI service instance
 * @param {DatabaseService} databaseService - Database service instance
 * @returns {Express.Router} Router instance
 */
function createChatRoutes(chatService, aiService, databaseService) {
  const router = express.Router();
  const controller = new ChatController(chatService, aiService, databaseService);

  /**
   * POST /api/chatbot/chat
   * Send message and get AI response
   */
  router.post('/chat', (req, res, next) => controller.chat(req, res, next));


  router.post(
    "/loadPlatformKnowledge",
    (req, res, next) =>
      controller.loadPlatformKnowledge(req, res, next)
  )
  /**
   * GET /api/chatbot/health
   * Health check endpoint
   */
  router.get('/health', (req, res) => controller.health(req, res));

  /**
   * GET /api/chatbot/status
   * Service status endpoint
   */
  router.get('/status', (req, res, next) => controller.status(req, res, next));

  /**
   * GET /api/chatbot/history/:conversationId
   * Get conversation history
   */
  router.get('/history/:conversationId', (req, res, next) => controller.getHistory(req, res, next));

  /**
   * POST /api/chatbot/documents
   * Add single document to knowledge base
   */
  router.post('/documents', (req, res, next) => controller.addDocument(req, res, next));

  /**
   * POST /api/chatbot/documents/batch
   * Batch add documents to knowledge base
   */
  router.post('/documents/batch', (req, res, next) => controller.addDocuments(req, res, next));

  return router;
}

module.exports = createChatRoutes;
