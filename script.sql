-- ========================================
-- 完整数据库初始化脚本
-- 数据库名称: lpl
-- 执行顺序: 按表依赖关系排序
-- ========================================

-- 第1步: 创建数据库
DROP DATABASE IF EXISTS `lpl`;
CREATE DATABASE `lpl` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lpl`;

-- ========================================
-- 第2步: 创建基础表（无外键依赖）
-- ========================================

-- 2.1 角色表 (被 users 表引用)
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '角色描述',
  `permissions` json DEFAULT NULL COMMENT '角色权限',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='系统角色表';

-- 2.2 用户表 (依赖 roles 表)
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户名',
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户昵称',
  `avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户头像',
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号码',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '密码(bcrypt加密)',
  `role_id` int DEFAULT '1' COMMENT '关联角色ID',
  `status` enum('active','inactive','locked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT '状态',
  `password_reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '密码重置令牌',
  `password_reset_expire` datetime DEFAULT NULL COMMENT '密码重置令牌过期时间',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT '邮箱是否已验证',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '最后登录IP',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone_number`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_status` (`status`),
  KEY `idx_last_login_time` (`last_login_time`),
  KEY `idx_phone_number` (`phone_number`),
  KEY `idx_password_reset_token` (`password_reset_token`)
) ENGINE=InnoDB AUTO_INCREMENT=313 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='系统用户表(手机号密码登录)';

-- 2.3 设备表
CREATE TABLE `devices` (
  `id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '设备ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '设备名称',
  `type_id` int DEFAULT '1' COMMENT '设备类型ID',
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设备型号',
  `serial_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设备序列号',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设备部署位置',
  `status` enum('online','offline','maintenance','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'offline' COMMENT '设备状态',
  `install_date` datetime DEFAULT NULL COMMENT '安装日期',
  `last_maintenance` datetime DEFAULT NULL COMMENT '最后维护时间',
  `next_maintenance` datetime DEFAULT NULL COMMENT '下次维护时间',
  `last_heartbeat` datetime DEFAULT NULL COMMENT '最后心跳时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_serial_number` (`serial_number`),
  KEY `idx_status` (`status`),
  KEY `idx_type_id` (`type_id`),
  KEY `idx_location` (`location`),
  KEY `idx_update_time` (`update_time`),
  KEY `idx_status_location` (`status`,`location`),
  KEY `idx_type_status` (`type_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='设备信息表';

-- 2.4 机器人表
CREATE TABLE `robots` (
  `id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '机器人ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '机器人名称',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '机器人类型',
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '机器人型号',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '部署位置',
  `manufacturer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '生产厂商',
  `install_date` datetime DEFAULT NULL COMMENT '安装日期',
  `status` enum('online','offline','maintenance','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'offline' COMMENT '状态',
  `battery` int DEFAULT '100' COMMENT '电池电量',
  `last_heartbeat` datetime DEFAULT NULL COMMENT '最后心跳时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_location` (`location`),
  KEY `idx_update_time` (`update_time`),
  KEY `idx_status_location` (`status`,`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='机器人信息表';

-- 2.5 传感器数据表
CREATE TABLE `sensor_data` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `device_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设备ID',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '传感器类型',
  `temperature` decimal(6,2) DEFAULT NULL COMMENT '温度',
  `humidity` decimal(6,2) DEFAULT NULL COMMENT '湿度',
  `smoke_level` decimal(6,2) DEFAULT NULL COMMENT '烟雾浓度',
  `max_temp` json DEFAULT NULL COMMENT '最高温度',
  `human_detected` tinyint(1) DEFAULT '0' COMMENT '是否检测到人',
  `fire_risk` int DEFAULT '0' COMMENT '火灾风险等级',
  `env_status` float DEFAULT '0' COMMENT '环境状态',
  `battery` int DEFAULT '100' COMMENT '电池电量',
  `record_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_record_time` (`record_time`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_type` (`type`),
  KEY `idx_device_record_time` (`device_id`,`record_time`),
  KEY `idx_type_record_time` (`type`,`record_time`)
) ENGINE=InnoDB AUTO_INCREMENT=10219 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='传感器数据表';

-- ========================================
-- 第3步: 创建业务表（依赖基础表）
-- ========================================

-- 3.1 报警信息表
CREATE TABLE `alarms` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '报警ID',
  `alarm_item` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '报警项',
  `level` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '报警级别',
  `device_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联设备ID',
  `device_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '设备名称',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '报警位置',
  `alarm_time` datetime NOT NULL COMMENT '报警时间',
  `resolve_time` datetime DEFAULT NULL COMMENT '解决时间',
  `status` enum('pending','resolved') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT '报警状态',
  `handle_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '处理备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_alarm_time` (`alarm_time`),
  KEY `idx_status` (`status`),
  KEY `idx_level` (`level`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_level_alarm_time` (`level`,`alarm_time`),
  KEY `idx_status_alarm_time` (`status`,`alarm_time`),
  KEY `idx_status_level_alarm_time` (`status`,`level`,`alarm_time`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='报警信息表';

-- 3.2 系统消息表 (依赖 users 表)
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `user_id` int DEFAULT NULL COMMENT '接收用户ID',
  `type` enum('system','alarm','notification','chat') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息类型',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息内容',
  `status` enum('unread','read') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'unread' COMMENT '消息状态',
  `related_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '相关ID（如报警ID、设备ID等）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `read_time` datetime DEFAULT NULL COMMENT '读取时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_user_type_status` (`user_id`,`type`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='系统消息表';

-- 3.3 审计日志表 (依赖 users 表)
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` int DEFAULT NULL COMMENT '操作用户ID',
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型',
  `resource_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资源类型',
  `resource_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '资源ID',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '操作IP',
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户代理',
  `details` json DEFAULT NULL COMMENT '操作详情',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_resource_type` (`resource_type`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_user_create_time` (`user_id`,`create_time`),
  KEY `idx_resource_type_create_time` (`resource_type`,`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='审计日志表';

-- 3.4 报告生成表
CREATE TABLE `reports` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '报告ID',
  `type` enum('daily','weekly','monthly','custom') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '报告类型',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '报告标题',
  `start_date` date NOT NULL COMMENT '报告开始日期',
  `end_date` date NOT NULL COMMENT '报告结束日期',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '报告内容',
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '报告文件路径',
  `status` enum('generating','completed','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'generating' COMMENT '报告状态',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_date_range` (`start_date`,`end_date`),
  KEY `idx_status_create_time` (`status`,`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='报告生成表';

-- ========================================
-- 第4步: 插入初始数据
-- ========================================

-- 4.1 插入默认角色
INSERT INTO `roles` (`id`, `name`, `description`, `permissions`, `create_time`, `update_time`) VALUES
(1, '普通用户', '普通用户角色', '{"read": true, "write": false, "admin": false}', NOW(), NOW()),
(2, '管理员', '管理员角色', '{"read": true, "write": true, "admin": true}', NOW(), NOW());

-- ========================================
-- 脚本执行完成
-- ========================================
SELECT '数据库初始化完成，共创建9张表' AS result;