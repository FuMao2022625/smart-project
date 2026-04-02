const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const winston = require('../../config/logger');
const cors = require('../../config/cors');
const CACHE_TTL = 1000;
let dataCache = null;
let cacheTime = 0;
// SSE服务状态
let sseStatus = {
  connected: false,
  lastConnectionTime: null,
  totalConnections: 0
};
const logger = winston.child({ service: 'sse-api' });
// 解析 max_temp 数据
function parseMaxTemp(maxTempData) {
  if (maxTempData === null || maxTempData === undefined) {
    return null;
  }
  try {
    if (typeof maxTempData === 'string') {
      const parsed = JSON.parse(maxTempData);
      return parsed;
    } else if (Array.isArray(maxTempData) || typeof maxTempData === 'number') {
      return maxTempData;
    }
    return maxTempData;
  } catch (e) {
    logger.warn('解析 max_temp 失败', { error: e.message });
    return maxTempData;
  }
}
// 构建传感器数据响应对象
function buildSensorDataResponse(row) {
  return {
    id: row.id,
    type: row.type,
    temperature: row.temperature,
    humidity: row.humidity,
    smokeLevel: row.smoke_level,
    maxTemp: parseMaxTemp(row.max_temp),
    humanDetected: row.human_detected === 1,
    fireRisk: row.fire_risk,
    envStatus: row.env_status,
    battery: row.battery
  };
}
// 获取SSE服务状态
router.get('/status', async (req, res) => {
  try {
    const response = {
      code: 200,
      message: 'success',
      data: {
        status: 'running',
        connectedClients: sseStatus.totalConnections,
        config: {
          cacheTTL: CACHE_TTL,
          corsEnabled: true
        },
        timestamp: new Date().toISOString()
      }
    };
    logger.info('获取SSE服务状态', { connectedClients: sseStatus.totalConnections });
    res.json(response);
  } catch (error) {
    logger.error('获取SSE状态失败', { error: error.message, stack: error.stack });
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});
// 获取最新传感器数据
router.use(cors);
async function getLatestSensorData() {
  const now = Date.now();
  if (dataCache && (now - cacheTime) < CACHE_TTL) {
    return dataCache;
  }
  try {
    const [rows] = await db.query(
      `SELECT id, type, temperature, humidity, smoke_level, max_temp, human_detected, fire_risk, env_status, battery 
       FROM sensor_data 
       ORDER BY id DESC 
       LIMIT 1`
    );
    if (rows.length > 0) {
      const sensorData = buildSensorDataResponse(rows[0]);
      dataCache = {
        ...sensorData,
        timestamp: new Date().toISOString()
      };
      cacheTime = now;
      logger.debug('缓存传感器数据', { id: sensorData.id });
      return dataCache;
    } else {
      dataCache = null;
      cacheTime = now;
      logger.debug('无传感器数据', { cacheTime: now });
      return null;
    }
  } catch (error) {
    logger.error('查询 sensor_data 数据失败', { error: error.message, stack: error.stack });
    throw error;
  }
}

router.get('/latest-data', async (req, res) => {
  try {
    const data = await getLatestSensorData();
    if (!data) {
      logger.info('暂无传感器数据', { endpoint: '/latest-data' });
      return res.status(404).json({
        code: 404,
        message: '暂无数据',
        data: null,
        timestamp: new Date().toISOString()
      });
    }
    logger.info('获取最新传感器数据', { id: data.id, temperature: data.temperature });
    res.json({
      code: 200,
      message: 'success',
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('获取最新数据失败', { error: error.message, stack: error.stack, endpoint: '/latest-data' });
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

//获取传感器历史数据路由
router.get('/history', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const [rows] = await db.query(
      `SELECT id, type, temperature, humidity, smoke_level, max_temp, human_detected, fire_risk, env_status, battery 
       FROM sensor_data 
       ORDER BY id DESC 
       LIMIT ?`,
      [limit]
    );
    const items = rows.map(buildSensorDataResponse);
    logger.info('获取传感器历史数据', { total: items.length, limit });
    res.json({
      code: 200,
      message: 'success',
      data: {
        total: items.length,
        items: items
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('获取历史数据失败', { error: error.message, stack: error.stack, endpoint: '/history' });
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});
// 导出路由
module.exports = router;
