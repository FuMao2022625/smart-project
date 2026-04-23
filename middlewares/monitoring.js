/**
 * 监控中间件
 * 使用配置管理系统获取监控配置
 */
const winston = require('../config/logger');
const os = require('os');
const configManager = require('../config/configManager');

// 监控数据存储
const monitoringStats = {
  requests: 0,
  errors: 0,
  totalResponseTime: 0,
  averageResponseTime: 0,
  paths: {}
};

// 从配置管理系统获取监控配置
const monitoringConfig = configManager.get('monitoring', {
  responseTimeThreshold: 1000, // 响应时间阈值
  memoryUsageThreshold: 0.8, // 内存使用阈值
  cpuUsageThreshold: 1.0, // CPU负载阈值
  errorRateThreshold: 0.1 // 错误率阈值
});

const monitoringMiddleware = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(body) {
    const end = Date.now();
    const responseTime = end - start;
    const memoryUsage = process.memoryUsage();
    const cpuUsage = os.loadavg();
    const networkInterfaces = os.networkInterfaces();
    
    // 更新监控统计数据
    monitoringStats.requests++;
    monitoringStats.totalResponseTime += responseTime;
    monitoringStats.averageResponseTime = monitoringStats.totalResponseTime / monitoringStats.requests;
    
    // 统计每个路径的请求情况
    if (!monitoringStats.paths[req.path]) {
      monitoringStats.paths[req.path] = {
        requests: 0,
        errors: 0,
        totalResponseTime: 0
      };
    }
    monitoringStats.paths[req.path].requests++;
    monitoringStats.paths[req.path].totalResponseTime += responseTime;
    
    if (res.statusCode >= 400) {
      monitoringStats.errors++;
      monitoringStats.paths[req.path].errors++;
    }
    
    const monitoringData = {
      path: req.path,
      method: req.method,
      status: res.statusCode,
      responseTime: responseTime,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      },
      cpu: {
        '1min': cpuUsage[0],
        '5min': cpuUsage[1],
        '15min': cpuUsage[2]
      },
      network: {
        interfaces: Object.keys(networkInterfaces).length
      },
      timestamp: new Date().toISOString()
    };
    
    // 告警机制
    if (responseTime > monitoringConfig.responseTimeThreshold) {
      winston.warn('API响应时间过长:', monitoringData);
    } else if (responseTime > monitoringConfig.responseTimeThreshold / 2) {
      winston.info('API响应时间较长:', monitoringData);
    } else {
      winston.debug('API请求监控:', monitoringData);
    }
    
    // 内存告警
    if (memoryUsage.heapUsed / memoryUsage.heapTotal > monitoringConfig.memoryUsageThreshold + 0.1) {
      winston.error('内存使用过高:', {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      });
    } else if (memoryUsage.heapUsed / memoryUsage.heapTotal > monitoringConfig.memoryUsageThreshold) {
      winston.warn('内存使用较高:', {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      });
    }
    
    // CPU告警
    if (cpuUsage[0] > monitoringConfig.cpuUsageThreshold + 1.0) {
      winston.error('CPU负载过高:', {
        '1min': cpuUsage[0],
        '5min': cpuUsage[1],
        '15min': cpuUsage[2]
      });
    } else if (cpuUsage[0] > monitoringConfig.cpuUsageThreshold) {
      winston.warn('CPU负载较高:', {
        '1min': cpuUsage[0],
        '5min': cpuUsage[1],
        '15min': cpuUsage[2]
      });
    }
    
    // 错误率告警
    if (monitoringStats.errors > 0 && monitoringStats.errors / monitoringStats.requests > monitoringConfig.errorRateThreshold) {
      winston.error('错误率过高:', {
        errors: monitoringStats.errors,
        total: monitoringStats.requests,
        errorRate: Math.round((monitoringStats.errors / monitoringStats.requests) * 100)
      });
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

const getSystemStatus = () => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = os.loadavg();
  const uptime = process.uptime();
  const networkInterfaces = os.networkInterfaces();
  
  return {
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
    },
    cpu: {
      '1min': cpuUsage[0],
      '5min': cpuUsage[1],
      '15min': cpuUsage[2]
    },
    uptime: {
      seconds: Math.round(uptime),
      formatted: formatUptime(uptime)
    },
    os: {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      totalMemory: Math.round(os.totalmem() / 1024 / 1024 * 100) / 100,
      freeMemory: Math.round(os.freemem() / 1024 / 1024 * 100) / 100,
      networkInterfaces: Object.keys(networkInterfaces).length
    },
    monitoring: {
      requests: monitoringStats.requests,
      errors: monitoringStats.errors,
      averageResponseTime: Math.round(monitoringStats.averageResponseTime * 100) / 100,
      errorRate: monitoringStats.requests > 0 
        ? Math.round((monitoringStats.errors / monitoringStats.requests) * 100) 
        : 0
    }
  };
};

const getMonitoringStats = () => {
  return monitoringStats;
};

const resetMonitoringStats = () => {
  Object.assign(monitoringStats, {
    requests: 0,
    errors: 0,
    totalResponseTime: 0,
    averageResponseTime: 0,
    paths: {}
  });
};

const formatUptime = (uptime) => {
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
};

module.exports = {
  monitoringMiddleware,
  getSystemStatus,
  getMonitoringStats,
  resetMonitoringStats
};