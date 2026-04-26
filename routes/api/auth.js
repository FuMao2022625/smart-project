/**
 * 认证路由
 * 提供用户登录、注册、密码重置等功能
 */
const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../middlewares/auth');
const { validateRequest, loginSchema, userSchema } = require('../../middlewares/validator');
const { success, badRequest, unauthorized, notFound, error, asyncHandler } = require('../../utils/responseFormatter');
const winston = require('../../config/logger');

router.post('/login', validateRequest(loginSchema), asyncHandler(async (req, res) => {
  const { username, password, phone } = req.body;

  const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

  if (users.length === 0) {
    return unauthorized(res, '用户名或密码错误');
  }

  const user = users[0];
  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return unauthorized(res, '用户名或密码错误');
  }

  if (user.phone !== phone) {
    return unauthorized(res, '手机号错误');
  }

  await db.query('UPDATE users SET status = ? WHERE id = ?', ['active', user.id]);

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role_id === 1 ? 'admin' : 'user'
  });

  winston.info('用户登录成功:', { userId: user.id, username: user.username });

  return success(res, {
    token,
    userInfo: {
      id: user.id.toString(),
      username: user.username,
      role: user.role_id.toString(),
      avatar: null
    }
  }, '登录成功');
}));

router.post('/register', validateRequest(userSchema), asyncHandler(async (req, res) => {
  const { username, password, email, phone } = req.body;

  const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  if (existingUsers.length > 0) {
    return badRequest(res, '用户名已存在');
  }

  const [existingEmails] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existingEmails.length > 0) {
    return badRequest(res, '邮箱已被注册');
  }

  const [existingPhones] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
  if (existingPhones.length > 0) {
    return badRequest(res, '手机号已被注册');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let roleId = 1;
  try {
    const [anyRole] = await db.query('SELECT id FROM roles LIMIT 1');
    if (anyRole.length > 0) {
      roleId = anyRole[0].id;
    } else {
      try {
        const [newRole] = await db.query(
          'INSERT INTO roles (name, description) VALUES (?, ?)',
          ['user', '普通用户']
        );
        roleId = newRole.insertId;
      } catch (e1) {
        try {
          const [newRole] = await db.query(
            'INSERT INTO roles (role_name, description) VALUES (?, ?)',
            ['user', '普通用户']
          );
          roleId = newRole.insertId;
        } catch (e2) {
          roleId = 1;
        }
      }
    }
  } catch (roleError) {
    winston.warn('获取角色失败，使用默认值:', roleError.message);
    roleId = 1;
  }

  const [result] = await db.query(
    'INSERT INTO users (username, password_hash, phone, email, role_id, status) VALUES (?, ?, ?, ?, ?, ?)',
    [username, hashedPassword, phone, email, roleId, 'inactive']
  );

  winston.info('新用户注册:', { userId: result.insertId, username });

  return success(res, {
    userId: result.insertId.toString(),
    username
  }, '注册成功');
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return badRequest(res, '请求参数错误');
  }

  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

  if (users.length === 0) {
    return notFound(res, '用户不存在');
  }

  const tempPassword = Math.random().toString(36).substring(2, 10);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);

  winston.info('密码重置:', { email, tempPassword });

  return success(res, {
    temporaryPassword: tempPassword
  }, '密码重置成功，请使用临时密码登录');
}));

router.post('/refresh-token', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return unauthorized(res, '未提供令牌');
  }

  const { verifyToken } = require('../../middlewares/auth');
  const decoded = verifyToken(token);

  if (!decoded) {
    return unauthorized(res, '令牌无效或已过期');
  }

  const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

  if (users.length === 0) {
    return unauthorized(res, '用户不存在');
  }

  const user = users[0];
  const newToken = generateToken({
    id: user.id,
    email: user.email,
    role: user.role_id === 1 ? 'admin' : 'user'
  });

  return success(res, { token: newToken }, '令牌刷新成功');
}));

router.post('/logout', asyncHandler(async (req, res) => {
  winston.info('用户登出:', { userId: req.user?.id });
  return success(res, null, '登出成功');
}));

module.exports = router;
