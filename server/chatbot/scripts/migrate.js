const logger = require('../utils/logger');
const { getDatabaseService } = require('../services/databaseService');
const { getAIService } = require('../services/aiService');
const documents = require('../data/documents');

/**
 * Database migration script
 * Creates tables and initializes database schema
 */
async function runMigration() {
  try {
    logger.info('Starting database migration...');

    const databaseService = getDatabaseService();
    await databaseService.initialize();

    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Database migration failed:', error.message);
    throw error;
  }
}

/**
 * Seed database with initial documents
 */
async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    const databaseService = getDatabaseService();
    const aiService = getAIService();

    // Check if AI service is available
    const aiHealthy = await aiService.isHealthy();
    if (!aiHealthy) {
      logger.warn('AI service not available. Skipping embedding generation.');
      return;
    }

    // Generate embeddings for documents
    for (const doc of documents) {
      try {
        const embedding = await aiService.generateEmbedding(doc.content);
        await databaseService.upsertDocument({
          title: doc.title,
          content: doc.content,
          embedding,
          metadata: doc.metadata,
        });
        logger.info(`Seeded document: ${doc.title}`);
      } catch (error) {
        logger.error(`Failed to seed document ${doc.title}:`, error.message);
      }
    }

    logger.info('Database seeding completed');
  } catch (error) {
    logger.error('Database seeding failed:', error.message);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  runMigration,
  seedDatabase,
};
