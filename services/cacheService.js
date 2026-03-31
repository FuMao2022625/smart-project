const NodeCache = require('node-cache');
const crypto = require('crypto');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    const cacheEnabled = process.env.CACHE_ENABLED !== 'false';
    const cacheTTL = parseInt(process.env.CACHE_TTL) || 3600;
    const cacheMaxSize = parseInt(process.env.CACHE_MAX_SIZE) || 1000;
    
    if (cacheEnabled) {
      this.cache = new NodeCache({
        stdTTL: cacheTTL,
        checkperiod: cacheTTL / 2,
        maxKeys: cacheMaxSize
      });
      logger.info('Cache service initialized');
    } else {
      this.cache = null;
      logger.info('Cache service disabled');
    }
  }

  generateKey(query, options = {}) {
    const data = {
      query,
      topK: options.topK,
      minSimilarity: options.minSimilarity,
      temperature: options.temperature
    };
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  get(query, options = {}) {
    if (!this.cache) return null;

    try {
      const key = this.generateKey(query, options);
      const cached = this.cache.get(key);
      
      if (cached) {
        logger.debug(`Cache hit for query: ${query.substring(0, 50)}...`);
        return cached;
      }
      
      logger.debug(`Cache miss for query: ${query.substring(0, 50)}...`);
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  set(query, response, options = {}) {
    if (!this.cache) return false;

    try {
      const key = this.generateKey(query, options);
      this.cache.set(key, response);
      logger.debug(`Cached response for query: ${query.substring(0, 50)}...`);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  delete(query, options = {}) {
    if (!this.cache) return false;

    try {
      const key = this.generateKey(query, options);
      return this.cache.del(key) > 0;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  clear() {
    if (!this.cache) return false;

    try {
      this.cache.flushAll();
      logger.info('Cache cleared');
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  getStats() {
    if (!this.cache) {
      return { enabled: false };
    }

    try {
      const stats = this.cache.getStats();
      return {
        enabled: true,
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits / (stats.hits + stats.misses) || 0,
        ksize: stats.ksize,
        vsize: stats.vsize
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return { enabled: true, error: error.message };
    }
  }
}

module.exports = new CacheService();