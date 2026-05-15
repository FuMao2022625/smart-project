-- 用户表迁移脚本：添加密码登录支持
-- 执行此脚本以支持手机号码和密码登录

USE lpl;

-- 1. 修改 phone 字段名为 phone_number，并确保唯一性约束
ALTER TABLE users 
CHANGE COLUMN phone phone_number VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号码';

-- 2. 添加密码字段（存储 bcrypt 加密后的密码）
ALTER TABLE users 
ADD COLUMN password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '密码(bcrypt加密)';

-- 3. 添加密码重置相关字段
ALTER TABLE users 
ADD COLUMN password_reset_token VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '密码重置令牌',
ADD COLUMN password_reset_expire DATETIME NULL DEFAULT NULL COMMENT '密码重置令牌过期时间';

-- 4. 添加邮箱验证相关字段
ALTER TABLE users 
ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT '0' COMMENT '邮箱是否已验证';

-- 5. 更新唯一性约束名称（如果需要）
-- phone_number 字段已有 uk_phone 约束，保持不变

-- 6. 添加索引
ALTER TABLE users 
ADD INDEX idx_phone_number (phone_number),
ADD INDEX idx_password_reset_token (password_reset_token);

-- 7. 更新表注释
ALTER TABLE users 
MODIFY COLUMN phone_number VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号码(支持密码登录)';

-- 更新表的注释
ALTER TABLE users 
COMMENT='系统用户表(支持微信/QQ扫码登录和手机号密码登录)';

SELECT '用户表迁移完成' AS result;