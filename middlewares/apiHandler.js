const winston = require('../config/logger');
const apiHandler = (handler) => {
  return async (req, res) => {
    try {
      const result = await handler(req, res);
      if (result !== undefined) {
        res.json({
          code: 200,
          message: 'success',
          data: result
        });
      }
    } catch (error) {
      winston.error('API处理错误:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  };
};
const apiErrorHandler = (err, req, res, next) => {
  winston.error('API错误处理:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || '服务器内部错误',
    data: null,
    timestamp: new Date().toISOString()
  });
};
module.exports = {
  apiHandler,
  apiErrorHandler
};