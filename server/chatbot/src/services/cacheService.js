const logger = require('../utils/logger');

/**
 * Caching Service
 * Handles response and embedding caching
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
    this.enabled = process.env.ENABLE_CACHING === 'true';
    this.ttl = parseInt(process.env.CACHE_TTL || '3600') * 1000; // Convert to ms
  }

  /**
   * Generate cache key from query
   * @param {string} query - Query text
   * @returns {string} Cache key
   */
  generateKey(query) {
    return `query:${query.toLowerCase().trim()}`;
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  get(key) {
    if (!this.enabled) return null;

    if (!this.cache.has(key)) {
      return null;
    }

    // Check TTL
    const expiresAt = this.ttlMap.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      this.cache.delete(key);
      this.ttlMap.delete(key);
      return null;
    }

    logger.debug(`Cache hit for key: ${key}`);
    return this.cache.get(key);
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  set(key, value, ttl = null) {
    if (!this.enabled) return;

    this.cache.set(key, value);
    const expiresAt = Date.now() + (ttl ? ttl * 1000 : this.ttl);
    this.ttlMap.set(key, expiresAt);

    logger.debug(`Cache set for key: ${key}`);
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    this.ttlMap.delete(key);
    logger.debug(`Cache deleted for key: ${key}`);
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.ttlMap.clear();
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Stats
   */
  getStats() {
    return {
      size: this.cache.size,
      enabled: this.enabled,
      ttl: this.ttl / 1000,
    };
  }

  /**
   * Clean expired entries
   */
  cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [key, expiresAt] of this.ttlMap) {
      if (now > expiresAt) {
        this.cache.delete(key);
        this.ttlMap.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      logger.debug(`Cleaned up ${removed} expired cache entries`);
    }
  }
}

// Singleton instance
let instance = null;

/**
 * Get or create CacheService instance
 * @returns {CacheService} Cache service instance
 */
function getCacheService() {
  if (!instance) {
    instance = new CacheService();
    // Clean up expired entries every minute
    setInterval(() => instance.cleanup(), 60000);
  }
  return instance;
}

module.exports = {
  CacheService,
  getCacheService,
};
