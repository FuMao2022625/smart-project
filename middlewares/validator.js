const Joi = require('joi');
const winston = require('../config/logger');
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: true
      });
      if (error) {
        const errors = error.details.map(detail => detail.message);
        winston.warn('请求验证失败:', { errors, path: req.path });
        return res.status(400).json({
          success: false,
          message: '请求数据验证失败',
          errors
        });
      }
      req.body = value;
      next();
    } catch (error) {
      winston.error('验证中间件错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  };
};
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        allowUnknown: true
      });
      if (error) {
        const errors = error.details.map(detail => detail.message);
        winston.warn('查询参数验证失败:', { errors, path: req.path });
        return res.status(400).json({
          success: false,
          message: '查询参数验证失败',
          errors
        });
      }
      req.query = value;
      next();
    } catch (error) {
      winston.error('查询验证中间件错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  };
};
module.exports = {
  validateRequest,
  validateQuery
};