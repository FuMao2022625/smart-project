const db = require('../config/db');
const winston = require('../config/logger');
const CryptoUtils = require('./cryptoUtils');

class AuditLogger {
  static async log(action, resourceType, resourceId, userId, details = {}, req = null) {
    try {
      const ipAddress = req ? (req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress) : null;
      const userAgent = req ? req.headers['user-agent'] : null;

      const sanitizedDetails = CryptoUtils.maskSensitiveData(details);

      await db.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, details, create_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId || null,
          action,
          resourceType,
          resourceId || null,
          ipAddress,
          userAgent,
          JSON.stringify(sanitizedDetails)
        ]
      );

      winston.info('Audit log created', {
        action,
        resourceType,
        resourceId,
        userId,
        ipAddress
      });
    } catch (error) {
      winston.error('Failed to create audit log', {
        error: error.message,
        action,
        resourceType,
        resourceId
      });
    }
  }

  static async logLogin(userId, username, success, req, reason = null) {
    await this.log(
      success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      'authentication',
      null,
      userId,
      {
        username,
        reason,
        success
      },
      req
    );
  }

  static async logLogout(userId, req) {
    await this.log('LOGOUT', 'authentication', null, userId, {}, req);
  }

  static async logPermissionDenied(userId, resourceType, resourceId, requiredPermission, req) {
    await this.log(
      'PERMISSION_DENIED',
      resourceType,
      resourceId,
      userId,
      {
        requiredPermission,
        ip: req ? req.ip : null
      },
      req
    );
  }

  static async logDataAccess(userId, resourceType, resourceId, action, req) {
    await this.log(action, resourceType, resourceId, userId, {}, req);
  }

  static async logDataModification(userId, resourceType, resourceId, action, oldData, newData, req) {
    await this.log(
      action,
      resourceType,
      resourceId,
      userId,
      {
        oldData: CryptoUtils.maskSensitiveData(oldData),
        newData: CryptoUtils.maskSensitiveData(newData)
      },
      req
    );
  }

  static async logSecurityEvent(userId, eventType, details, req) {
    await this.log(
      eventType,
      'security',
      null,
      userId,
      details,
      req
    );
  }

  static async getAuditLogs(filters = {}, pagination = { page: 1, pageSize: 20 }) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.userId) {
        whereClause += ' AND user_id = ?';
        params.push(filters.userId);
      }

      if (filters.action) {
        whereClause += ' AND action = ?';
        params.push(filters.action);
      }

      if (filters.resourceType) {
        whereClause += ' AND resource_type = ?';
        params.push(filters.resourceType);
      }

      if (filters.startDate) {
        whereClause += ' AND create_time >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        whereClause += ' AND create_time <= ?';
        params.push(filters.endDate);
      }

      const offset = (pagination.page - 1) * pagination.pageSize;

      const [rows] = await db.query(
        `SELECT id, user_id, action, resource_type, resource_id, ip_address, user_agent, details, create_time
         FROM audit_logs
         ${whereClause}
         ORDER BY create_time DESC
         LIMIT ? OFFSET ?`,
        [...params, pagination.pageSize, offset]
      );

      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
        params
      );

      return {
        items: rows,
        total: countResult[0].total,
        page: pagination.page,
        pageSize: pagination.pageSize
      };
    } catch (error) {
      winston.error('Failed to retrieve audit logs', { error: error.message });
      throw error;
    }
  }

  info(message, data = {}) {
    winston.info(message, data);
  }

  error(message, data = {}) {
    winston.error(message, data);
  }

  warn(message, data = {}) {
    winston.warn(message, data);
  }

  debug(message, data = {}) {
    winston.debug(message, data);
  }
}

const auditLoggerInstance = new AuditLogger();

module.exports = {
  AuditLogger,
  auditLogger: auditLoggerInstance
};