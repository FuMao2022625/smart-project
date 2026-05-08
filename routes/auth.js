/**
 * 认证路由
 * 仅支持微信扫码登录和QQ扫码登录
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/db');
const { generateToken } = require('../middlewares/auth');
const { success, badRequest, unauthorized, notFound, error, asyncHandler } = require('../utils/responseFormatter');
const winston = require('../config/logger');
const configManager = require('../config/configManager');

const WECHAT_APPID = configManager.get('oauth.wechat.appId');
const WECHAT_APPSECRET = configManager.get('oauth.wechat.appSecret');
const WECHAT_CALLBACK_URL = configManager.get('oauth.wechat.callbackUrl');

const QQ_APPID = configManager.get('oauth.qq.appId');
const QQ_APPKEY = configManager.get('oauth.qq.appKey');
const QQ_CALLBACK_URL = configManager.get('oauth.qq.callbackUrl');

router.get('/wechat/url', asyncHandler(async (req, res) => {
  const redirect_uri = encodeURIComponent(WECHAT_CALLBACK_URL);
  const state = Math.random().toString(36).substring(2);
  const authUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APPID}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

  winston.info('生成微信授权URL', { state });

  return success(res, { url: authUrl, state }, '获取微信授权URL成功');
}));

router.post('/wechat/callback', asyncHandler(async (req, res) => {
  const { code, state } = req.body;

  if (!code) {
    return badRequest(res, '授权码不能为空');
  }

  try {
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}&code=${code}&grant_type=authorization_code`;
    const tokenResponse = await axios.get(tokenUrl);
    const { access_token, openid, unionid, scope } = tokenResponse.data;

    if (!openid) {
      return unauthorized(res, '微信授权失败');
    }

    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`;
    let userInfo = { nickname: '微信用户', headimgurl: null };

    try {
      const userInfoResponse = await axios.get(userInfoUrl);
      userInfo = userInfoResponse.data;
    } catch (e) {
      winston.warn('获取微信用户信息失败', { openid, error: e.message });
    }

    let [existingUsers] = await db.query('SELECT * FROM users WHERE wechat_openid = ?', [openid]);

    let user;
    let isNewUser = false;

    if (existingUsers.length === 0) {
      const [result] = await db.query(
        `INSERT INTO users (username, nickname, avatar, wechat_openid, wechat_unionid, role_id, status, bind_status, last_login_time)
         VALUES (?, ?, ?, ?, ?, 1, 'active', '{"wechat": true, "qq": false}', NOW())`,
        [userInfo.nickname || `wechat_${openid.substring(0, 8)}`, userInfo.nickname || null, userInfo.headimgurl || null, openid, unionid || null]
      );

      [existingUsers] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      isNewUser = true;
    }

    user = existingUsers[0];

    await db.query('UPDATE users SET last_login_time = NOW() WHERE id = ?', [user.id]);

    const token = generateToken({
      id: user.id,
      openid: openid,
      type: 'wechat'
    });

    winston.info('微信用户登录成功', { userId: user.id, openid, isNewUser });

    return success(res, {
      token,
      userInfo: {
        id: user.id.toString(),
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        bindStatus: user.bind_status,
        isNewUser
      }
    }, isNewUser ? '注册成功' : '登录成功');

  } catch (error) {
    winston.error('微信登录失败', { code, error: error.message });
    return unauthorized(res, '微信授权失败');
  }
}));

router.get('/qq/url', asyncHandler(async (req, res) => {
  const redirect_uri = encodeURIComponent(QQ_CALLBACK_URL);
  const state = Math.random().toString(36).substring(2);
  const authUrl = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${QQ_APPID}&redirect_uri=${redirect_uri}&state=${state}`;

  winston.info('生成QQ授权URL', { state });

  return success(res, { url: authUrl, state }, '获取QQ授权URL成功');
}));

router.post('/qq/callback', asyncHandler(async (req, res) => {
  const { code, state } = req.body;

  if (!code) {
    return badRequest(res, '授权码不能为空');
  }

  try {
    const tokenUrl = `https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${QQ_APPID}&client_secret=${QQ_APPKEY}&code=${code}&redirect_uri=${encodeURIComponent(QQ_CALLBACK_URL)}`;
    const tokenResponse = await axios.get(tokenUrl);
    const params = new URLSearchParams(tokenResponse.data);
    const access_token = params.get('access_token');
    const openid = params.get('openid');

    if (!openid || !access_token) {
      return unauthorized(res, 'QQ授权失败');
    }

    const userInfoUrl = `https://graph.qq.com/oauth2.0/me?access_token=${access_token}`;
    let unionid = null;

    try {
      const meResponse = await axios.get(userInfoUrl);
      const meData = JSON.parse(meResponse.data.replace('callback(', '').replace(')', ''));
      unionid = meData.unionid;
    } catch (e) {
      winston.warn('获取QQ UnionID失败', { openid });
    }

    const infoUrl = `https://graph.qq.com/user/get_user_info?access_token=${access_token}&oauth_consumer_key=${QQ_APPID}&openid=${openid}`;
    let userInfo = { nickname: 'QQ用户', figureurl_qq_2: null };

    try {
      const infoResponse = await axios.get(infoUrl);
      userInfo = infoResponse.data;
    } catch (e) {
      winston.warn('获取QQ用户信息失败', { openid, error: e.message });
    }

    let [existingUsers] = await db.query('SELECT * FROM users WHERE qq_openid = ?', [openid]);

    let user;
    let isNewUser = false;

    if (existingUsers.length === 0) {
      const [result] = await db.query(
        `INSERT INTO users (username, nickname, avatar, qq_openid, qq_unionid, role_id, status, bind_status, last_login_time)
         VALUES (?, ?, ?, ?, ?, 1, 'active', '{"wechat": false, "qq": true}', NOW())`,
        [userInfo.nickname || `qq_${openid.substring(0, 8)}`, userInfo.nickname || null, userInfo.figureurl_qq_2 || null, openid, unionid || null]
      );

      [existingUsers] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      isNewUser = true;
    }

    user = existingUsers[0];

    await db.query('UPDATE users SET last_login_time = NOW() WHERE id = ?', [user.id]);

    const token = generateToken({
      id: user.id,
      openid: openid,
      type: 'qq'
    });

    winston.info('QQ用户登录成功', { userId: user.id, openid, isNewUser });

    return success(res, {
      token,
      userInfo: {
        id: user.id.toString(),
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        bindStatus: user.bind_status,
        isNewUser
      }
    }, isNewUser ? '注册成功' : '登录成功');

  } catch (error) {
    winston.error('QQ登录失败', { code, error: error.message });
    return unauthorized(res, 'QQ授权失败');
  }
}));

router.get('/bind/status', asyncHandler(async (req, res) => {
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

  const [users] = await db.query('SELECT wechat_openid, qq_openid FROM users WHERE id = ?', [decoded.id]);

  if (users.length === 0) {
    return notFound(res, '用户不存在');
  }

  const user = users[0];

  return success(res, {
    wechat: !!user.wechat_openid,
    qq: !!user.qq_openid
  }, '获取绑定状态成功');
}));

router.post('/bind/:provider', asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const { code } = req.body;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return unauthorized(res, '未登录');
  }

  if (!['wechat', 'qq'].includes(provider)) {
    return badRequest(res, '不支持的第三方登录类型');
  }

  if (!code) {
    return badRequest(res, '授权码不能为空');
  }

  const { verifyToken } = require('../middlewares/auth');
  const decoded = verifyToken(token);

  if (!decoded) {
    return unauthorized(res, '令牌无效');
  }

  try {
    let openid, unionid, nickname, avatar;

    if (provider === 'wechat') {
      const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}&code=${code}&grant_type=authorization_code`;
      const tokenResponse = await axios.get(tokenUrl);
      openid = tokenResponse.data.openid;
      unionid = tokenResponse.data.unionid;

      const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenResponse.data.access_token}&openid=${openid}`;
      try {
        const userInfoResponse = await axios.get(userInfoUrl);
        nickname = userInfoResponse.data.nickname;
        avatar = userInfoResponse.data.headimgurl;
      } catch (e) {}
    } else {
      const tokenUrl = `https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${QQ_APPID}&client_secret=${QQ_APPKEY}&code=${code}&redirect_uri=${encodeURIComponent(QQ_CALLBACK_URL)}`;
      const tokenResponse = await axios.get(tokenUrl);
      const params = new URLSearchParams(tokenResponse.data);
      const access_token = params.get('access_token');
      openid = params.get('openid');

      const meResponse = await axios.get(`https://graph.qq.com/oauth2.0/me?access_token=${access_token}`);
      const meData = JSON.parse(meResponse.data.replace('callback(', '').replace(')', ''));
      unionid = meData.unionid;

      const infoResponse = await axios.get(`https://graph.qq.com/user/get_user_info?access_token=${access_token}&oauth_consumer_key=${QQ_APPID}&openid=${openid}`);
      nickname = infoResponse.data.nickname;
      avatar = infoResponse.data.figureurl_qq_2;
    }

    const [existingUsers] = await db.query(
      provider === 'wechat'
        ? 'SELECT * FROM users WHERE wechat_openid = ? AND id != ?'
        : 'SELECT * FROM users WHERE qq_openid = ? AND id != ?',
      [openid, decoded.id]
    );

    if (existingUsers.length > 0) {
      return badRequest(res, '该账号已被其他用户绑定');
    }

    const updateQuery = provider === 'wechat'
      ? 'UPDATE users SET wechat_openid = ?, wechat_unionid = ?, nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), bind_status = JSON_SET(COALESCE(bind_status, \'{}\'), "$.wechat", true) WHERE id = ?'
      : 'UPDATE users SET qq_openid = ?, qq_unionid = ?, nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), bind_status = JSON_SET(COALESCE(bind_status, \'{}\'), "$.qq", true) WHERE id = ?';

    await db.query(updateQuery, [openid, unionid, nickname, avatar, decoded.id]);

    winston.info(`${provider}账号绑定成功`, { userId: decoded.id, openid });

    return success(res, { provider, openid }, '绑定成功');

  } catch (error) {
    winston.error(`${provider}账号绑定失败`, { userId: decoded.id, error: error.message });
    return error(res, '绑定失败');
  }
}));

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
    openid: decoded.openid,
    type: decoded.type
  });

  return success(res, { token: newToken }, '令牌刷新成功');
}));

router.post('/logout', asyncHandler(async (req, res) => {
  winston.info('用户登出:', { userId: req.user?.id });
  return success(res, null, '登出成功');
}));

module.exports = router;