# API 接口文档

## 项目概述

本项目是一个智能设备管理系统，提供用户认证、设备管理、环境数据采集、告警通知等功能。

---

## 基础信息

- **API 基础路径**: `/api`
- **请求格式**: JSON
- **响应格式**: JSON
- **认证方式**: JWT Token (Bearer)

---

## 目录

1. [认证接口](#1-认证接口)
2. [用户接口](#2-用户接口)
3. [机器人接口](#3-机器人接口)
4. [环境数据接口](#4-环境数据接口)
5. [告警接口](#5-告警接口)
6. [设备接口](#6-设备接口)
7. [传感器接口](#7-传感器接口)
8. [消息接口](#8-消息接口)
9. [系统接口](#9-系统接口)
10. [报告接口](#10-报告接口)
11. [SSE接口](#11-sse接口)

---

## 1. 认证接口

### 1.1 获取微信授权URL

- **路径**: `GET /api/auth/wechat/url`
- **描述**: 获取微信扫码登录授权URL
- **请求参数**: 无

**成功响应** (200):
```json
{
  "code": 200,
  "message": "获取微信授权URL成功",
  "data": {
    "url": "https://open.weixin.qq.com/connect/qrconnect?appid=...",
    "state": "random_state"
  }
}
```

---

### 1.2 微信登录回调

- **路径**: `POST /api/auth/wechat/callback`
- **描述**: 微信授权回调，完成登录
- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 微信授权码 |
| state | string | 否 | 状态值 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "JWT_TOKEN",
    "userInfo": {
      "id": "1",
      "username": "wechat_xxx",
      "nickname": "微信用户",
      "avatar": "https://...",
      "bindStatus": "{\"wechat\": true, \"qq\": false}",
      "isNewUser": false
    }
  }
}
```

---

### 1.3 获取QQ授权URL

- **路径**: `GET /api/auth/qq/url`
- **描述**: 获取QQ扫码登录授权URL
- **请求参数**: 无

**成功响应** (200):
```json
{
  "code": 200,
  "message": "获取QQ授权URL成功",
  "data": {
    "url": "https://graph.qq.com/oauth2.0/authorize?...",
    "state": "random_state"
  }
}
```

---

### 1.4 QQ登录回调

- **路径**: `POST /api/auth/qq/callback`
- **描述**: QQ授权回调，完成登录
- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | QQ授权码 |
| state | string | 否 | 状态值 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "JWT_TOKEN",
    "userInfo": {
      "id": "1",
      "username": "qq_xxx",
      "nickname": "QQ用户",
      "avatar": "https://...",
      "bindStatus": "{\"wechat\": false, \"qq\": true}",
      "isNewUser": false
    }
  }
}
```

---

### 1.5 获取绑定状态

- **路径**: `GET /api/auth/bind/status`
- **描述**: 获取当前用户的第三方账号绑定状态
- **认证**: 需要 JWT Token
- **请求参数**: 无

**成功响应** (200):
```json
{
  "code": 200,
  "message": "获取绑定状态成功",
  "data": {
    "wechat": true,
    "qq": false
  }
}
```

---

### 1.6 绑定第三方账号

- **路径**: `POST /api/auth/bind/:provider`
- **描述**: 绑定微信或QQ账号
- **认证**: 需要 JWT Token
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| provider | string | wechat 或 qq |

- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 授权码 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "绑定成功",
  "data": {
    "provider": "wechat",
    "openid": "xxx"
  }
}
```

---

### 1.7 刷新令牌

- **路径**: `POST /api/auth/refresh-token`
- **描述**: 刷新JWT令牌
- **认证**: 需要 JWT Token
- **请求参数**: 无

**成功响应** (200):
```json
{
  "code": 200,
  "message": "令牌刷新成功",
  "data": {
    "token": "NEW_JWT_TOKEN"
  }
}
```

---

### 1.8 登出

- **路径**: `POST /api/auth/logout`
- **描述**: 用户登出
- **请求参数**: 无

**成功响应** (200):
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

---

## 2. 用户接口

### 2.1 获取用户列表

- **路径**: `GET /api/users`
- **描述**: 获取用户列表（管理员权限）
- **认证**: 需要 JWT Token，管理员权限
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| role | string | 否 | - | 角色ID筛选 |
| status | string | 否 | - | 状态筛选 |
| keyword | string | 否 | - | 搜索关键词 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "userId": "1",
        "username": "user1",
        "nickname": "用户1",
        "avatar": "https://...",
        "email": "user@example.com",
        "phone": "13800138000",
        "role": "1",
        "status": "active",
        "bindStatus": "{...}",
        "lastLogin": "2024-01-01T00:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 2.2 获取用户详情

- **路径**: `GET /api/users/:userId`
- **描述**: 获取单个用户详情（管理员权限）
- **认证**: 需要 JWT Token，管理员权限
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户ID |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "1",
    "username": "user1",
    "nickname": "用户1",
    "avatar": "https://...",
    "email": "user@example.com",
    "phone": "13800138000",
    "role": "1",
    "status": "active",
    "wechatBound": true,
    "qqBound": false,
    "bindStatus": "{...}",
    "lastLogin": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 2.3 更新用户信息

- **路径**: `PUT /api/users/:userId`
- **描述**: 更新用户信息（管理员权限）
- **认证**: 需要 JWT Token，管理员权限
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户ID |

- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 昵称 |
| avatar | string | 否 | 头像URL |
| phone | string | 否 | 手机号 |
| email | string | 否 | 邮箱 |
| role | string | 否 | 角色ID |
| status | string | 否 | 状态 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "用户信息更新成功",
  "data": {
    "userId": "1"
  }
}
```

---

### 2.4 删除用户

- **路径**: `DELETE /api/users/:userId`
- **描述**: 删除用户（管理员权限）
- **认证**: 需要 JWT Token，管理员权限
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户ID |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "用户删除成功",
  "data": null
}
```

---

## 3. 机器人接口

### 3.1 获取机器人位置

- **路径**: `GET /api/robot/positions`
- **描述**: 获取在线机器人的位置信息

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "robotId": "robot001",
      "robotName": "巡检机器人1号",
      "x": 0,
      "y": 0,
      "status": "在线",
      "battery": 85,
      "lastUpdate": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 3.2 获取机器人列表

- **路径**: `GET /api/robot`
- **描述**: 获取机器人列表
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| status | string | 否 | - | 状态筛选 |
| keyword | string | 否 | - | 搜索关键词 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "robotId": "robot001",
        "robotName": "巡检机器人1号",
        "type": "巡检",
        "status": "在线",
        "battery": 85,
        "location": "A区",
        "lastUpdate": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 3.3 添加机器人

- **路径**: `POST /api/robot`
- **描述**: 添加新机器人
- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 机器人ID |
| name | string | 是 | 机器人名称 |
| type | string | 否 | 类型 |
| model | string | 否 | 型号 |
| serialNumber | string | 否 | 序列号 |
| location | string | 是 | 位置 |
| description | string | 否 | 描述 |
| status | string | 否 | 状态，默认离线 |
| battery | number | 否 | 电量，默认100 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "机器人添加成功",
  "data": {
    "robotId": "robot001",
    "name": "巡检机器人1号",
    "status": "离线",
    "battery": 100
  }
}
```

---

### 3.4 更新机器人信息

- **路径**: `PUT /api/robot/:robotId`
- **描述**: 更新机器人信息
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| robotId | string | 机器人ID |

- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 机器人名称 |
| type | string | 否 | 类型 |
| model | string | 否 | 型号 |
| location | string | 是 | 位置 |
| description | string | 否 | 描述 |
| status | string | 否 | 状态 |
| battery | number | 否 | 电量 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "机器人信息更新成功",
  "data": {
    "robotId": "robot001",
    "name": "巡检机器人1号"
  }
}
```

---

### 3.5 删除机器人

- **路径**: `DELETE /api/robot/:robotId`
- **描述**: 删除机器人
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| robotId | string | 机器人ID |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "机器人删除成功",
  "data": null
}
```

---

### 3.6 控制机器人

- **路径**: `POST /api/robot/:robotId/control`
- **描述**: 发送控制指令给机器人
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| robotId | string | 机器人ID |

- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| command | string | 是 | 控制命令 |
| parameters | object | 否 | 命令参数 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "控制指令发送成功",
  "data": {
    "robotId": "robot001",
    "command": "move",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

## 4. 环境数据接口

### 4.1 获取最新环境数据

- **路径**: `GET /api/environment/data`
- **描述**: 获取最新的环境传感器数据

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "deviceId": "device001",
    "temperature": 25.5,
    "humidity": 60,
    "pressure": 1013.25,
    "co2": null,
    "pm25": null,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

### 4.2 获取温度历史数据

- **路径**: `GET /api/environment/temperature-history`
- **描述**: 获取最近10个2分钟时间段的平均温度

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "labels": ["00:00:00", "00:02:00", "..."],
    "temperatures": [25.5, 25.6, 25.7, ...]
  }
}
```

---

### 4.3 获取环境数据列表

- **路径**: `GET /api/environment/data-list`
- **描述**: 分页获取环境数据列表
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| startTime | string | 否 | - | 开始时间 |
| endTime | string | 否 | - | 结束时间 |
| type | string | 否 | - | 数据类型筛选 |
| location | string | 否 | - | 位置筛选 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 1000,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "dataId": "1",
        "deviceId": "device001",
        "type": "temperature",
        "value": 25.5,
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 4.4 导出环境数据

- **路径**: `POST /api/environment/export`
- **描述**: 导出环境数据为Excel或CSV文件
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| startTime | string | 是 | - | 开始时间 |
| endTime | string | 是 | - | 结束时间 |
| type | string | 否 | - | 数据类型筛选 |
| location | string | 否 | - | 位置筛选 |
| format | string | 否 | xlsx | 导出格式，xlsx或csv |

**成功响应**: 文件下载

---

### 4.5 获取环境统计数据

- **路径**: `GET /api/environment/statistics`
- **描述**: 获取指定时间段内的环境数据统计
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| startTime | string | 是 | - | 开始时间 |
| endTime | string | 是 | - | 结束时间 |
| type | string | 否 | all | 统计类型 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "temperature": {
      "avg": 25.5,
      "max": 30.0,
      "min": 20.0,
      "count": 100
    },
    "humidity": {
      "avg": 60,
      "max": 80,
      "min": 40,
      "count": 100
    },
    "pressure": {
      "avg": 1013.25,
      "max": 1020,
      "min": 1000,
      "count": 100
    }
  }
}
```

---

### 4.6 获取环境数据趋势

- **路径**: `GET /api/environment/trends`
- **描述**: 获取环境数据趋势
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| startTime | string | 是 | - | 开始时间 |
| endTime | string | 是 | - | 结束时间 |
| type | string | 是 | - | 数据类型 |
| interval | string | 否 | hour | 时间间隔，hour/day/week |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "labels": ["00:00", "01:00", "..."],
    "values": [25.5, 25.6, ...]
  }
}
```

---

## 5. 告警接口

### 5.1 获取活跃告警

- **路径**: `GET /api/alerts/active`
- **描述**: 获取未处理的告警列表

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "alertId": "1",
      "type": "温度异常",
      "level": "high",
      "message": "设备温度过高",
      "location": "A区",
      "timestamp": "2024-01-01T00:00:00Z",
      "processed": false
    }
  ]
}
```

---

### 5.2 获取告警列表

- **路径**: `GET /api/alerts`
- **描述**: 分页获取告警列表
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| level | string | 否 | - | 告警级别筛选 |
| status | string | 否 | - | 状态筛选，processed/unprocessed |
| type | string | 否 | - | 告警类型筛选 |
| keyword | string | 否 | - | 搜索关键词 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "alertId": "1",
        "type": "温度异常",
        "level": "high",
        "message": "设备温度过高",
        "location": "A区",
        "processed": false,
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 5.3 处理告警

- **路径**: `PUT /api/alerts/:alertId/process`
- **描述**: 标记告警为已处理
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| alertId | string | 告警ID |

- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| note | string | 否 | 处理备注 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "报警已标记为已处理",
  "data": {
    "alertId": "1",
    "processed": true,
    "processedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## 6. 设备接口

### 6.1 获取设备统计

- **路径**: `GET /api/devices/stats`
- **描述**: 获取设备状态统计

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "online": 80,
    "offline": 15,
    "maintenance": 3,
    "error": 2
  }
}
```

---

## 7. 传感器接口

### 7.1 获取传感器列表

- **路径**: `GET /api/sensors`
- **描述**: 分页获取传感器列表
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| type | string | 否 | - | 类型筛选 |
| status | string | 否 | - | 状态筛选 |
| keyword | string | 否 | - | 搜索关键词 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "sensorId": "sensor001",
        "sensorName": "温度传感器1号",
        "type": "temperature",
        "status": "online",
        "location": "A区",
        "lastUpdate": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 7.2 添加传感器

- **路径**: `POST /api/sensors`
- **描述**: 添加新传感器
- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sensorName | string | 是 | 传感器名称 |
| type | string | 是 | 类型 |
| model | string | 是 | 型号 |
| serialNumber | string | 是 | 序列号 |
| location | string | 否 | 位置 |
| description | string | 否 | 描述 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "传感器添加成功",
  "data": {
    "sensorId": "sensor_xxx",
    "sensorName": "温度传感器1号"
  }
}
```

---

### 7.3 更新传感器信息

- **路径**: `PUT /api/sensors/:sensorId`
- **描述**: 更新传感器信息
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| sensorId | string | 传感器ID |

- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sensorName | string | 是 | 传感器名称 |
| type | string | 是 | 类型 |
| model | string | 是 | 型号 |
| location | string | 否 | 位置 |
| description | string | 否 | 描述 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "传感器信息更新成功",
  "data": {
    "sensorId": "sensor001",
    "sensorName": "温度传感器1号"
  }
}
```

---

### 7.4 删除传感器

- **路径**: `DELETE /api/sensors/:sensorId`
- **描述**: 删除传感器
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| sensorId | string | 传感器ID |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "传感器删除成功",
  "data": null
}
```

---

## 8. 消息接口

### 8.1 获取消息列表

- **路径**: `GET /api/messages`
- **描述**: 获取当前用户的消息列表
- **认证**: 需要 JWT Token
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| type | string | 否 | - | 消息类型筛选 |
| status | string | 否 | - | 状态筛选，read/unread |
| keyword | string | 否 | - | 搜索关键词 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 20,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "messageId": "1",
        "type": "system",
        "title": "系统通知",
        "content": "系统将于今晚22:00进行维护",
        "unread": true,
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 8.2 标记消息为已读

- **路径**: `PUT /api/messages/:messageId/read`
- **描述**: 标记单条消息为已读
- **认证**: 需要 JWT Token
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| messageId | string | 消息ID |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "消息已标记为已读",
  "data": {
    "messageId": "1",
    "unread": false
  }
}
```

---

### 8.3 批量标记消息为已读

- **路径**: `PUT /api/messages/batch-read`
- **描述**: 批量标记消息为已读
- **认证**: 需要 JWT Token
- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| messageIds | array | 是 | 消息ID数组 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "批量标记成功",
  "data": {
    "count": 5
  }
}
```

