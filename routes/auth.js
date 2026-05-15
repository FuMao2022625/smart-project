/**
 * 认证路由
 * 支持手机号密码登录
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../middlewares/auth');
const { success, badRequest, unauthorized, notFound, error, asyncHandler } = require('../utils/responseFormatter');
const winston = require('../config/logger');

/**
 * 用户注册 - 手机号密码注册
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { phone_number, password, nickname } = req.body;

  if (!phone_number || !password) {
    return badRequest(res, '手机号和密码不能为空');
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone_number)) {
    return badRequest(res, '请输入有效的手机号码');
  }

  if (password.length < 6) {
    return badRequest(res, '密码长度至少6位');
  }

  const [existingUsers] = await db.query('SELECT id FROM users WHERE phone_number = ?', [phone_number]);
  if (existingUsers.length > 0) {
    return badRequest(res, '该手机号已被注册');
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await db.query(
      `INSERT INTO users (username, nickname, phone_number, password, role_id, status, bind_status, create_time)
       VALUES (?, ?, ?, ?, 1, 'active', '{"wechat": false, "qq": false}', NOW())`,
      [phone_number, nickname || phone_number, phone_number, hashedPassword]
    );

    const [users] = await db.query('SELECT id, username, nickname, phone_number, status, create_time FROM users WHERE id = ?', [result.insertId]);
    const user = users[0];

    const token = generateToken({
      id: user.id,
      phone_number: user.phone_number,
      type: 'password'
    });

    winston.info('用户注册成功', { userId: user.id, phone_number });

    return success(res, {
      token,
      userInfo: {
        id: user.id.toString(),
        username: user.username,
        nickname: user.nickname,
        phone_number: user.phone_number,
        isNewUser: true
      }
    }, '注册成功');

  } catch (err) {
    winston.error('用户注册失败', { phone_number, error: err.message });
    return error(res, '注册失败');
  }
}));

/**
 * 用户登录 - 手机号密码登录
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { phone_number, password } = req.body;

  if (!phone_number || !password) {
    return badRequest(res, '手机号和密码不能为空');
  }

  try {
    const [users] = await db.query(
      'SELECT id, username, nickname, phone_number, password, status, bind_status FROM users WHERE phone_number = ?',
      [phone_number]
    );

    if (users.length === 0) {
      return unauthorized(res, '手机号或密码错误');
    }

    const user = users[0];

    if (user.status !== 'active') {
      return unauthorized(res, '用户账号已被禁用');
    }

    if (!user.password) {
      return unauthorized(res, '该账号未设置密码');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      winston.warn('密码验证失败', { userId: user.id, phone_number });
      return unauthorized(res, '手机号或密码错误');
    }

    await db.query('UPDATE users SET last_login_time = NOW(), last_login_ip = ? WHERE id = ?', [req.ip, user.id]);

    const token = generateToken({
      id: user.id,
      phone_number: user.phone_number,
      type: 'password'
    });

    winston.info('用户登录成功', { userId: user.id, phone_number, loginType: 'password' });

    return success(res, {
      token,
      userInfo: {
        id: user.id.toString(),
        username: user.username,
        nickname: user.nickname,
        phone_number: user.phone_number,
        bindStatus: user.bind_status,
        isNewUser: false
      }
    }, '登录成功');

  } catch (err) {
    winston.error('用户登录失败', { phone_number, error: err.message });
    return error(res, '登录失败');
  }
}));

/**
 * 发送验证码
 */
router.post('/send-code', asyncHandler(async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return badRequest(res, '手机号不能为空');
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone_number)) {
    return badRequest(res, '请输入有效的手机号码');
  }

  const [users] = await db.query('SELECT id FROM users WHERE phone_number = ?', [phone_number]);
  if (users.length === 0) {
    return notFound(res, '该手机号未注册');
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  console.log(`【验证码】您的验证码是：${verificationCode}，有效期5分钟。`);

  winston.info('发送验证码', { phone_number, code: verificationCode });

  return success(res, { phone_number, expires_in: 300 }, '验证码已发送');
}));

/**
 * 重置密码
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { phone_number, code, new_password } = req.body;

  if (!phone_number || !code || !new_password) {
    return badRequest(res, '手机号、验证码和新密码不能为空');
  }

  if (new_password.length < 6) {
    return badRequest(res, '密码长度至少6位');
  }

  const [users] = await db.query('SELECT id, username FROM users WHERE phone_number = ?', [phone_number]);
  if (users.length === 0) {
    return notFound(res, '该手机号未注册');
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    await db.query('UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expire = NULL WHERE phone_number = ?', [hashedPassword, phone_number]);

    const user = users[0];
    winston.info('密码重置成功', { userId: user.id, phone_number });

    return success(res, null, '密码重置成功');

  } catch (err) {
    winston.error('密码重置失败', { phone_number, error: err.message });
    return error(res, '密码重置失败');
  }
}));

/**
 * 修改密码
 */
router.post('/change-password', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return unauthorized(res, '未登录');
  }

  const { verifyToken } = require('../middlewares/auth');
  const decoded = verifyToken(token);

  if (!decoded) {
    return unauthorized(res, '令牌无效');
  }

  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return badRequest(res, '旧密码和新密码不能为空');
  }

  if (new_password.length < 6) {
    return badRequest(res, '新密码长度至少6位');
  }

  try {
    const [users] = await db.query('SELECT id, password FROM users WHERE id = ?', [decoded.id]);

    if (users.length === 0) {
      return notFound(res, '用户不存在');
    }

    const user = users[0];

    if (!user.password) {
      return badRequest(res, '当前账号未设置密码');
    }

    const isPasswordValid = await bcrypt.compare(old_password, user.password);

    if (!isPasswordValid) {
      return unauthorized(res, '旧密码错误');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

    winston.info('密码修改成功', { userId: user.id });

    return success(res, null, '密码修改成功');

  } catch (err) {
    winston.error('密码修改失败', { userId: decoded.id, error: err.message });
    return error(res, '密码修改失败');
  }
}));

/**
 * 刷新令牌
 */
router.post('/refresh-token', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return unauthorized(res, '未提供令牌');
  }

  const { verifyToken } = require('../middlewares/auth');
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
    phone_number: decoded.phone_number,
    type: decoded.type
  });

  return success(res, { token: newToken }, '令牌刷新成功');
}));

/**
 * 登出
 */
router.post('/logout', asyncHandler(async (req, res) => {
  winston.info('用户登出:', { userId: req.user?.id });
  return success(res, null, '登出成功');
}));

module.exports = router;