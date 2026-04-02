const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const LOG_DIR = path.join(__dirname, 'logs');
const DATA_DIR = path.join(__dirname, 'data');
const RAW_DATA_DIR = path.join(DATA_DIR, 'raw');
const PROCESSED_DATA_DIR = path.join(DATA_DIR, 'processed');
const VALID_FIRE_RISKS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_ENV_STATUSES = ['NORMAL', 'WARNING', 'ALERT', 'EMERGENCY'];
let dbPool = null;
let dataBuffer = [];
const BATCH_SIZE = 100;
//数据库连接池配置
// const DB_POOL_CONFIG = {
//   host: 'localhost',
//   user: 'root',
//   password: '12305',
//   database: 'kpl',
//   charset: 'utf8mb4',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   connectTimeout: 10000,
//   acquireTimeout: 10000
// }
const DB_POOL_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '12305',
  database: 'kpl',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  acquireTimeout: 10000
}
// 事件发射器
const eventEmitter = require('events');
// 数据事件发射器
const dataEmitter = new eventEmitter();
// 初始化数据处理器
async function initialize() {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      await fs.promises.mkdir(LOG_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(RAW_DATA_DIR)) {
      await fs.promises.mkdir(RAW_DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PROCESSED_DATA_DIR)) {
      await fs.promises.mkdir(PROCESSED_DATA_DIR, { recursive: true });
    }
  } catch (error) {
    await log('ERROR', `创建目录失败: ${error.message}`);
  }
  await initializeDatabase(); 
  await log('INFO', '数据处理器初始化完成');
}
// 初始化数据库连接池
async function initializeDatabase() {
  let retryCount = 0;
  const maxRetries = 5;
  const retryDelay = 2000;
  
  while (retryCount < maxRetries) {
    try {
      dbPool = mysql.createPool(DB_POOL_CONFIG);
      
      const connection = await dbPool.getConnection();
      await log('INFO', `数据库连接池初始化成功，连接ID: ${connection.threadId}`);
      connection.release();
      
      dbPool.on('error', async (err) => {
        await log('ERROR', `数据库连接池错误: ${err.message}`);
      });
      
      return;
    } catch (err) {
      retryCount++;
      await log('ERROR', `数据库连接池初始化失败 (${retryCount}/${maxRetries}): ${err.message}`);
      if (retryCount < maxRetries) {
        await log('INFO', `等待 ${retryDelay * retryCount}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      } else {
        await log('ERROR', '达到最大重试次数，数据库连接池初始化失败');
        dbPool = null;
      }
    }
  }
}
// 记录日志
async function log(level, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  console.log(logMessage.trim());
  const logFile = path.join(LOG_DIR, `processor_${getDateString()}.log`);
  try {
    await fs.promises.appendFile(logFile, logMessage, 'utf8');
  } catch (error) {
    console.error(`写入日志文件失败: ${error.message}`);
  }
}
// 获取当前日期字符串
function getDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
// 获取当前时间戳字符串
function getTimestampString() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}
// 获取数据库连接
function getDbConnection() {
  return dbPool;
}
// 处理原始数据
async function processRawData(rawData, clientInfo) {
  const processingId = getTimestampString();
  await log('INFO', `开始处理数据 [ID: ${processingId}] 来自客户端: ${clientInfo}`);
  try {
    const dataStorage = require('./data-storage');
    const dataValidator = require('./data-validator');   
    await dataStorage.saveRawData(rawData, processingId, clientInfo);
    const parsedData = await dataValidator.parseAndValidateData(rawData, processingId);
    await dataStorage.saveToDatabase(parsedData, processingId);
    await dataStorage.saveProcessedData(parsedData, processingId);
    await log('INFO', `数据处理完成 [ID: ${processingId}]`);
    return { success: true, processingId, data: parsedData };
  } catch (error) {
    await log('ERROR', `数据处理失败 [ID: ${processingId}]: ${error.message}`);
    return { success: false, processingId, error: error.message };
  }
}
// 关闭数据库连接池
async function closeDatabase() {
  if (dbPool) {
    try {
      await dbPool.end();
      await log('INFO', '数据库连接池已关闭');
    } catch (err) {
      await log('ERROR', `关闭数据库连接池失败: ${err.message}`);
    }
  }
}
// 导出数据处理器模块
module.exports = {
  initialize,
  log,
  getDateString,
  getTimestampString,
  getDbConnection,
  processRawData,
  closeDatabase,
  LOG_DIR,
  DATA_DIR,
  RAW_DATA_DIR,
  PROCESSED_DATA_DIR,
  VALID_FIRE_RISKS,
  VALID_ENV_STATUSES
};