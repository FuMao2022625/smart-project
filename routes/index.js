var express = require('express');
var router = express.Router();
const { apiErrorHandler } = require('../middlewares/apiHandler');
const { cacheMiddleware } = require('../middlewares/cache');

router.get('/', function(req, res, next) {
  res.render('index.html', { title: 'Express' });
});

const routeConfig = [
  { name: 'sse', path: '/sse', cache: false },
  { name: 'auth', path: '/auth', cache: true },
  { name: 'robot', path: '/robot', cache: true },
  { name: 'environment', path: '/environment', cache: true },
  { name: 'alerts', path: '/alerts', cache: true },
  { name: 'devices', path: '/devices', cache: true },
  { name: 'sensors', path: '/sensors', cache: true },
  { name: 'messages', path: '/messages', cache: true },
  { name: 'users', path: '/users', cache: true },
  { name: 'system', path: '/system', cache: true },
  { name: 'reports', path: '/reports', cache: true }
];

const registerRoutes = () => {
  routeConfig.forEach(config => {
    try {
      const routeModule = require(`./${config.name}`);

      if (config.cache) {
        router.use(config.path, cacheMiddleware(600), routeModule);
      } else {
        router.use(config.path, routeModule);
      }
    } catch (error) {
      console.error(`✗ 注册路由失败: ${config.path}`, error.message);
    }
  });
};

registerRoutes();

router.use(apiErrorHandler);

module.exports = router;