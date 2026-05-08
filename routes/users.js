/**
 * 用户管理路由
 * 提供用户列表、查看等功能（微信/QQ扫码登录用户管理）
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { success, paginated, badRequest, notFound, error, asyncHandler } = require('../utils/responseFormatter');
const { authenticateToken, authorize } = require('../middlewares/auth');
const { validateQuery, paginationSchema } = require('../middlewares/validator');
const winston = require('../config/logger');

const formatDateToISO = (date) => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  return new Date(date).toISOString();
};

router.get('/', authenticateToken, authorize(['admin']), validateQuery(paginationSchema), asyncHandler(async (req, res) => {
  const { page, pageSize, role, status, keyword } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (role) {
    whereClause += ' AND role_id = ?';
    params.push(role);
  }
  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }
  if (keyword) {
    whereClause += ' AND (username LIKE ? OR nickname LIKE ? OR email LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  const offset = (page - 1) * pageSize;

  const [rows] = await db.query(
    `SELECT id as userId, username, nickname, avatar, email, phone, role_id as role, status,
            wechat_openid, qq_openid, bind_status, last_login_time as lastLogin, create_time as createdAt
     FROM users
     ${whereClause}
     ORDER BY create_time DESC
     LIMIT ? OFFSET ?`,
    [...params, parseInt(pageSize), offset]
  );

  const [countResult] = await db.query(
    `SELECT COUNT(*) as total FROM users ${whereClause}`,
    params
  );

  const total = countResult[0].total;

  winston.info('获取用户列表:', { adminId: req.user.id, total, page, pageSize });

  return paginated(res, {
    items: rows.map(row => ({
      userId: row.userId.toString(),
      username: row.username,
      nickname: row.nickname,
      avatar: row.avatar,
      email: row.email,
      phone: row.phone,
      role: row.role.toString(),
      status: row.status,
      bindStatus: row.bind_status,
      lastLogin: formatDateToISO(row.lastLogin),
      createdAt: formatDateToISO(row.createdAt)
    })),
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  });
}));

router.get('/:userId', authenticateToken, authorize(['admin']), asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const [users] = await db.query(
    `SELECT id as userId, username, nickname, avatar, email, phone, role_id as role, status,
            wechat_openid, qq_openid, bind_status, last_login_time as lastLogin, create_time as createdAt
     FROM users WHERE id = ?`,
    [userId]
  );

  if (users.length === 0) {
    return notFound(res, '用户不存在');
  }

  const user = users[0];

  return success(res, {
    userId: user.userId.toString(),
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    email: user.email,
    phone: user.phone,
    role: user.role.toString(),
    status: user.status,
    wechatBound: !!user.wechat_openid,
    qqBound: !!user.qq_openid,
    bindStatus: user.bind_status,
    lastLogin: formatDateToISO(user.lastLogin),
    createdAt: formatDateToISO(user.createdAt)
  });
}));

router.put('/:userId', authenticateToken, authorize(['admin']), asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { nickname, avatar, phone, email, role, status } = req.body;

  const [existingUsers] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  if (existingUsers.length === 0) {
    return notFound(res, '用户不存在');
  }

  const updates = [];
  const params = [];

  if (nickname !== undefined) {
    updates.push('nickname = ?');
    params.push(nickname);
  }
  if (avatar !== undefined) {
    updates.push('avatar = ?');
    params.push(avatar);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    params.push(phone);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    params.push(email);
  }
  if (role !== undefined) {
    updates.push('role_id = ?');
    params.push(role);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }

  if (updates.length === 0) {
    return badRequest(res, '没有需要更新的字段');
  }

  params.push(userId);
  await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

  winston.info('更新用户:', { adminId: req.user.id, userId });

  return success(res, { userId }, '用户信息更新成功');
}));

router.delete('/:userId', authenticateToken, authorize(['admin']), asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const [existingUsers] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  if (existingUsers.length === 0) {
    return notFound(res, '用户不存在');
  }

  await db.query('DELETE FROM users WHERE id = ?', [userId]);

  winston.info('删除用户:', { adminId: req.user.id, userId });

  return success(res, null, '用户删除成功');
}));

module.exports = router;