const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor() {
    this.config = {};
    this.env = process.env.NODE_ENV || 'development';
    this.loadConfig();
  }

  loadConfig() {
    this.config = {
      server: {
        env: this.env,
        port: parseInt(process.env.PORT) || 8080
      },
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ai_project'
      },
      security: {
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
          max: parseInt(process.env.RATE_LIMIT_MAX) || 100
        },
        loginRateLimit: {
          windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 900000,
          max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5
        },
        allowedOrigins: process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(',')
          : ['*']
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      },
      cache: {
        enabled: process.env.CACHE_ENABLED !== 'false',
        ttl: parseInt(process.env.CACHE_TTL) || 3600,
        size: parseInt(process.env.CACHE_SIZE) || 5000
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        dir: process.env.LOG_DIR || './logs'
      },
      socket: {
        port: parseInt(process.env.SOCKET_PORT) || 8888,
        host: process.env.SOCKET_HOST || '0.0.0.0',
        timeout: parseInt(process.env.SOCKET_TIMEOUT) || 300000,
        maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 1000,
        batchProcessing: process.env.BATCH_PROCESSING_ENABLED === 'true',
        batchSize: parseInt(process.env.BATCH_SIZE) || 10,
        compression: process.env.COMPRESSION_ENABLED === 'true',
        errorRetryLimit: parseInt(process.env.ERROR_RETRY_LIMIT) || 3
      }
    };
  }

  get(path, defaultValue = null) {
    const keys = path.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value !== undefined ? value : defaultValue;
  }

  set(path, value) {
    const keys = path.split('.');
    let current = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  has(path) {
    const keys = path.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return false;
      }
    }

    return true;
  }

  getAll() {
    return { ...this.config };
  }

  reload() {
    this.loadConfig();
  }
}

const configManager = new ConfigManager();

module.exports = configManager;