const Joi = require('joi');
const logger = require('../utils/logger');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation error:', errors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    req.body = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Query validation error:', errors);
      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errors
      });
    }

    req.query = value;
    next();
  };
};

const schemas = {
  query: Joi.object({
    query: Joi.string().min(1).max(1000).required(),
    topK: Joi.number().integer().min(1).max(20).optional(),
    temperature: Joi.number().min(0).max(2).optional()
  }),

  documentId: Joi.object({
    documentId: Joi.string().uuid().required()
  }),

  documentMetadata: Joi.object({
    title: Joi.string().max(200).optional(),
    category: Joi.string().max(100).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    description: Joi.string().max(500).optional()
  }),

  batchDelete: Joi.object({
    documentIds: Joi.array().items(Joi.string().uuid()).min(1).max(100).required()
  })
};

module.exports = {
  validateRequest,
  validateQuery,
  schemas
};