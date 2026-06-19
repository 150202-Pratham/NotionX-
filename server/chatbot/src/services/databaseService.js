const pgPromise = require('pg-promise');
const logger = require('../utils/logger');

/**
 * PostgreSQL Database Service with pgvector support
 * Handles vector storage and semantic search
 */
class DatabaseService {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'aichatbot',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '2'),
    };
  }

  /**
   * Initialize database connection
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      const pgp = pgPromise();
      this.db = pgp(this.config);

      // Test connection
      const result = await this.db.one('SELECT 1 as success');
      logger.info('Database connected successfully');

      // Create tables if not exists
      await this.createTables();
      this.initialized = true;
    } catch (error) {
      logger.error('Database initialization failed:', error.message);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * Create necessary tables with pgvector support
   * @returns {Promise<void>}
   */
  async createTables() {
    try {
      // Enable pgvector extension
      await this.db.none('CREATE EXTENSION IF NOT EXISTS vector');

      // Create documents table
      await this.db.none(`
        CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          embedding vector(384),
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create index for vector similarity search
      await this.db.none(`
        CREATE INDEX IF NOT EXISTS idx_embedding_cosine 
        ON documents USING ivfflat (embedding vector_cosine_ops)
      `);

      // Create conversations table
      await this.db.none(`
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          conversation_id VARCHAR(255) UNIQUE NOT NULL,
          user_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create messages table
      await this.db.none(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          conversation_id VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          sources JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
        )
      `);

      logger.info('Database tables created successfully');
    } catch (error) {
      logger.error('Failed to create tables:', error.message);
      throw error;
    }
  }

  /**
   * Insert or update document with embedding
   * @param {Object} document - Document object
   * @returns {Promise<Object>} Inserted/updated document
   */
  async upsertDocument(document) {
    try {
      const { title, content, embedding, metadata } = document;

      const result = await this.db.one(
        `INSERT INTO documents (title, content, embedding, metadata)
         VALUES ($1, $2, $3::vector, $4)
         ON CONFLICT (title) DO UPDATE SET 
          content = $2, 
          embedding = $3::vector,
          metadata = $4,
          updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [title, content, JSON.stringify(embedding), JSON.stringify(metadata || {})],
      );

      return result;
    } catch (error) {
      logger.error('Document upsert failed:', error.message);
      throw error;
    }
  }

  /**
   * Semantic search using vector similarity
   * @param {number[]} queryEmbedding - Query embedding vector
   * @param {number} limit - Number of results
   * @param {number} threshold - Similarity threshold
   * @returns {Promise<Array>} Similar documents
   */
  async semanticSearch(queryEmbedding, limit = 5, threshold = 0.5) {
    try {
      const embeddingStr = JSON.stringify(queryEmbedding);
      const results = await this.db.many(
        `SELECT 
          id, 
          title, 
          content, 
          metadata,
          1 - (embedding <=> $1::vector) as similarity
         FROM documents
         WHERE 1 - (embedding <=> $1::vector) > $2
         ORDER BY similarity DESC
         LIMIT $3`,
        [embeddingStr, threshold, limit],
      );

      return results;
    } catch (error) {
      logger.error('Semantic search failed:', error.message);
      throw error;
    }
  }

  /**
   * Keyword search in documents
   * @param {string} query - Search query
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} Matching documents
   */
  async keywordSearch(query, limit = 5) {
    try {
      const searchQuery = `%${query}%`;
      const results = await this.db.many(
        `SELECT id, title, content, metadata
         FROM documents
         WHERE title ILIKE $1 OR content ILIKE $1
         LIMIT $2`,
        [searchQuery, limit],
      );

      return results;
    } catch (error) {
      logger.error('Keyword search failed:', error.message);
      throw error;
    }
  }

  /**
   * Get document by ID
   * @param {number} id - Document ID
   * @returns {Promise<Object>} Document
   */
  async getDocument(id) {
    try {
      const document = await this.db.oneOrNone('SELECT * FROM documents WHERE id = $1', [id]);
      return document;
    } catch (error) {
      logger.error('Failed to get document:', error.message);
      throw error;
    }
  }

  /**
   * Get all documents
   * @param {number} limit - Number of results
   * @param {number} offset - Offset
   * @returns {Promise<Array>} Documents
   */
  async getAllDocuments(limit = 100, offset = 0) {
    try {
      const documents = await this.db.many(
        'SELECT id, title, content, metadata, created_at FROM documents LIMIT $1 OFFSET $2',
        [limit, offset],
      );
      return documents;
    } catch (error) {
      logger.error('Failed to get documents:', error.message);
      throw error;
    }
  }

  /**
   * Delete document
   * @param {number} id - Document ID
   * @returns {Promise<boolean>} Success
   */
  async deleteDocument(id) {
    try {
      await this.db.none('DELETE FROM documents WHERE id = $1', [id]);
      return true;
    } catch (error) {
      logger.error('Failed to delete document:', error.message);
      throw error;
    }
  }

  /**
   * Save conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Conversation
   */
  async saveConversation(conversationId, userId) {
    try {
      if (!this.db) {
        logger.warn('Database not initialized, skipping conversation save');
        return { conversation_id: conversationId, user_id: userId };
      }

      const result = await this.db.oneOrNone(
        `INSERT INTO conversations (conversation_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (conversation_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [conversationId, userId],
      );
      return result;
    } catch (error) {
      logger.error('Failed to save conversation:', error.message);
      throw error;
    }
  }

  /**
   * Save message to conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} role - Message role (user/assistant)
   * @param {string} content - Message content
   * @param {Array} sources - Source documents
   * @returns {Promise<Object>} Message
   */
  async saveMessage(conversationId, role, content, sources = []) {
    try {
      if (!this.db) {
        logger.warn('Database not initialized, skipping message save');
        return { conversation_id: conversationId, role, content, sources };
      }

      const result = await this.db.one(
        `INSERT INTO messages (conversation_id, role, content, sources)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [conversationId, role, content, JSON.stringify(sources)],
      );
      return result;
    } catch (error) {
      logger.error('Failed to save message:', error.message);
      throw error;
    }
  }

  /**
   * Get conversation history
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} Messages
   */
  async getConversationHistory(conversationId) {
    try {
      const messages = await this.db.many(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [conversationId],
      );
      return messages;
    } catch (error) {
      logger.error('Failed to get conversation history:', error.message);
      throw error;
    }
  }

  /**
   * Count documents in database
   * @returns {Promise<number>} Document count
   */
  async getDocumentCount() {
    try {
      const result = await this.db.one('SELECT COUNT(*) as count FROM documents');
      return result.count;
    } catch (error) {
      logger.error('Failed to count documents:', error.message);
      throw error;
    }
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    try {
      if (this.db) {
        await this.db.$pool.end();
        logger.info('Database connection closed');
      }
    } catch (error) {
      logger.error('Failed to close database connection:', error.message);
    }
  }
}

// Singleton instance
let instance = null;

/**
 * Get or create DatabaseService instance
 * @returns {DatabaseService} Database service instance
 */
function getDatabaseService() {
  if (!instance) {
    instance = new DatabaseService();
  }
  return instance;
}

module.exports = {
  DatabaseService,
  getDatabaseService,
};
