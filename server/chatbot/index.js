/**
 * ChatBot Package - Main Entry Point
 * 
 * This package exports the main initialization function for
 * easy integration with NotionX backend.
 * 
 * Usage in NotionX backend:
 * 
 * const { initializeChatbot } = require('./chatbot');
 * await initializeChatbot(app);
 */

const { initializeChatbot, getServices, shutdownChatbot, checkHealth } = require('./src/index.js');

// Export all services for external access
module.exports = {
  // Main integration function
  initializeChatbot,
  
  // Service access
  getServices,
  
  // Lifecycle
  shutdownChatbot,
  checkHealth,
  
  // Service exports (for advanced usage)
  ChatService: require('./src/services/chatService.js'),
  SearchService: require('./src/services/searchService.js'),
  AIService: require('./src/services/aiService.js'),
  DatabaseService: require('./src/services/databaseService.js'),
  CacheService: require('./src/services/cacheService.js'),
  
  // Utilities
  logger: require('./src/utils/logger.js'),
  validation: require('./src/utils/validation.js'),
  similarity: require('./src/utils/similarity.js'),
};