---

### 8.4 删除消息

- **路径**: `DELETE /api/messages/:messageId`
- **描述**: 删除消息
- **认证**: 需要 JWT Token
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| messageId | string | 消息ID |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "消息删除成功",
  "data": null
}
```

---

### 8.5 获取未读消息数量

- **路径**: `GET /api/messages/unread-count`
- **描述**: 获取未读消息统计
- **认证**: 需要 JWT Token

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "system": 2,
    "alert": 2,
    "notification": 1
  }
}
```

---

## 9. 系统接口

### 9.1 获取系统状态

- **路径**: `GET /api/system/status`
- **描述**: 获取系统运行状态

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "database": "connected",
    "uptime": "02:30:00",
    "memory": {
      "used": "256MB",
      "total": "512MB",
      "percentage": "50%"
    },
    "cpu": {
      "1min": 10,
      "5min": 8,
      "15min": 5
    },
    "disk": {
      "used": "0MB",
      "total": "0MB",
      "percentage": "0%"
    },
    "network": {
      "status": "connected",
      "interfaces": []
    },
    "os": "Linux"
  }
}
```

---

### 9.2 获取系统配置

- **路径**: `GET /api/system/config`
- **描述**: 获取系统配置信息

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "version": "1.0.0",
    "nodeEnv": "development",
    "apiPrefix": "/api",
    "port": 3000
  }
}
```

