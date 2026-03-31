const winston = require('../config/logger');

// 创建一个内存缓存作为替代
const memoryCache = new Map();

// 内存缓存服务
const cacheService = {
  async get(key) {
    return memoryCache.get(key) || null;
  },
  async set(key, value, ttl = 3600) {
    memoryCache.set(key, value);
    setTimeout(() => memoryCache.delete(key), ttl * 1000);
    return true;
  },
  async del(key) {
    memoryCache.delete(key);
    return true;
  },
  async clear(pattern) {
    for (const key of memoryCache.keys()) {
      if (key.match(pattern.replace('*', '.*'))) {
        memoryCache.delete(key);
      }
    }
    return true;
  }
};

const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    try {
      const cacheKey = `api:${req.method}:${req.originalUrl}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        winston.debug('缓存命中:', cacheKey);
        return res.json(cachedData);
      }
      const originalSend = res.json;
      res.json = function(data) {
        cacheService.set(cacheKey, data, ttl).catch(err => {
          winston.error('缓存设置失败:', err);
        });
        return originalSend.call(this, data);
      };
      next();
    } catch (error) {
      winston.error('缓存中间件错误:', error);
      next();
    }
  };
};

const clearCache = async (pattern) => {
  return await cacheService.clear(pattern);
};

module.exports = {
  cacheMiddleware,
  clearCache
};