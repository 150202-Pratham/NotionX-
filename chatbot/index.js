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
  ChatService: require('./src/services/chatService'),
  SearchService: require('./src/services/searchService'),
  AIService: require('./src/services/aiService'),
  DatabaseService: require('./src/services/databaseService'),
  CacheService: require('./src/services/cacheService'),
  
  // Utilities
  logger: require('./src/utils/logger'),
  validation: require('./src/utils/validation'),
  similarity: require('./src/utils/similarity'),
};
