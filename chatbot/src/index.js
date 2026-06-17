/**
 * Initialize ChatBot Services
 * This module is used to set up ChatBot for integration with NotionX backend
 */

const ChatService = require('./services/chatService');
const SearchService = require('./services/searchService');
const { getAIService } = require('./services/aiService');
const { getDatabaseService } = require('./services/databaseService');
const { getCacheService } = require('./services/cacheService');
const logger = require('./utils/logger');

let chatbotServices = null;

/**
 * Initialize all ChatBot services
 * @param {Object} app - Express application instance
 * @returns {Promise<Object>} - Services object { chatService, aiService, databaseService, searchService, cacheService }
 */
async function initializeChatbot(app) {
  if (chatbotServices) {
    logger.info('ChatBot services already initialized');
    return chatbotServices;
  }

  try {
    logger.info('🚀 Starting ChatBot initialization...');

    // Initialize singleton services
    const aiService = getAIService();
    const databaseService = getDatabaseService();
    const cacheService = getCacheService();

    // Initialize database
    if (process.env.USE_POSTGRES === 'true') {
      logger.info('Initializing PostgreSQL database...');
      await databaseService.initialize();
      logger.info('✅ Database initialized successfully');
    } else {
      logger.info('Using in-memory database (development mode)');
    }

    // Check AI service health
    logger.info('Checking AI service...');
    const aiHealthy = await aiService.isHealthy();
    if (aiHealthy) {
      logger.info('✅ AI service is operational');
    } else {
      logger.warn('⚠️  AI service is unavailable (Ollama not running)');
    }

    // Initialize search service
    logger.info('Loading documents into memory...');
    const searchService = new SearchService(databaseService, aiService);
    await searchService.loadAllDocumentsToMemory();
    logger.info('✅ Search service initialized');

    // Create chat service
    const chatService = new ChatService(aiService, databaseService, searchService, cacheService);

    // const platformKnowledge = require("./data/platformKnowledge");

    // await chatService.addDocuments(platformKnowledge);

    // logger.info("✅ Platform Knowledge Loaded");


    // Mount routes
    const createChatRoutes = require('./routes/chatRoutes');
    const chatRoutes = createChatRoutes(chatService, aiService, databaseService);
    app.use('/api/v1/chatbot', chatRoutes);

    logger.info('✅ ChatBot routes mounted at /api/v1/chatbot');

    // Store services for later access
    chatbotServices = {
      chatService,
      aiService,
      databaseService,
      searchService,
      cacheService,
    };

    logger.info('✅ ChatBot initialization complete\n');
    return chatbotServices;
  } catch (error) {
    logger.error('❌ ChatBot initialization failed:', error);
    throw error;
  }
}

/**
 * Get initialized services
 * @returns {Object|null} - Services object or null if not initialized
 */
function getServices() {
  return chatbotServices;
}

/**
 * Shutdown ChatBot services gracefully
 * @returns {Promise<void>}
 */
async function shutdownChatbot() {
  if (!chatbotServices) {
    return;
  }

  try {
    logger.info('Shutting down ChatBot services...');
    await chatbotServices.databaseService.close();
    chatbotServices = null;
    logger.info('✅ ChatBot services shut down');
  } catch (error) {
    logger.error('Error during shutdown:', error);
  }
}

/**
 * Health check for all ChatBot services
 * @returns {Promise<Object>} - Health status
 */
async function checkHealth() {
  if (!chatbotServices) {
    return {
      status: 'uninitialized',
      aiService: false,
      database: false,
      cache: false,
    };
  }

  try {
    const aiHealthy = await chatbotServices.aiService.isHealthy();
    const dbHealthy = await chatbotServices.databaseService.isHealthy();

    return {
      status: aiHealthy && dbHealthy ? 'healthy' : 'degraded',
      aiService: aiHealthy,
      database: dbHealthy,
      cache: true,
    };
  } catch (error) {
    logger.error('Health check error:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
}

module.exports = {
  initializeChatbot,
  getServices,
  shutdownChatbot,
  checkHealth,
};
