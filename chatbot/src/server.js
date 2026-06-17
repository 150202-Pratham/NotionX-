const createApp = require('./app');
const logger = require('./utils/logger');
const { getAIService } = require('./services/aiService');
const { getDatabaseService } = require('./services/databaseService');
const SearchService = require('./services/searchService');
const { getCacheService } = require('./services/cacheService');
const ChatService = require('./services/chatService');
const createChatRoutes = require('./routes/chatRoutes');

const PORT = process.env.PORT || 5000;

/**
 * Global services
 */
let app;
let aiService;
let databaseService;
let searchService;
let cacheService;
let chatService;

/**
 * Initialize all services
 */
async function initializeServices() {
  try {
    logger.info('Initializing services...');

    // Get service instances
    aiService = getAIService();
    databaseService = getDatabaseService();
    cacheService = getCacheService();

    // Initialize database
    if (process.env.USE_POSTGRES === 'true') {
      await databaseService.initialize();
    }

    // Check AI service
    const aiHealthy = await aiService.isHealthy();
    if (!aiHealthy) {
      logger.warn('AI service (Ollama) is not responding. Some features may not work.');
    } else {
      logger.info('AI service connected successfully');
    }

    // Create search service
    searchService = new SearchService(databaseService, aiService);

    // Load documents to memory for hybrid search
    if (process.env.USE_POSTGRES === 'true') {
      await searchService.loadAllDocumentsToMemory();
    }

    // Create chat service
    chatService = new ChatService(aiService, databaseService, searchService, cacheService);

    logger.info('All services initialized successfully');
    return true;
  } catch (error) {
    logger.error('Service initialization failed:', error.message);
    throw error;
  }
}

/**
 * Start server
 */
async function startServer() {
  try {
    // Initialize services
    await initializeServices();

    // Create Express app
    app = createApp();

    // Mount chat routes
    const chatRoutes = createChatRoutes(chatService, aiService, databaseService);
    app.use('/api/chatbot', chatRoutes);

    // Start listening
    const server = app.listen(PORT, () => {
      logger.info(`ChatBot server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`AI Model: ${process.env.OLLAMA_MODEL || 'qwen3:0.6b'}`);
      logger.info(`Database: ${process.env.USE_POSTGRES === 'true' ? 'PostgreSQL' : 'In-Memory'}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      shutdownServer(server);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully...');
      shutdownServer(server);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

/**
 * Shutdown server gracefully
 */
async function shutdownServer(server) {
  try {
    logger.info('Closing database connections...');
    if (databaseService) {
      await databaseService.close();
    }

    logger.info('Closing server...');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown');
      process.exit(1);
    }, 10000);
  } catch (error) {
    logger.error('Error during shutdown:', error.message);
    process.exit(1);
  }
}

// Start server if running directly
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  startServer,
  initializeServices,
  app,
  aiService,
  databaseService,
  searchService,
  cacheService,
  chatService,
};
