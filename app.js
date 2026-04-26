/**
 * 应用主文件
 * 负责初始化Express应用，配置中间件，注册路由等
 */

// 导入依赖
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const compression = require('compression');
require('dotenv').config();

// 导入配置和中间件
const db = require('./config/db');
const cors = require('./config/cors');
const {
  securityMiddleware,
  sqlInjectionProtection,
  requestSizeLimit,
  sanitizeInput,
  inputValidation
} = require('./middlewares/security');
const { monitoringMiddleware } = require('./middlewares/monitoring');
const winston = require('./config/logger');

// 测试数据库连接
db.getConnection()
  .then((conn) => {
    winston.info('数据库连接成功');
    conn.release();
  })
  .catch((err) => {
    winston.error('数据库连接失败:', err);
  });

// 导入路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

// 创建Express应用实例
var app = express();

// 配置视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// 将 .html 文件扩展名与 ejs 引擎关联
app.engine('html', require('ejs').renderFile);

// 应用安全中间件
securityMiddleware(app);

// 应用CORS中间件
app.use(cors);

// 应用日志中间件
app.use(logger('dev'));

// 应用SQL注入防护
app.use(sqlInjectionProtection);

// 应用请求体大小限制
app.use(requestSizeLimit('10mb'));

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));

// 解析URL编码的请求体
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// 解析Cookie
app.use(cookieParser());

// 应用输入清理
app.use(sanitizeInput);

// 应用输入验证
app.use(inputValidation);

// 启用压缩中间件，减少响应大小
const compressFilter = (req, res) => {
  if (req.headers['x-no-compression']) {
    return false;
  }
  const contentType = res.get('Content-Type');
  if (contentType && contentType.includes('image')) {
    return false;
  }
  return compression.filter(req, res);
};

app.use(compression({
  filter: compressFilter,
  level: 6,
  threshold: 1024,
  memLevel: 8
}));

// 静态资源服务，设置缓存时间为1周，并启用ETag
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    } else if (filePath.match(/\.(png|jpg|jpeg|gif|ico|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
  }
}));

// 图片资源单独服务，设置更长的缓存时间
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  maxAge: '30d',
  etag: true
}));

// 应用监控中间件
app.use(monitoringMiddleware);

// 注册路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

// 404错误处理
app.use(function(req, res, next) {
  next(createError(404));
});

// 全局错误处理
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.title = 'Error';
  res.status(err.status || 500);
  res.render('error.html');
});

// 处理SIGINT信号，优雅关闭应用
process.on('SIGINT', () => {
  winston.info('正在关闭连接...');
  process.exit(0);
});

// 导出应用实例
module.exports = app;