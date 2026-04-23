/**
 * API路由入口文件
 * 采用插件式架构，自动注册路由模块
 */
const express = require('express');
const router = express.Router();
const { apiErrorHandler } = require('../../middlewares/apiHandler');
const { cacheMiddleware } = require('../../middlewares/cache');
const fs = require('fs');
const path = require('path');

// 路由配置
const routeConfig = [
  // 不需要缓存的路由
  { name: 'sse', path: '/sse', cache: false },
  // 需要缓存的路由
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

// 自动注册路由
const registerRoutes = () => {
  routeConfig.forEach(config => {
    try {
      // 尝试加载路由模块
      const routeModule = require(`./${config.name}`);
      
      // 根据配置应用缓存中间件
      if (config.cache) {
        router.use(config.path, cacheMiddleware(600), routeModule);
      } else {
        router.use(config.path, routeModule);
      }
      
      console.log(`✓ 注册路由: ${config.path}`);
    } catch (error) {
      console.error(`✗ 注册路由失败: ${config.path}`, error.message);
    }
  });
};

// 注册路由
registerRoutes();

// 全局错误处理中间件
router.use(apiErrorHandler);

module.exports = router;