const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Chat Service
 * Core business logic for chat interactions
 */
class ChatService {
  constructor(aiService, databaseService, searchService, cacheService) {
    this.ai = aiService;
    this.db = databaseService;
    this.search = searchService;
    this.cache = cacheService;
    this.maxContextDocuments = parseInt(process.env.TOP_K_DOCUMENTS || '5');
  }

  /**
   * Process user message and generate response
   * @param {string} message - User message
   * @param {string} conversationId - Conversation ID (optional)
   * @returns {Promise<Object>} Response object
   */
  async processMessage(message, conversationId = null) {
    try {
      // Generate conversation ID if not provided
      const finalConversationId = conversationId || uuidv4();

      // Check cache first
      const cacheKey = this.cache.generateKey(message);
      const cachedResponse = this.cache.get(cacheKey);
      if (cachedResponse) {
        logger.info('Returning cached response');
        return {
          ...cachedResponse,
          conversationId: finalConversationId,
          cached: true,
        };
      }

      // Perform hybrid search to find relevant documents
      const documents = await this.search.hybridSearch(message, this.maxContextDocuments);
      console.log(
        "Retrieved Documents:",
        documents.length
      );

      console.log(documents);
      if (documents.length === 0) {
        logger.warn('No relevant documents found for query');
      }

      // Build context from documents
      const context = this.buildContext(documents);
      console.log("========== CONTEXT ==========");
      console.log(context);

      // Generate response using AI
      const prompt = this.buildPrompt(message, context);
      console.log("========== PROMPT ==========");
      console.log(prompt);
      const response = await this.ai.generateResponse(prompt);

      // Save conversation and messages (if database available)
      if (this.db && this.db.saveConversation) {
        try {
          await this.db.saveConversation(finalConversationId, null);
          await this.db.saveMessage(finalConversationId, 'user', message);
          await this.db.saveMessage(
            finalConversationId,
            'assistant',
            response,
            documents.map((doc) => ({
              id: doc.id,
              title: doc.title,
              similarity: doc.similarity,
            })),
          );
        } catch (dbError) {
          logger.warn('Database save failed (using fallback):', dbError.message);
        }
      }

      // Format sources
      const sources = documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        similarity: parseFloat((doc.similarity || 0).toFixed(3)),
        searchType: doc.searchType,
      }));

      const result = {
        success: true,
        response,
        sources,
        conversationId: finalConversationId,
      };

      // Cache the response
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      logger.error('Failed to process message:', {
        error: error.message,
        message: message.substring(0, 100),
      });

      throw new Error(`Failed to process message: ${error.message}`);
    }
  }

  /**
   * Build context from retrieved documents
   * @param {Array} documents - Retrieved documents
   * @returns {string} Formatted context
   */
  buildContext(documents) {
    if (documents.length === 0) {
      return 'No relevant information found in knowledge base.';
    }

    const contextParts = documents.map((doc, index) => {
      const similarity = doc.similarity ? `(Relevance: ${(doc.similarity * 100).toFixed(1)}%)` : '';
      return `[Document ${index + 1}] ${doc.title} ${similarity}\n${doc.content}`;
    });

    return contextParts.join('\n\n---\n\n');
  }

  /**
   * Build prompt for AI model
   * @param {string} userMessage - User message
   * @param {string} context - Context from documents
   * @returns {string} Complete prompt
   */

  buildPrompt(userMessage, context) {
    return `
You are NotionX AI, an intelligent learning assistant.

Use the context below as your PRIMARY source of truth.

IMPORTANT RULES:
1. If the context contains relevant information, answer using it.
2. If the context partially answers the question, combine it with your general knowledge.
3. Never say "I don't have enough context" if useful context is present.
4. If no context exists, answer using your general knowledge and clearly mention that the answer comes from general knowledge.

CONTEXT:
${context}

QUESTION:
${userMessage}

ANSWER:
`;
  }

  /**
   * Get conversation history
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} Message history
   */
  async getConversationHistory(conversationId) {
    try {
      if (!this.db || !this.db.getConversationHistory) {
        logger.warn('Database not available, returning empty history');
        return [];
      }

      const messages = await this.db.getConversationHistory(conversationId);
      return messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        sources: msg.sources ? JSON.parse(msg.sources) : [],
        timestamp: msg.created_at,
      }));
    } catch (error) {
      logger.error('Failed to get conversation history:', error.message);
      return [];
    }
  }

  /**
   * Add document to knowledge base
   * @param {Object} document - Document to add
   * @returns {Promise<Object>} Added document
   */
  async addDocument(document) {
    try {
      // Generate embedding
      const embedding = await this.ai.generateEmbedding(document.content);

      const docWithEmbedding = {
        ...document,
        embedding,
      };

      // Save to database
      if (process.env.USE_POSTGRES === 'true') {
        const saved = await this.db.upsertDocument(docWithEmbedding);
        logger.info(`Document added to database: ${document.title}`);
        return saved;
      }

      // Save to in-memory
      if (process.env.USE_IN_MEMORY_FALLBACK === 'true') {
        this.search.addToInMemory(docWithEmbedding);
        logger.info(`Document added to memory: ${document.title}`);
        return docWithEmbedding;
      }
    } catch (error) {
      logger.error('Failed to add document:', error.message);
      throw error;
    }
  }

  /**
   * Batch add documents
   * @param {Array} documents - Documents to add
   * @returns {Promise<Array>} Added documents
   */
  async addDocuments(documents) {
    try {
      const results = [];
      const batchSize = parseInt(process.env.DOCUMENT_BATCH_SIZE || '50');

      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        for (const doc of batch) {
          const result = await this.addDocument(doc);
          results.push(result);
        }
        logger.info(`Processed ${Math.min(i + batchSize, documents.length)} of ${documents.length} documents`);
      }

      return results;
    } catch (error) {
      logger.error('Batch add documents failed:', error.message);
      throw error;
    }
  }

  /**
   * Get statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics() {
    try {
      const docCount = await this.db.getDocumentCount();
      const aiHealth = await this.ai.isHealthy();

      return {
        documentsIndexed: docCount,
        aiServiceHealth: aiHealth ? 'operational' : 'down',
        cacheStats: this.cache.getStats(),
      };
    } catch (error) {
      logger.error('Failed to get statistics:', error.message);
      return {
        error: 'Failed to retrieve statistics',
      };
    }
  }
}

module.exports = ChatService;
