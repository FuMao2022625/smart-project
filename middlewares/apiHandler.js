const { error } = require('../utils/responseFormatter');

const apiErrorHandler = (err, req, res, next) => {
  console.error('API Error:', err.message);
  return error(res, err.message || '服务器内部错误');
};

module.exports = { apiErrorHandler };