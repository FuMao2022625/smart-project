/**
 * 用户管理路由
 * 提供用户列表、创建、更新、删除等功能
 */
const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const { success, paginated, badRequest, notFound, error, asyncHandler } = require('../../utils/responseFormatter');
const { authenticateToken, authorize } = require('../../middlewares/auth');
const { validateRequest, validateQuery, userSchema, paginationSchema } = require('../../middlewares/validator');
const winston = require('../../config/logger');

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
    whereClause += ' AND (username LIKE ? OR email LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  const offset = (page - 1) * pageSize;

  const [rows] = await db.query(
    `SELECT id as userId, username, email, role_id as role, status, last_login_time as lastLogin, create_time as createdAt
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
      email: row.email,
      role: row.role.toString(),
      status: row.status,
      lastLogin: formatDateToISO(row.lastLogin),
      createdAt: formatDateToISO(row.createdAt)
    })),
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  });
}));

router.post('/', authenticateToken, authorize(['admin']), validateRequest(userSchema), asyncHandler(async (req, res) => {
  const { username, email, password, phone, role, status } = req.body;

  const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  if (existingUsers.length > 0) {
    return badRequest(res, '用户名已存在');
  }

  const [existingEmails] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existingEmails.length > 0) {
    return badRequest(res, '邮箱已被注册');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let roleId = 1;
  try {
    const [anyRole] = await db.query('SELECT id FROM roles LIMIT 1');
    if (anyRole.length > 0) {
      roleId = anyRole[0].id;
    }
  } catch (roleError) {
    winston.warn('获取角色失败，使用默认值:', roleError.message);
    roleId = 1;
  }

  const [result] = await db.query(
    'INSERT INTO users (username, email, password_hash, phone, role_id, status) VALUES (?, ?, ?, ?, ?, ?)',
    [username, email, hashedPassword, phone, roleId, status === 'online' ? 'active' : (status === 'offline' ? 'inactive' : status)]
  );

  winston.info('创建用户:', { adminId: req.user.id, newUserId: result.insertId, username });

  return success(res, {
    userId: result.insertId.toString(),
    username
  }, '用户添加成功');
}));

router.put('/:userId', authenticateToken, authorize(['admin']), asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { username, email, phone, role, status } = req.body;

  if (!username || !email || !phone) {
    return badRequest(res, '请求参数错误');
  }

  const [existingUsers] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  if (existingUsers.length === 0) {
    return notFound(res, '用户不存在');
  }

  const [existingUsernames] = await db.query('SELECT * FROM users WHERE username = ? AND id != ?', [username, userId]);
  if (existingUsernames.length > 0) {
    return badRequest(res, '用户名已存在');
  }

  const [existingEmails] = await db.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
  if (existingEmails.length > 0) {
    return badRequest(res, '邮箱已被注册');
  }

  await db.query(
    'UPDATE users SET username = ?, email = ?, phone = ?, role_id = ?, status = ? WHERE id = ?',
    [username, email, phone, role || 1, status, userId]
  );

  winston.info('更新用户:', { adminId: req.user.id, userId, username });

  return success(res, { userId, username }, '用户信息更新成功');
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

router.post('/:userId/reset-password', authenticateToken, authorize(['admin']), asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return badRequest(res, '请提供新密码');
  }

  const [existingUsers] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  if (existingUsers.length === 0) {
    return notFound(res, '用户不存在');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

  winston.info('重置用户密码:', { adminId: req.user.id, userId });

  return success(res, null, '密码重置成功');
}));

router.get('/:userId', authenticateToken, authorize(['admin']), asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const [users] = await db.query(
    'SELECT id as userId, username, email, role_id as role, status, last_login_time as lastLogin, create_time as createdAt FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return notFound(res, '用户不存在');
  }

  const user = users[0];

  return success(res, {
    userId: user.userId.toString(),
    username: user.username,
    email: user.email,
    role: user.role.toString(),
    status: user.status,
    lastLogin: formatDateToISO(user.lastLogin),
    createdAt: formatDateToISO(user.createdAt)
  });
}));

module.exports = router;
