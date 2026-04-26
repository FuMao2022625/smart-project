const db = require('../config/db');
const winston = require('../config/logger');

class QueryOptimizer {
  static async analyzeSlowQueries(threshold = 1000) {
    try {
      const [results] = await db.query(`
        SELECT
          digest_text as query,
          count_star as exec_count,
          avg_timer_wait / 1000000000 as avg_time_sec,
          sum_timer_wait / 1000000000 as total_time_sec,
          first_seen as first_seen,
          last_seen as last_seen
        FROM performance_schema.events_statements_summary_by_digest
        WHERE avg_timer_wait / 1000000000 > ?
        ORDER BY avg_timer_wait DESC
        LIMIT 20
      `, [threshold]);

      winston.info('Slow query analysis completed', { count: results.length });

      return results;
    } catch (error) {
      winston.error('Failed to analyze slow queries', { error: error.message });
      return [];
    }
  }

  static async getTableStats() {
    try {
      const [results] = await db.query(`
        SELECT
          table_name as tableName,
          table_rows as rowCount,
          data_length / 1024 / 1024 as dataSizeMB,
          index_length / 1024 / 1024 as indexSizeMB,
          (data_length + index_length) / 1024 / 1024 as totalSizeMB
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        ORDER BY (data_length + index_length) DESC
      `);

      return results;
    } catch (error) {
      winston.error('Failed to get table stats', { error: error.message });
      return [];
    }
  }

  static async getIndexUsage() {
    try {
      const [results] = await db.query(`
        SELECT
          object_schema as schemaName,
          object_name as tableName,
          index_name as indexName,
          cardinality,
          stat_updated as lastUpdated
        FROM mysql.innodb_index_stats
        WHERE stat_name = 'size_leaf_nodes'
        ORDER BY tableName, indexName
      `);

      return results;
    } catch (error) {
      winston.error('Failed to get index usage', { error: error.message });
      return [];
    }
  }

  static async recommendIndexes() {
    try {
      const recommendations = [];

      const [slowQueries] = await db.query(`
        SELECT
          digest_text,
          count_star,
          avg_timer_wait
        FROM performance_schema.events_statements_summary_by_digest
        WHERE avg_timer_wait / 1000000000 > 0.1
        AND digest_text NOT LIKE '%performance_schema%'
        ORDER BY avg_timer_wait DESC
        LIMIT 10
      `);

      for (const query of slowQueries) {
        const queryText = query.digest_text.toLowerCase();

        if (queryText.includes('where') && !queryText.includes('index')) {
          const tableMatch = queryText.match(/from\s+(\w+)/);
          if (tableMatch) {
            recommendations.push({
              table: tableMatch[1],
              query: queryText,
              reason: 'Slow query without index hint',
              priority: query.avg_timer_wait > 1000000000 ? 'high' : 'medium'
            });
          }
        }
      }

      winston.info('Index recommendations generated', { count: recommendations.length });

      return recommendations;
    } catch (error) {
      winston.error('Failed to recommend indexes', { error: error.message });
      return [];
    }
  }

  static async optimizeTable(tableName) {
    try {
      await db.query(`OPTIMIZE TABLE ${tableName}`);
      winston.info(`Table optimized: ${tableName}`);
      return true;
    } catch (error) {
      winston.error(`Failed to optimize table: ${tableName}`, { error: error.message });
      return false;
    }
  }

  static async analyzeTable(tableName) {
    try {
      await db.query(`ANALYZE TABLE ${tableName}`);
      winston.info(`Table analyzed: ${tableName}`);
      return true;
    } catch (error) {
      winston.error(`Failed to analyze table: ${tableName}`, { error: error.message });
      return false;
    }
  }

  static async checkUnusedIndexes() {
    try {
      const [results] = await db.query(`
        SELECT
          object_schema as schemaName,
          object_name as tableName,
          index_name as indexName
        FROM performance_schema.table_io_waits_summary_by_index_usage
        WHERE index_name IS NOT NULL
        AND count_star = 0
        AND object_schema = DATABASE()
      `);

      return results;
    } catch (error) {
      winston.error('Failed to check unused indexes', { error: error.message });
      return [];
    }
  }
}

class ConnectionPoolOptimizer {
  static async getPoolStats() {
    try {
      const pool = require('../config/db').pool;

      return {
        totalConnections: pool.pool?._allConnections?.length || 0,
        freeConnections: pool.pool?._freeConnections?.length || 0,
        pendingRequests: pool.pool?._connectionQueue?.length || 0,
        maxConnections: pool.pool?._maxConnections || 0
      };
    } catch (error) {
      winston.error('Failed to get pool stats', { error: error.message });
      return null;
    }
  }

  static async testConnection() {
    const startTime = Date.now();
    try {
      const conn = await db.getConnection();
      const latency = Date.now() - startTime;
      conn.release();

      return {
        success: true,
        latency
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async optimizePoolSettings() {
    try {
      await db.query('SET GLOBAL innodb_buffer_pool_size = ?', [
        Math.floor(require('os').totalmem() * 0.7)
      ]);

      await db.query('SET GLOBAL max_connections = ?', [200]);

      await db.query('SET GLOBAL wait_timeout = ?', [28800]);

      await db.query('SET GLOBAL interactive_timeout = ?', [28800]);

      winston.info('Database pool settings optimized');

      return true;
    } catch (error) {
      winston.error('Failed to optimize pool settings', { error: error.message });
      return false;
    }
  }
}

module.exports = {
  QueryOptimizer,
  ConnectionPoolOptimizer
};