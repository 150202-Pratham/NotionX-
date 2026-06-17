const logger = require('../utils/logger');
const { getDatabaseService } = require('../services/databaseService');
const { getAIService } = require('../services/aiService');
const documents = require('../data/documents');

/**
 * Seed database with initial documents
 */
async function seedDocuments() {
  try {
    logger.info('Starting database seeding with sample documents...');

    const databaseService = getDatabaseService();
    const aiService = getAIService();

    // Initialize database
    await databaseService.initialize();

    // Check if AI service is available
    const aiHealthy = await aiService.isHealthy();
    if (!aiHealthy) {
      logger.error('AI service (Ollama) is not running. Please start Ollama first.');
      process.exit(1);
    }

    // Generate embeddings and seed documents
    for (const doc of documents) {
      try {
        logger.info(`Processing document: ${doc.title}`);
        const embedding = await aiService.generateEmbedding(doc.content);

        await databaseService.upsertDocument({
          title: doc.title,
          content: doc.content,
          embedding,
          metadata: doc.metadata,
        });

        logger.info(`✓ Seeded document: ${doc.title}`);
      } catch (error) {
        logger.error(`✗ Failed to seed document ${doc.title}:`, error.message);
      }
    }

    // Get document count
    const count = await databaseService.getDocumentCount();
    logger.info(`Database seeding completed. Total documents: ${count}`);

    await databaseService.close();
  } catch (error) {
    logger.error('Database seeding failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedDocuments();
}

module.exports = {
  seedDocuments,
};