---

### 9.3 获取数据库状态

- **路径**: `GET /api/system/database`
- **描述**: 获取数据库连接状态

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "connections": {
      "Threads_connected": "10",
      "Threads_running": "2"
    }
  }
}
```

---

### 9.4 获取系统设置

- **路径**: `GET /api/system/settings`
- **描述**: 获取系统设置

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "appName": "AI Project",
    "version": "1.0.0",
    "debug": true,
    "features": {
      "monitoring": true,
      "alerts": true,
      "reports": true
    }
  }
}
```

---

### 9.5 获取系统日志

- **路径**: `GET /api/system/logs`
- **描述**: 获取系统日志

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "recent": [
      {
        "level": "info",
        "message": "系统启动",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 0
  }
}
```

---

### 9.6 更新系统设置

- **路径**: `PUT /api/system/settings`
- **描述**: 更新系统设置
- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| appName | string | 否 | 应用名称 |
| features | object | 否 | 功能开关 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "系统设置更新成功",
  "data": {
    "appName": "AI Project",
    "features": {
      "monitoring": true,
      "alerts": true,
      "reports": true
    }
  }
}
```

---

## 10. 报告接口

### 10.1 生成报告

- **路径**: `POST /api/reports/generate`
- **描述**: 生成报告
- **认证**: 需要 JWT Token
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | string | 是 | - | 报告类型 |
| startTime | string | 是 | - | 开始时间 |
| endTime | string | 是 | - | 结束时间 |
| include | array | 否 | - | 包含内容 |
| format | string | 否 | pdf | 输出格式 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "报告生成成功",
  "data": {
    "reportId": "uuid",
    "fileName": "报告名称_xxx.pdf",
    "downloadUrl": "/api/reports/uuid/download",
    "size": 1024,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 10.2 获取报告列表

- **路径**: `GET /api/reports`
- **描述**: 获取报告列表
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| type | string | 否 | - | 报告类型筛选 |
| startTime | string | 否 | - | 开始时间 |
| endTime | string | 否 | - | 结束时间 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "reportId": "uuid",
        "type": "daily",
        "title": "日报_2024-01-01",
        "fileName": "日报_2024-01-01.pdf",
        "size": 1024,
        "format": "pdf",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 10.3 下载报告

- **路径**: `GET /api/reports/:reportId/download`
- **描述**: 下载报告文件
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| reportId | string | 报告ID |

**成功响应**: 文件下载

---

### 10.4 删除报告

- **路径**: `DELETE /api/reports/:reportId`
- **描述**: 删除报告
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| reportId | string | 报告ID |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "报告删除成功",
  "data": null
}
```

---

### 10.5 获取报告模板列表

- **路径**: `GET /api/reports/templates`
- **描述**: 获取报告模板列表

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "templateId": "template_1",
      "name": "日常巡检报告模板",
      "description": "用于日常巡检的报告模板",
      "type": "daily",
      "previewUrl": "/api/reports/templates/1/preview"
    }
  ]
}
```

