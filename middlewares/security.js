/**
 * 安全中间件
 * 使用配置管理系统获取安全配置
 */
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const configManager = require('../config/configManager');
const SecurityUtils = require('../utils/securityUtils');
const winston = require('../config/logger');

const csrfTokens = new Map();

const securityMiddleware = (app) => {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  const rateLimitConfig = configManager.get('security.rateLimit', {
    windowMs: 15 * 60 * 1000,
    max: 100
  });

  const apiLimiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 429,
      message: '请求过于频繁，请稍后再试',
      data: null,
      timestamp: new Date().toISOString()
    },
    skip: (req) => {
      return req.path === '/api/sse' || req.path === '/api/health';
    }
  });

  app.use('/api', apiLimiter);

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 429,
      message: '登录尝试次数过多，请15分钟后再试',
      data: null,
      timestamp: new Date().toISOString()
    }
  });

  app.use('/api/auth/login', loginLimiter);

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    if (req.secure || configManager.get('server.env') === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    next();
  });
};

const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const csrfToken = SecurityUtils.generateCSRFToken();
    const sessionId = req.ip || 'anonymous';
    csrfTokens.set(sessionId, {
      token: csrfToken,
      expires: Date.now() + 3600000
    });
    res.setHeader('X-CSRF-Token', csrfToken);
    return next();
  }

  const sessionId = req.ip || 'anonymous';
  const csrfData = csrfTokens.get(sessionId);

  if (!csrfData || Date.now() > csrfData.expires) {
    csrfTokens.delete(sessionId);
    winston.warn('CSRF token expired or missing', { ip: req.ip, path: req.path });
    return res.status(403).json({
      code: 403,
      message: 'CSRF token无效或已过期',
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  const requestToken = req.headers['x-csrf-token'] || req.body._csrf;
  if (!requestToken || !SecurityUtils.constantTimeCompare(requestToken, csrfData.token)) {
    csrfTokens.delete(sessionId);
    winston.warn('CSRF token validation failed', { ip: req.ip, path: req.path });
    return res.status(403).json({
      code: 403,
      message: 'CSRF token验证失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

const sqlInjectionProtection = (req, res, next) => {
  const checkValue = (value, key) => {
    if (typeof value === 'string') {
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)/i,
        /(--|;|'|\/\*|\*\/|@@|@)/,
        /(xp_|sp_|0x)/i
      ];

      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          winston.warn('Potential SQL injection attempt detected', {
            key,
            value: value.substring(0, 50),
            ip: req.ip,
            path: req.path
          });
          return false;
        }
      }
    }
    return true;
  };

  const recursivelyCheck = (obj, prefix = '') => {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (typeof value === 'object' && value !== null) {
        if (!recursivelyCheck(value, fullKey)) return false;
      } else {
        if (!checkValue(value, fullKey)) return false;
      }
    }
    return true;
  };

  if (req.body && !recursivelyCheck(req.body)) {
    return res.status(400).json({
      code: 400,
      message: '请求包含非法字符',
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  if (req.query && !recursivelyCheck(req.query)) {
    return res.status(400).json({
      code: 400,
      message: '请求包含非法字符',
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

const requestSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxBytes = parseInt(maxSize) * 1024 * 1024;

    if (contentLength > maxBytes) {
      return res.status(413).json({
        code: 413,
        message: '请求数据过大',
        data: null,
        timestamp: new Date().toISOString()
      });
    }
    next();
  };
};

const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = SecurityUtils.escapeHTML(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

const inputValidation = (req, res, next) => {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];

  for (const field of sensitiveFields) {
    if (req.body && req.body[field]) {
      if (typeof req.body[field] === 'string' && req.body[field].length > 500) {
        return res.status(400).json({
          code: 400,
          message: `${field}字段长度超出限制`,
          data: null,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  next();
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (now > value.expires) {
      csrfTokens.delete(key);
    }
  }
}, 60000);

module.exports = {
  securityMiddleware,
  csrfProtection,
  sqlInjectionProtection,
  requestSizeLimit,
  sanitizeInput,
  inputValidation
};