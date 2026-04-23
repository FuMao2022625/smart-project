/**
 * 安全中间件
 * 使用配置管理系统获取安全配置
 */
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const configManager = require('../config/configManager');

const securityMiddleware = (app) => {
  // 添加安全头
  app.use(helmet());
  
  // 从配置管理系统获取速率限制配置
  const rateLimitConfig = configManager.get('security.rateLimit', {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 每个IP在windowMs时间内最多100个请求
  });
  
  // 实现速率限制
  const apiLimiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: '请求过于频繁，请稍后再试',
      code: 429
    }
  });
  
  // 对API路由应用速率限制
  app.use('/api', apiLimiter);
  
  // 从配置管理系统获取CORS配置
  const allowedOrigins = configManager.get('security.allowedOrigins', ['*']);
  
  // 改进CORS配置，使其更安全
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Forwarded-For, X-Real-IP');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    next();
  });
  
  // 添加其他安全措施
  app.use((req, res, next) => {
    // 防止点击劫持
    res.setHeader('X-Frame-Options', 'DENY');
    // 防止MIME类型嗅探
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // 启用严格传输安全（仅HTTPS）
    if (req.secure || configManager.get('server.env') === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });
};

module.exports = securityMiddleware;