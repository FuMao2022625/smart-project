const winston = require('../config/logger');
const cacheService = require('../services/cacheService');

const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    try {
      // 只缓存GET请求
      if (req.method !== 'GET') {
        return next();
      }
      
      const cacheKey = `api:${req.method}:${req.originalUrl}`;
      const cachedData = cacheService.get(cacheKey);
      
      if (cachedData) {
        winston.debug('缓存命中:', cacheKey);
        return res.json(cachedData);
      }
      
      const originalJson = res.json;
      res.json = function(data) {
        // 只缓存成功的响应
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, data, ttl);
        }
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      winston.error('缓存中间件错误:', error);
      next();
    }
  };
};

const clearCache = (pattern) => {
  return cacheService.deleteByPrefix(pattern);
};

const clearApiCache = () => {
  return cacheService.deleteByPrefix('api');
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearApiCache
};