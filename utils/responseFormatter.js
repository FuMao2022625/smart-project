/**
 * 统一响应格式化工具
 * 提供一致的API响应格式，减少代码冗余
 */

const winston = require('../config/logger');
const SecurityUtils = require('./securityUtils');

/**
 * 生成ISO时间戳
 * @returns {string} ISO格式时间戳
 */
const getTimestamp = () => new Date().toISOString();

const escapeXSS = (obj) => {
  if (typeof obj === 'string') {
    return SecurityUtils.escapeHTML(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => escapeXSS(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const escaped = {};
    for (const key in obj) {
      escaped[key] = escapeXSS(obj[key]);
    }
    return escaped;
  }
  return obj;
};

/**
 * 成功响应
 * @param {Object} res - Express响应对象
 * @param {Object} data - 响应数据
 * @param {string} message - 成功消息
 * @param {number} httpStatus - HTTP状态码
 */
const success = (res, data = null, message = 'success', httpStatus = 200) => {
  const safeData = data ? escapeXSS(JSON.parse(JSON.stringify(data))) : null;
  return res.status(httpStatus).json({
    code: httpStatus,
    message,
    data: safeData,
    timestamp: getTimestamp()
  });
};

/**
 * 分页响应
 * @param {Object} res - Express响应对象
 * @param {Object} result - 分页结果 { items, total, page, pageSize }
 * @param {string} message - 成功消息
 */
const paginated = (res, result, message = 'success') => {
  const { items, total, page, pageSize } = result;
  const safeItems = escapeXSS(JSON.parse(JSON.stringify(items)));
  return res.status(200).json({
    code: 200,
    message,
    data: {
      total,
      page,
      pageSize,
      items: safeItems
    },
    timestamp: getTimestamp()
  });
};

/**
 * 错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {number} code - 错误码
 * @param {number} httpStatus - HTTP状态码
 * @param {Object} errors - 详细错误信息
 */
const error = (res, message = '服务器内部错误', code = 500, httpStatus = 500, errors = null) => {
  const response = {
    code,
    message,
    data: null,
    timestamp: getTimestamp()
  };

  if (errors) {
    response.data = { errors };
  }

  return res.status(httpStatus).json(response);
};

/**
 * 业务错误响应（用于已知的业务逻辑错误）
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {number} code - 错误码，默认400
 */
const badRequest = (res, message = '请求参数错误', code = 400) => {
  return error(res, message, code, 400);
};

/**
 * 未授权错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 */
const unauthorized = (res, message = '认证失败') => {
  return error(res, message, 401, 401);
};

/**
 * 禁止访问错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 */
const forbidden = (res, message = '权限不足') => {
  return error(res, message, 403, 403);
};

/**
 * 资源不存在错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 */
const notFound = (res, message = '资源不存在') => {
  return error(res, message, 404, 404);
};

/**
 * 异步处理包装器
 * 统一处理异步路由中的错误
 * @param {Function} fn - 异步处理函数
 * @returns {Function} 包装后的函数
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      winston.error('异步处理错误:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
      return error(res, '服务器内部错误', 500, 500);
    });
  };
};

module.exports = {
  success,
  paginated,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  asyncHandler,
  getTimestamp
};
