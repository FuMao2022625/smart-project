/**
 * 认证和授权中间件
 * 提供JWT令牌验证和角色授权功能
 */
const jwt = require('jsonwebtoken');
const winston = require('../config/logger');
const AuditLogger = require('../utils/auditLogger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const ROLE_HIERARCHY = {
  superadmin: 4,
  admin: 3,
  manager: 2,
  user: 1,
  guest: 0
};

const PERMISSIONS = {
  'user:read': ['superadmin', 'admin', 'manager', 'user'],
  'user:write': ['superadmin', 'admin', 'manager'],
  'user:delete': ['superadmin', 'admin'],
  'device:read': ['superadmin', 'admin', 'manager', 'user', 'guest'],
  'device:write': ['superadmin', 'admin', 'manager'],
  'device:delete': ['superadmin', 'admin'],
  'sensor:read': ['superadmin', 'admin', 'manager', 'user', 'guest'],
  'sensor:write': ['superadmin', 'admin', 'manager', 'user'],
  'sensor:delete': ['superadmin', 'admin'],
  'alert:read': ['superadmin', 'admin', 'manager', 'user'],
  'alert:write': ['superadmin', 'admin', 'manager'],
  'alert:resolve': ['superadmin', 'admin', 'manager', 'user'],
  'report:read': ['superadmin', 'admin', 'manager', 'user'],
  'report:write': ['superadmin', 'admin', 'manager'],
  'report:generate': ['superadmin', 'admin', 'manager'],
  'system:read': ['superadmin', 'admin'],
  'system:write': ['superadmin'],
  'audit:read': ['superadmin', 'admin']
};

/**
 * JWT令牌验证中间件
 * 验证请求头中的AuthorizationBearer令牌
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌',
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user'
    };
    next();
  } catch (error) {
    winston.warn('令牌验证失败:', { error: error.message });
    return res.status(401).json({
      code: 401,
      message: '令牌无效或已过期',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 角色授权中间件
 * @param {string[]} roles - 允许的角色数组，如 ['admin', 'user']
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '用户未认证',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      winston.warn('用户权限不足:', { userId: req.user.id, role: req.user.role, requiredRoles: roles });
      return res.status(403).json({
        code: 403,
        message: '权限不足，无法访问此资源',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * 生成JWT令牌
 * @param {Object} user - 用户信息对象
 * @returns {string} JWT令牌
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * 验证令牌是否有效（不触发响应）
 * @param {string} token - JWT令牌
 * @returns {Object|null} 解码后的用户信息或null
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) {
    return false;
  }
  return allowedRoles.includes(userRole);
};

const hasMinimumRole = (userRole, minimumRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '用户未认证',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const userRole = req.user.role || 'user';

    if (!hasPermission(userRole, permission)) {
      await AuditLogger.logPermissionDenied(
        req.user.id,
        permission.split(':')[0],
        null,
        permission,
        req
      );

      winston.warn('Permission denied', {
        userId: req.user.id,
        role: userRole,
        permission
      });

      return res.status(403).json({
        code: 403,
        message: '权限不足，无法访问此资源',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

const requireMinimumRole = (minimumRole) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '用户未认证',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const userRole = req.user.role || 'user';

    if (!hasMinimumRole(userRole, minimumRole)) {
      await AuditLogger.logPermissionDenied(
        req.user.id,
        'role',
        null,
        `minimum_role:${minimumRole}`,
        req
      );

      winston.warn('Insufficient role level', {
        userId: req.user.id,
        role: userRole,
        requiredMinimumRole: minimumRole
      });

      return res.status(403).json({
        code: 403,
        message: '权限级别不足，无法访问此资源',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user'
    };
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  authorize,
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ROLE_HIERARCHY,
  PERMISSIONS,
  hasPermission,
  hasMinimumRole,
  requirePermission,
  requireMinimumRole,
  optionalAuth
};
