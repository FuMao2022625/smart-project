/**
 * 数据库配置模块
 * 使用配置管理系统获取数据库配置
 */
const mysql = require('mysql2');
const winston = require('./logger');
const configManager = require('./configManager');

// 从配置管理系统获取数据库配置
const dbConfig = configManager.get('database', {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ai_project'
});

const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_SIZE) || 20,
  queueLimit: 200,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000,
  connectTimeout: 15000,
  idleTimeout: 60000,
  maxIdle: 10,
  multipleStatements: false,
  namedPlaceholders: true,
  dateStrings: true,
  timezone: '+00:00',
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: false,
  flags: ['-FOUND_ROWS']
});

pool.on('connection', (connection) => {
  winston.debug('数据库连接创建:', { threadId: connection.threadId });
  connection.query('SET SESSION sql_mode = "TRADITIONAL"');
  connection.query('SET SESSION time_zone = "+00:00"');
  connection.query('SET SESSION wait_timeout = 28800');
  connection.query('SET SESSION interactive_timeout = 28800');
  connection.query('SET SESSION max_execution_time = 30000');
  connection.query('SET SESSION optimizer_switch = "index_merge=on,index_merge_union=on,index_merge_sort_union=on,index_merge_intersection=on"');
});

pool.on('acquire', (connection) => {
  winston.debug('数据库连接获取:', { threadId: connection.threadId });
});

pool.on('release', (connection) => {
  winston.debug('数据库连接释放:', { threadId: connection.threadId });
});

pool.on('enqueue', () => {
  winston.warn('数据库连接队列等待');
});

pool.on('error', (err) => {
  winston.error('数据库连接池错误:', { error: err.message });
});

const promisePool = pool.promise();

module.exports = promisePool;
