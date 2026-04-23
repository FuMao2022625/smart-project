/**
 * 缓存中间件
 * 使用配置管理系统获取缓存配置
 */
const NodeCache = require('node-cache');
const configManager = require('../config/configManager');

// 从配置管理系统获取缓存配置
const cacheConfig = configManager.get('cache', {
  defaultTTL: 3600, // 默认缓存时间1小时
  checkperiod: 600 // 每10分钟检查一次过期缓存
});

// 创建缓存实例
const cache = new NodeCache({
  stdTTL: cacheConfig.defaultTTL,
  checkperiod: cacheConfig.checkperiod,
  useClones: false // 不使用克隆，提高性能
});

// 缓存中间件
const cacheMiddleware = (ttl = cacheConfig.defaultTTL) => {
  return async (req, res, next) => {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next();
    }
    
    // 生成缓存键
    const cacheKey = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
    
    // 尝试从缓存中获取数据
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      // 从缓存中返回数据
      return res.json(cachedData);
    }
    
    // 重写res.json方法，将响应数据存入缓存
    const originalJson = res.json;
    res.json = function(data) {
      // 只缓存成功的响应
      if (res.statusCode === 200) {
        cache.set(cacheKey, data, ttl);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// 清除缓存
const clearCache = (pattern) => {
  if (pattern) {
    // 清除匹配模式的缓存
    const keys = cache.keys();
    const matchedKeys = keys.filter(key => key.includes(pattern));
    if (matchedKeys.length > 0) {
      cache.del(matchedKeys);
    }
  } else {
    // 清除所有缓存
    cache.flushAll();
  }
  return Promise.resolve(true);
};

// 清除API缓存
const clearApiCache = () => {
  const keys = cache.keys();
  const apiKeys = keys.filter(key => key.startsWith('GET:/api/'));
  if (apiKeys.length > 0) {
    cache.del(apiKeys);
  }
  return Promise.resolve(true);
};

// 获取缓存状态
const getCacheStatus = () => {
  return {
    keys: cache.keys().length,
    stats: cache.getStats()
  };
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearApiCache,
  getCacheStatus
};