const logger = require('../utils/logger');
const { cosineSimilarity } = require('../utils/similarity');

/**
 * Hybrid Search Service
 * Combines semantic and keyword search
 */
class SearchService {
  constructor(databaseService, aiService) {
    this.db = databaseService;
    this.ai = aiService;
    this.usePostgres = process.env.USE_POSTGRES === 'true';
    this.useInMemory = process.env.USE_IN_MEMORY_FALLBACK === 'true';
    console.log({
      usePostgres: this.usePostgres,
      useInMemory: this.useInMemory,
    });
    this.inMemoryDocuments = [];
  }

  /**
   * Perform hybrid search (semantic + keyword)
   * @param {string} query - Search query
   * @param {number} topK - Number of results
   * @returns {Promise<Array>} Search results
   */
  async hybridSearch(query, topK = 5) {
    try {
      let results = [];

      // Generate query embedding
      let queryEmbedding = null;
      try {
        queryEmbedding = await this.ai.generateEmbedding(query);
      } catch (error) {
        logger.warn('Failed to generate embedding:', error.message);
      }

      if (this.usePostgres) {
        // Semantic search
        if (queryEmbedding) {
          try {
            const semanticResults = await this.db.semanticSearch(
              queryEmbedding,
              topK,
              parseFloat(process.env.SIMILARITY_THRESHOLD || '0.5'),
            );
            results = results.concat(
              semanticResults.map((doc) => ({
                ...doc,
                searchType: 'semantic',
              })),
            );
          } catch (error) {
            logger.error('Semantic search failed:', error.message);
          }
        }

        // Keyword search
        try {
          const keywordResults = await this.db.keywordSearch(query, topK);
          results = results.concat(
            keywordResults.map((doc) => ({
              ...doc,
              searchType: 'keyword',
            })),
          );
        } catch (error) {
          logger.error('Keyword search failed:', error.message);
        }
      } else if (this.useInMemory) {
        // Fallback to in-memory search
        results = await this.inMemorySearch(query, queryEmbedding, topK);
      }

      // Deduplicate and rank results
      const uniqueResults = this.deduplicateResults(results);
      return uniqueResults.slice(0, topK);
    } catch (error) {
      logger.error('Hybrid search failed:', error.message);
      throw error;
    }
  }

  /**
   * In-memory search (for development/fallback)
   * @param {string} query - Search query
   * @param {number[]} queryEmbedding - Query embedding
   * @param {number} topK - Number of results
   * @returns {Promise<Array>} Results
   */
  async inMemorySearch(query, queryEmbedding, topK) {
    const results = [];

    for (const doc of this.inMemoryDocuments) {
      let score = 0;

      // Semantic similarity
      if (queryEmbedding && doc.embedding) {
        score += cosineSimilarity(queryEmbedding, doc.embedding) * 0.7;
      }

      // Keyword matching
      const queryLower = query.toLowerCase();
      const titleMatch = doc.title.toLowerCase().includes(queryLower) ? 1 : 0;
      const contentMatch = doc.content.toLowerCase().includes(queryLower) ? 0.5 : 0;
      score += (titleMatch + contentMatch) * 0.3;

      if (score > 0) {
        results.push({
          ...doc,
          similarity: score,
          searchType: 'in-memory',
        });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  }

  /**
   * Deduplicate search results
   * @param {Array} results - Results to deduplicate
   * @returns {Array} Deduplicated results
   */
  deduplicateResults(results) {
    const seen = new Set();
    const unique = [];

    for (const result of results) {
      const key = result.id || result.title;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }

    return unique.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  }

  /**
   * Add document to in-memory store
   * @param {Object} document - Document to add
   */
  addToInMemory(document) {
    this.inMemoryDocuments.push(document)
    console.log("=====================");
    console.log("Document Added")
    console.log("Memory Size:", this.inMemoryDocuments.length);
    console.log(this.inMemoryDocuments.map(d => d.title));
    console.log("======================");
    
  }

  /**
 * Clear only course documents from AI memory
 */
clearCourseDocuments() {
  const before = this.inMemoryDocuments.length;

  this.inMemoryDocuments = this.inMemoryDocuments.filter(
    (doc) => !doc.metadata || doc.metadata.type !== "course"
  );

  const removed = before - this.inMemoryDocuments.length;

  console.log("================================");
  console.log("✅ Course knowledge cleared");
  console.log("Removed:", removed);
  console.log("Remaining:", this.inMemoryDocuments.length);
  console.log("================================");
}

  /**
   * Clear in-memory store
   */
  clearInMemory() {
    this.inMemoryDocuments = [];
  }

  /**
   * Load all documents into in-memory store
   * @returns {Promise<void>}
   */
  async loadAllDocumentsToMemory() {
    try {
      if (!this.usePostgres) return;

      const documents = await this.db.getAllDocuments(1000, 0);
      this.inMemoryDocuments = documents;
      logger.info(`Loaded ${documents.length} documents to memory`);
    } catch (error) {
      logger.error('Failed to load documents to memory:', error.message);
    }
  }

  removeCourseDocument(courseId) {
  this.inMemoryDocuments = this.inMemoryDocuments.filter(
    doc =>
      !(
        doc.metadata &&
        doc.metadata.type === "course" &&
        doc.metadata.courseId === courseId
      )
  );

  console.log(`✅ Removed AI document for course ${courseId}`);
}

}

module.exports = SearchService;
