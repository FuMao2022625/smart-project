-- 移除微信/QQ字段，简化用户表
-- 执行此脚本以删除用户表中的微信/QQ相关字段

USE lpl;

-- 1. 删除微信/QQ相关字段
ALTER TABLE users
DROP COLUMN IF EXISTS wechat_openid,
DROP COLUMN IF EXISTS wechat_unionid,
DROP COLUMN IF EXISTS qq_openid,
DROP COLUMN IF EXISTS qq_unionid,
DROP COLUMN IF EXISTS bind_status;

-- 2. 删除微信/QQ相关的唯一索引
ALTER TABLE users
DROP INDEX IF EXISTS uk_wechat_openid,
DROP INDEX IF EXISTS uk_wechat_unionid,
DROP INDEX IF EXISTS uk_qq_openid;

-- 3. 更新表注释
ALTER TABLE users
COMMENT='系统用户表(手机号密码登录)';

-- 4. 显示修改后的表结构
SELECT '用户表修改完成，当前字段如下：' AS result;
SHOW COLUMNS FROM users;