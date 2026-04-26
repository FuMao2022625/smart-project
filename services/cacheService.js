const NodeCache = require('node-cache');
const crypto = require('crypto');
const winston = require('../config/logger');

class CacheService {
  constructor() {
    const cacheEnabled = process.env.CACHE_ENABLED !== 'false';
    const cacheTTL = parseInt(process.env.CACHE_TTL) || 3600;
    const cacheMaxSize = parseInt(process.env.CACHE_SIZE) || 5000;

    this.cacheStrategies = {
      short: 60,
      medium: 300,
      long: 3600,
      extended: 86400
    };

    if (cacheEnabled) {
      this.cache = new NodeCache({
        stdTTL: cacheTTL,
        checkperiod: cacheTTL / 2,
        maxKeys: cacheMaxSize,
        useClones: false
      });

      this.queryCache = new NodeCache({
        stdTTL: 600,
        checkperiod: 300,
        maxKeys: 1000,
        useClones: false
      });

      this.userCache = new NodeCache({
        stdTTL: 1800,
        checkperiod: 900,
        maxKeys: 500,
        useClones: false
      });

      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0
      };

      this.startStatsCollection();

      winston.info('Cache service initialized with multi-level caching');
    } else {
      this.cache = null;
      this.queryCache = null;
      this.userCache = null;
      winston.info('Cache service disabled');
    }
  }

  startStatsCollection() {
    setInterval(() => {
      if (this.cache) {
        const stats = this.cache.getStats();
        const queryStats = this.queryCache.getStats();
        const userStats = this.userCache.getStats();

        winston.debug('Cache performance', {
          main: {
            hits: stats.hits,
            misses: stats.misses,
            hitRate: (stats.hits / (stats.hits + stats.misses) * 100).toFixed(2) + '%'
          },
          query: {
            hits: queryStats.hits,
            misses: queryStats.misses,
            hitRate: (queryStats.hits / (queryStats.hits + queryStats.misses) * 100).toFixed(2) + '%'
          },
          user: {
            hits: userStats.hits,
            misses: userStats.misses,
            hitRate: (userStats.hits / (userStats.hits + userStats.misses) * 100).toFixed(2) + '%'
          }
        });
      }
    }, 60000);
  }

  generateKey(prefix, data) {
    const keyData = typeof data === 'string' ? data : JSON.stringify(data);
    return `${prefix}:${crypto.createHash('md5').update(keyData).digest('hex')}`;
  }

  generateApiKey(path, query = {}, params = {}) {
    const data = {
      path,
      query,
      params
    };
    return this.generateKey('api', data);
  }

  get(key, cacheType = 'main') {
    const cache = this.getCacheInstance(cacheType);
    if (!cache) return null;

    try {
      const cached = cache.get(key);

      if (cached) {
        this.stats.hits++;
        winston.debug(`Cache hit for key: ${key}`, { cacheType });
        return cached;
      }

      this.stats.misses++;
      winston.debug(`Cache miss for key: ${key}`, { cacheType });
      return null;
    } catch (error) {
      this.stats.errors++;
      winston.error('Cache get error:', error);
      return null;
    }
  }

  set(key, value, ttl = null, cacheType = 'main') {
    const cache = this.getCacheInstance(cacheType);
    if (!cache) return false;

    try {
      const strategy = this.getCacheStrategy(cacheType);
      const cacheTTL = ttl || strategy;

      cache.set(key, value, cacheTTL);
      this.stats.sets++;
      winston.debug(`Cached value for key: ${key}`, { cacheType, ttl: cacheTTL });
      return true;
    } catch (error) {
      this.stats.errors++;
      winston.error('Cache set error:', error);
      return false;
    }
  }

  getOrSet(key, fetchFn, ttl = null, cacheType = 'main') {
    const cached = this.get(key, cacheType);
    if (cached !== null) {
      return Promise.resolve(cached);
    }

    return fetchFn().then((value) => {
      if (value !== null && value !== undefined) {
        this.set(key, value, ttl, cacheType);
      }
      return value;
    });
  }

  getCacheInstance(type) {
    switch (type) {
      case 'query':
        return this.queryCache;
      case 'user':
        return this.userCache;
      default:
        return this.cache;
    }
  }

  getCacheStrategy(type) {
    return this.cacheStrategies[type] || this.cacheStrategies.medium;
  }

  delete(key, cacheType = 'main') {
    const cache = this.getCacheInstance(cacheType);
    if (!cache) return false;

    try {
      const result = cache.del(key) > 0;
      if (result) {
        this.stats.deletes++;
        winston.debug(`Cache deleted for key: ${key}`, { cacheType });
      }
      return result;
    } catch (error) {
      this.stats.errors++;
      winston.error('Cache delete error:', error);
      return false;
    }
  }

  deleteByPrefix(prefix, cacheType = 'main') {
    const cache = this.getCacheInstance(cacheType);
    if (!cache) return false;

    try {
      const keys = cache.keys();
      const keysToDelete = keys.filter(key => key.startsWith(prefix));
      if (keysToDelete.length > 0) {
        cache.del(keysToDelete);
        winston.info(`Deleted ${keysToDelete.length} cache entries with prefix: ${prefix}`, { cacheType });
        return true;
      }
      return false;
    } catch (error) {
      this.stats.errors++;
      winston.error('Cache delete by prefix error:', error);
      return false;
    }
  }

  invalidateUserCache(userId) {
    if (!userId) return;

    const patterns = [
      `user:${userId}`,
      `permissions:${userId}`,
      `session:${userId}`
    ];

    for (const pattern of patterns) {
      this.deleteByPrefix(pattern, 'user');
    }

    this.deleteByPrefix(`api:user:${userId}`, 'query');
  }

  invalidateResourceCache(resourceType, resourceId) {
    const patterns = [
      `${resourceType}:${resourceId}`,
      `api:${resourceType}:${resourceId}`,
      `api:${resourceType}:list`
    ];

    for (const pattern of patterns) {
      this.delete(pattern, 'query');
      this.delete(pattern, 'main');
    }

    this.deleteByPrefix(`${resourceType}:`, 'query');
  }

  warmCache(entries) {
    if (!this.cache) return;

    let warmed = 0;
    for (const entry of entries) {
      try {
        this.set(entry.key, entry.value, entry.ttl, entry.type || 'main');
        warmed++;
      } catch (error) {
        winston.error('Cache warming error:', { key: entry.key, error: error.message });
      }
    }

    winston.info(`Cache warmed with ${warmed} entries`);
    return warmed;
  }

  clear(cacheType = 'main') {
    const cache = this.getCacheInstance(cacheType);
    if (!cache) return false;

    try {
      cache.flushAll();
      winston.info(`Cache cleared: ${cacheType}`);
      return true;
    } catch (error) {
      this.stats.errors++;
      winston.error('Cache clear error:', error);
      return false;
    }
  }

  clearAll() {
    this.clear('main');
    this.clear('query');
    this.clear('user');
    winston.info('All caches cleared');
  }

  getStats() {
    if (!this.cache) {
      return { enabled: false };
    }

    try {
      const mainStats = this.cache.getStats();
      const queryStats = this.queryCache.getStats();
      const userStats = this.userCache.getStats();

      const totalHits = this.stats.hits;
      const totalMisses = this.stats.misses;

      return {
        enabled: true,
        main: {
          keys: mainStats.keys,
          hits: mainStats.hits,
          misses: mainStats.misses,
          hitRate: mainStats.hits / (mainStats.hits + mainStats.misses) || 0,
          ksize: mainStats.ksize,
          vsize: mainStats.vsize
        },
        query: {
          keys: queryStats.keys,
          hits: queryStats.hits,
          misses: queryStats.misses,
          hitRate: queryStats.hits / (queryStats.hits + queryStats.misses) || 0
        },
        user: {
          keys: userStats.keys,
          hits: userStats.hits,
          misses: userStats.misses,
          hitRate: userStats.hits / (userStats.hits + userStats.misses) || 0
        },
        summary: {
          totalHits,
          totalMisses,
          totalSets: this.stats.sets,
          totalDeletes: this.stats.deletes,
          totalErrors: this.stats.errors,
          overallHitRate: totalHits / (totalHits + totalMisses) || 0
        }
      };
    } catch (error) {
      winston.error('Cache stats error:', error);
      return { enabled: true, error: error.message };
    }
  }

  getCacheHealth() {
    if (!this.cache) {
      return { healthy: false, reason: 'Cache disabled' };
    }

    try {
      const stats = this.getStats();
      const hitRate = stats.summary.overallHitRate;

      let health = 'healthy';
      let reasons = [];

      if (hitRate < 0.5) {
        health = 'degraded';
        reasons.push('Low hit rate: ' + (hitRate * 100).toFixed(2) + '%');
      }

      if (this.stats.errors > 100) {
        health = 'unhealthy';
        reasons.push('High error count: ' + this.stats.errors);
      }

      return {
        healthy: health !== 'unhealthy',
        status: health,
        hitRate: (hitRate * 100).toFixed(2) + '%',
        reasons
      };
    } catch (error) {
      return { healthy: false, reason: error.message };
    }
  }
}

module.exports = new CacheService();