---

### 10.6 创建报告模板

- **路径**: `POST /api/reports/templates`
- **描述**: 创建报告模板
- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 模板名称 |
| description | string | 否 | 描述 |
| type | string | 是 | 类型 |
| sections | array | 是 | 报告章节 |
| format | string | 是 | 输出格式 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "模板创建成功",
  "data": {
    "templateId": "template_xxx",
    "name": "模板名称"
  }
}
```

---

### 10.7 更新报告模板

- **路径**: `PUT /api/reports/templates/:templateId`
- **描述**: 更新报告模板
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| templateId | string | 模板ID |

- **请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 模板名称 |
| description | string | 否 | 描述 |
| type | string | 是 | 类型 |
| sections | array | 是 | 报告章节 |
| format | string | 是 | 输出格式 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "模板更新成功",
  "data": {
    "templateId": "template_xxx",
    "name": "模板名称"
  }
}
```

---

### 10.8 删除报告模板

- **路径**: `DELETE /api/reports/templates/:templateId`
- **描述**: 删除报告模板
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| templateId | string | 模板ID |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "模板删除成功",
  "data": null
}
```

---

## 11. SSE接口

### 11.1 获取SSE服务状态

- **路径**: `GET /api/sse/status`
- **描述**: 获取SSE服务状态

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "running",
    "connectedClients": 5,
    "config": {
      "cacheTTL": 1000,
      "corsEnabled": true
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

### 11.2 获取最新传感器数据

- **路径**: `GET /api/sse/latest-data`
- **描述**: 获取最新的传感器数据

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "1",
    "deviceId": "device001",
    "type": "temperature",
    "temperature": 25.5,
    "humidity": 60,
    "smokeLevel": 0.5,
    "maxTemp": 30,
    "humanDetected": false,
    "fireRisk": "LOW",
    "envStatus": "NORMAL",
    "battery": 85,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

### 11.3 获取传感器历史数据

- **路径**: `GET /api/sse/history`
- **描述**: 获取传感器历史数据
- **请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| limit | number | 否 | 100 | 最大条数，最大1000 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "items": [...]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

### 11.4 SSE实时数据流

- **路径**: `GET /api/sse/sensor-data`
- **描述**: SSE实时推送传感器数据
- **响应类型**: text/event-stream

**消息类型**:
- `initial`: 初始数据
- `data`: 新数据推送
- `heartbeat`: 心跳包（每30秒）

**消息格式**:
```
data: {"type": "data", "data": {...}, "timestamp": "2024-01-01T00:00:00Z"}
```

---

## 错误响应格式

所有接口的错误响应格式统一：

```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### HTTP状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/令牌无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 附录

### 数据类型枚举

**告警级别 (level)**:
- `low`: 低
- `medium`: 中
- `high`: 高
- `critical`: 严重

**设备状态 (status)**:
- `online`: 在线
- `offline`: 离线
- `maintenance`: 维护中
- `error`: 故障

**消息类型 (type)**:
- `system`: 系统消息
- `alarm`: 告警消息
- `notification`: 通知消息

**火灾风险 (fireRisk)**:
- `LOW`: 低
- `MEDIUM`: 中
- `HIGH`: 高
- `CRITICAL`: 严重

**环境状态 (envStatus)**:
- `NORMAL`: 正常
- `WARNING`: 警告
- `ALERT`: 警报
- `EMERGENCY`: 紧急

---

*文档生成时间: 2026-05-06*