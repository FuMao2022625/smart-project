const winston = require('../config/logger');

class SocketPoolManager {
  constructor() {
    this.pools = {
      default: {
        min: 5,
        max: 20,
        active: 0,
        idle: [],
        waiting: []
      },
      highPriority: {
        min: 3,
        max: 10,
        active: 0,
        idle: [],
        waiting: []
      },
      lowPriority: {
        min: 2,
        max: 5,
        active: 0,
        idle: []
      }
    };

    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      failedConnections: 0,
      closedConnections: 0,
      peakConnections: 0,
      avgConnectionTime: 0,
      connectionTimes: []
    };

    this.startMetricsCollection();
  }

  startMetricsCollection() {
    setInterval(() => {
      this.logMetrics();
    }, 60000);
  }

  logMetrics() {
    winston.info('Socket pool metrics', {
      pools: {
        default: {
          active: this.pools.default.active,
          idle: this.pools.default.idle.length,
          waiting: this.pools.default.waiting.length
        },
        highPriority: {
          active: this.pools.highPriority.active,
          idle: this.pools.highPriority.idle.length
        },
        lowPriority: {
          active: this.pools.lowPriority.active,
          idle: this.pools.lowPriority.idle.length
        }
      },
      metrics: this.metrics
    });
  }

  acquireConnection(priority = 'default') {
    const pool = this.pools[priority];

    if (!pool) {
      priority = 'default';
    }

    const currentPool = this.pools[priority];

    if (currentPool.idle.length > 0) {
      const connection = currentPool.idle.pop();
      currentPool.active++;
      this.metrics.activeConnections++;
      return Promise.resolve(connection);
    }

    if (currentPool.active < currentPool.max) {
      currentPool.active++;
      this.metrics.activeConnections++;
      this.metrics.totalConnections++;

      if (this.metrics.activeConnections > this.metrics.peakConnections) {
        this.metrics.peakConnections = this.metrics.activeConnections;
      }

      return Promise.resolve({ created: true, priority });
    }

    return new Promise((resolve) => {
      currentPool.waiting.push(resolve);
    });
  }

  releaseConnection(connection, priority = 'default') {
    const pool = this.pools[priority];

    if (!pool) {
      priority = 'default';
    }

    const currentPool = this.pools[priority];

    if (currentPool.waiting.length > 0) {
      const waiter = currentPool.waiting.shift();
      waiter(connection);
      return;
    }

    if (currentPool.active > currentPool.min) {
      currentPool.active--;
      this.metrics.activeConnections--;
      this.metrics.closedConnections++;
      return;
    }

    if (currentPool.idle.length < currentPool.max - currentPool.min) {
      currentPool.idle.push(connection);
    } else {
      currentPool.active--;
      this.metrics.activeConnections--;
      this.metrics.closedConnections++;
    }
  }

  getPoolStats(priority = null) {
    if (priority) {
      const pool = this.pools[priority];
      if (!pool) return null;

      return {
        priority,
        min: pool.min,
        max: pool.max,
        active: pool.active,
        idle: pool.idle.length,
        waiting: pool.waiting.length
      };
    }

    return Object.keys(this.pools).map(p => this.getPoolStats(p));
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeConnections: this.metrics.totalConnections - this.metrics.closedConnections,
      avgConnectionTime: this.metrics.connectionTimes.length > 0
        ? this.metrics.connectionTimes.reduce((a, b) => a + b, 0) / this.metrics.connectionTimes.length
        : 0
    };
  }

  resizePool(priority, min, max) {
    if (!this.pools[priority]) {
      return false;
    }

    this.pools[priority].min = min;
    this.pools[priority].max = max;

    winston.info(`Socket pool resized: ${priority}`, { min, max });

    return true;
  }

  cleanup() {
    for (const priority in this.pools) {
      const pool = this.pools[priority];

      while (pool.idle.length > 0 && pool.active > pool.min) {
        pool.idle.pop();
        pool.active--;
        this.metrics.closedConnections++;
        this.metrics.activeConnections--;
      }
    }

    winston.info('Socket pool cleanup completed');
  }
}

class SocketMetricsCollector {
  constructor() {
    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      avgResponseTime: 0,
      responseTimes: [],
      errors: 0,
      reconnections: 0
    };

    this.startPeriodicReport();
  }

  startPeriodicReport() {
    setInterval(() => {
      this.logMetrics();
    }, 60000);
  }

  recordMessage(direction, size = 0) {
    if (direction === 'received') {
      this.metrics.messagesReceived++;
      this.metrics.bytesReceived += size;
    } else {
      this.metrics.messagesSent++;
      this.metrics.bytesSent += size;
    }
  }

  recordResponseTime(time) {
    this.metrics.responseTimes.push(time);

    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }

    const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
    this.metrics.avgResponseTime = sum / this.metrics.responseTimes.length;
  }

  recordError() {
    this.metrics.errors++;
  }

  recordReconnection() {
    this.metrics.reconnections++;
  }

  logMetrics() {
    winston.info('Socket metrics', {
      messages: {
        received: this.metrics.messagesReceived,
        sent: this.metrics.messagesSent
      },
      bandwidth: {
        received: (this.metrics.bytesReceived / 1024).toFixed(2) + ' KB',
        sent: (this.metrics.bytesSent / 1024).toFixed(2) + ' KB'
      },
      performance: {
        avgResponseTime: this.metrics.avgResponseTime.toFixed(2) + ' ms'
      },
      reliability: {
        errors: this.metrics.errors,
        reconnections: this.metrics.reconnections
      }
    });
  }

  getMetrics() {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      avgResponseTime: 0,
      responseTimes: [],
      errors: 0,
      reconnections: 0
    };
  }
}

const socketPoolManager = new SocketPoolManager();
const socketMetricsCollector = new SocketMetricsCollector();

module.exports = {
  SocketPoolManager,
  SocketMetricsCollector,
  socketPoolManager,
  socketMetricsCollector
};