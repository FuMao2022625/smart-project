/**
 * 配置管理模块
 * 提供统一的配置访问接口，支持从多个来源加载配置
 */

const dotenv = require('dotenv');
const path = require('path');

class ConfigManager {
  constructor() {
    this.config = {};
    this.loaded = false;
  }

  /**
   * 加载配置
   * @param {string} envPath - 环境变量文件路径
   */
  load(envPath = path.join(__dirname, '..', '.env')) {
    // 加载环境变量
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.warn('未找到 .env 文件，使用系统环境变量');
    }

    // 构建配置对象
    this.config = {
      // 服务器配置
      server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
      },

      // 数据库配置
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ai_project'
      },

      // JWT配置
      jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      },

      // Socket配置
      socket: {
        port: process.env.SOCKET_PORT || 443,
        host: process.env.SOCKET_HOST || '0.0.0.0',
        timeout: process.env.SOCKET_TIMEOUT || 300000
      },

      // Qwen API配置
      qwen: {
        apiKey: process.env.QWEN_API_KEY || '',
        apiHost: process.env.QWEN_API_HOST || '',
        openaiCompatible: process.env.QWEN_OPENAI_COMPATIBLE || '',
        dashScope: process.env.QWEN_DASH_SCOPE || '',
        workspaceName: process.env.QWEN_WORKSPACE_NAME || '默认业务空间',
        workspaceId: process.env.QWEN_WORKSPACE_ID || ''
      },

      // 安全配置
      security: {
        allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15分钟
          max: 100 // 每个IP在windowMs时间内最多100个请求
        }
      },

      // 缓存配置
      cache: {
        defaultTTL: 3600, // 默认缓存时间1小时
        checkperiod: 600 // 每10分钟检查一次过期缓存
      },

      // 监控配置
      monitoring: {
        responseTimeThreshold: 1000, // 响应时间阈值
        memoryUsageThreshold: 0.8, // 内存使用阈值
        cpuUsageThreshold: 1.0, // CPU负载阈值
        errorRateThreshold: 0.1 // 错误率阈值
      }
    };

    this.loaded = true;
    console.log('✓ 配置加载成功');
  }

  /**
   * 获取配置
   * @param {string} key - 配置键，支持点号分隔的路径
   * @param {any} defaultValue - 默认值
   * @returns {any} 配置值
   */
  get(key, defaultValue = undefined) {
    if (!this.loaded) {
      this.load();
    }

    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value === undefined || value === null) {
        return defaultValue;
      }
      value = value[k];
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * 设置配置
   * @param {string} key - 配置键，支持点号分隔的路径
   * @param {any} value - 配置值
   */
  set(key, value) {
    if (!this.loaded) {
      this.load();
    }

    const keys = key.split('.');
    let obj = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!obj[k]) {
        obj[k] = {};
      }
      obj = obj[k];
    }

    obj[keys[keys.length - 1]] = value;
    console.log(`✓ 更新配置: ${key} = ${value}`);
  }

  /**
   * 获取所有配置
   * @returns {object} 所有配置
   */
  getAll() {
    if (!this.loaded) {
      this.load();
    }
    return this.config;
  }

  /**
   * 重新加载配置
   */
  reload() {
    this.loaded = false;
    this.load();
  }
}

// 导出单例
module.exports = new ConfigManager();