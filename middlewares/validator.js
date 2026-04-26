/**
 * 请求验证中间件
 * 使用Joi进行请求体验证
 */
const Joi = require('joi');
const winston = require('../config/logger');

/**
 * 创建请求体验证中间件
 * @param {Joi.Schema} schema - Joi验证模式
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));

      winston.warn('请求体验证失败:', { errors: errorDetails, path: req.path });

      return res.status(400).json({
        code: 400,
        message: '请求参数错误',
        data: {
          errors: errorDetails
        },
        timestamp: new Date().toISOString()
      });
    }

    req.body = value;
    next();
  };
};

/**
 * 创建查询参数验证中间件
 * @param {Joi.Schema} schema - Joi验证模式
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));

      winston.warn('查询参数验证失败:', { errors: errorDetails, path: req.path });

      return res.status(400).json({
        code: 400,
        message: '查询参数错误',
        data: {
          errors: errorDetails
        },
        timestamp: new Date().toISOString()
      });
    }

    req.query = value;
    next();
  };
};

/**
 * 创建路径参数验证中间件
 * @param {Joi.Schema} schema - Joi验证模式
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));

      winston.warn('路径参数验证失败:', { errors: errorDetails, path: req.path });

      return res.status(400).json({
        code: 400,
        message: '路径参数错误',
        data: {
          errors: errorDetails
        },
        timestamp: new Date().toISOString()
      });
    }

    req.params = value;
    next();
  };
};

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
    .messages({
      'string.pattern.base': '用户名只能包含字母和数字'
    }),
  password: Joi.string().min(8).max(100).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.pattern.base': '密码必须包含大小写字母、数字和特殊字符'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({
      'any.only': '两次密码输入不一致'
    }),
  email: Joi.string().email().max(100).required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
  role: Joi.number().integer().min(1),
  status: Joi.string().valid('active', 'inactive', 'online', 'offline')
});

const loginSchema = Joi.object({
  username: Joi.string().min(1).max(30).required(),
  password: Joi.string().min(1).max(100).required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required()
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  keyword: Joi.string().max(100).allow('', null),
  sort: Joi.string().valid('asc', 'desc').default('desc')
});

const sensorSchema = Joi.object({
  sensorName: Joi.string().max(100).required()
    .pattern(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .messages({
      'string.pattern.base': '传感器名称包含非法字符'
    }),
  type: Joi.string().max(50).required(),
  model: Joi.string().max(100).required(),
  serialNumber: Joi.string().max(100).required(),
  location: Joi.string().max(200).allow('', null),
  description: Joi.string().max(500).allow('', null)
});

const alertSchema = Joi.object({
  level: Joi.string().valid('low', 'medium', 'high', 'critical'),
  status: Joi.string().valid('pending', 'resolved', 'processing'),
  type: Joi.string().max(100).allow('', null),
  note: Joi.string().max(500).allow('', null)
});

const reportGenerateSchema = Joi.object({
  type: Joi.string().valid('daily', 'weekly', 'monthly', 'custom').required(),
  startTime: Joi.string().isoDate().required(),
  endTime: Joi.string().isoDate().required(),
  format: Joi.string().valid('pdf', 'excel').default('pdf')
});

const deviceSchema = Joi.object({
  name: Joi.string().max(100).required()
    .pattern(/^[a-zA-Z0-9_\u4e00-\u9fa5-]+$/)
    .messages({
      'string.pattern.base': '设备名称包含非法字符'
    }),
  type: Joi.string().max(50),
  model: Joi.string().max(100).allow('', null),
  serialNumber: Joi.string().max(100).allow('', null),
  location: Joi.string().max(200).allow('', null),
  status: Joi.string().valid('online', 'offline', 'maintenance', 'error')
});

module.exports = {
  validateRequest,
  validateQuery,
  validateParams,
  userSchema,
  loginSchema,
  paginationSchema,
  sensorSchema,
  alertSchema,
  reportGenerateSchema,
  deviceSchema
};
