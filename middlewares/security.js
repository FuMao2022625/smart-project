const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('../config/logger');

const securityMiddleware = (app) => {
  // 使用helmet设置安全头
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"]
      }
    },
    dnsPrefetchControl: true,
    expectCt: true,
    frameguard: {
      action: 'deny'
    },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },
    xssFilter: true
  }));
  
  // 请求速率限制
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP限制100个请求
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: '请求过于频繁，请稍后再试'
    },
    handler: (req, res, options) => {
      winston.warn('请求速率限制触发', {
        ip: req.ip,
        path: req.path
      });
      res.status(options.statusCode).send(options.message);
    }
  });
  
  // 对API路由应用速率限制
  // app.use('/api', apiLimiter);
  
  // 对登录接口应用更严格的速率限制
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 10, // 每个IP限制10个请求
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: '登录尝试过于频繁，请稍后再试'
    },
    handler: (req, res, options) => {
      winston.warn('登录速率限制触发', {
        ip: req.ip
      });
      res.status(options.statusCode).send(options.message);
    }
  });
  
  app.use('/api/auth/login', loginLimiter);
  
  // 自定义安全头
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    next();
  });
  
  // CORS配置
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    next();
  });
};

module.exports = securityMiddleware;