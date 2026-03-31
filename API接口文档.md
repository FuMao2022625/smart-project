# API 接口文档

## 项目信息

- 项目名称: AI Project
- 版本: 1.0.0
- 基础路径: `/api`
- 技术栈: Express.js + MySQL2
- 认证方式: JWT Token
- Socket服务: TCP服务器
- Socket端口: 443
- Socket主机: 0.0.0.0

## 通用响应格式

所有接口返回的JSON格式如下：

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2026-03-28T00:00:00.000Z"
}
```

- `code`: 状态码，200表示成功，其他为错误码
- `message`: 响应消息
- `data`: 响应数据
- `timestamp`: 响应时间戳（ISO 8601格式）

---

## 1. 认证模块 (`/api/auth`)

### 1.1 用户登录

**接口地址**: `POST /api/auth/login`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| phone | string | 是 | 手机号 |

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": "1",
      "username": "admin",
      "role": "1",
      "avatar": null
    }
  },
  "timestamp": "2026-03-28T00:00:00.000Z"
}
```

**错误响应**:

- 400: 请求参数错误
- 401: 用户名或密码错误 / 手机号错误

---

### 1.2 用户注册

**接口地址**: `POST /api/auth/register`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| confirmPassword | string | 是 | 确认密码 |
| email | string | 是 | 邮箱 |
| phone | string | 是 | 手机号 |

**响应示例**:

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "1",
    "username": "newuser"
  }
}
```

**错误响应**:

- 400: 请求参数错误 / 两次密码输入不一致 / 用户名已存在 / 邮箱已被注册 / 手机号已被注册

---

### 1.3 重置密码

**接口地址**: `POST /api/auth/reset-password`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| email | string | 是 | 邮箱 |

**响应示例**:

```json
{
  "code": 200,
  "message": "重置密码邮件已发送",
  "data": null
}
```

---

## 2. 机器人管理模块 (`/api/robot`)

### 2.1 获取机器人列表

**接口地址**: `GET /api/robot`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| status | string | 否 | 状态筛选 |
| keyword | string | 否 | 关键词搜索 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "robotId": "1",
        "robotName": "机器人1",
        "type": "巡检机器人",
        "status": "在线",
        "battery": 85,
        "location": "A区",
        "lastUpdate": "2026-03-28T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 2.2 获取机器人位置

**接口地址**: `GET /api/robot/positions`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "robotId": "1",
      "robotName": "机器人1",
      "x": 0,
      "y": 0,
      "status": "在线",
      "battery": 85,
      "lastUpdate": "2026-03-28T00:00:00.000Z"
    }
  ]
}
```

---

### 2.3 添加机器人

**接口地址**: `POST /api/robot`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 机器人ID |
| name | string | 是 | 机器人名称 |
| type | string | 否 | 机器人类型 |
| model | string | 否 | 机器人型号 |
| serialNumber | string | 否 | 序列号 |
| location | string | 是 | 位置 |
| description | string | 否 | 描述 |
| status | string | 否 | 状态，默认"离线" |
| battery | number | 否 | 电池电量，默认100 |

**响应示例**:

```json
{
  "code": 200,
  "message": "机器人添加成功",
  "data": {
    "robotId": "1",
    "name": "机器人1",
    "status": "离线",
    "battery": 100
  }
}
```

---

### 2.4 更新机器人信息

**接口地址**: `PUT /api/robot/:robotId`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 机器人名称 |
| type | string | 否 | 机器人类型 |
| model | string | 否 | 机器人型号 |
| location | string | 是 | 位置 |
| description | string | 否 | 描述 |
| status | string | 否 | 状态 |
| battery | number | 否 | 电池电量 |

**响应示例**:

```json
{
  "code": 200,
  "message": "机器人信息更新成功",
  "data": {
    "robotId": "1",
    "name": "机器人1"
  }
}
```

---

### 2.5 删除机器人

**接口地址**: `DELETE /api/robot/:robotId`

**响应示例**:

```json
{
  "code": 200,
  "message": "机器人删除成功",
  "data": null
}
```

---

### 2.6 控制机器人

**接口地址**: `POST /api/robot/:robotId/control`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| command | string | 是 | 控制命令 |
| parameters | object | 否 | 命令参数 |

**响应示例**:

```json
{
  "code": 200,
  "message": "控制指令发送成功",
  "data": {
    "robotId": "1",
    "command": "move",
    "timestamp": "2026-03-28T00:00:00.000Z"
  }
}
```

---

## 3. 服务器发送事件模块 (`/api/sse`)

### 3.1 获取SSE服务状态

**接口地址**: `GET /api/sse/status`

**响应示例**:

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
    "timestamp": "2026-03-28T00:00:00.000Z"
  }
}
```

---

### 3.2 获取最新传感器数据

**接口地址**: `GET /api/sse/latest-data`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "type": "temperature",
    "temperature": 25.5,
    "humidity": 60,
    "smokeLevel": 0,
    "maxTemp": [25.5, 26.0, 25.8],
    "humanDetected": false,
    "fireRisk": "low",
    "envStatus": "normal",
    "battery": 85,
    "timestamp": "2026-03-28T00:00:00.000Z"
  }
}
```

---

### 3.3 获取传感器历史数据

**接口地址**: `GET /api/sse/history`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | number | 否 | 返回数量，默认100，最大1000 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "items": [
      {
        "id": 1,
        "type": "temperature",
        "temperature": 25.5,
        "humidity": 60,
        "smokeLevel": 0,
        "maxTemp": [25.5],
        "humanDetected": false,
        "fireRisk": "low",
        "envStatus": "normal",
        "battery": 85
      }
    ]
  }
}
```

---

## 4. 环境数据模块 (`/api/environment`)

### 4.1 获取最新环境数据

**接口地址**: `GET /api/environment/data`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "temperature": 25.5,
    "humidity": 60,
    "pressure": 1013.25,
    "co2": 400,
    "pm25": 35,
    "timestamp": "2026-03-28T00:00:00.000Z"
  }
}
```

---

### 4.2 获取温度历史数据

**接口地址**: `GET /api/environment/temperature-history`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "labels": ["00:00:00", "00:10:00", "00:20:00"],
    "temperatures": [25.5, 25.8, 26.0]
  }
}
```

---

### 4.3 获取环境数据列表

**接口地址**: `GET /api/environment/data-list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| startTime | string | 否 | 开始时间 |
| endTime | string | 否 | 结束时间 |
| type | string | 否 | 数据类型 |
| location | string | 否 | 位置 |

**响应示例**:

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
        "dataId": "1",
        "type": "temperature",
        "value": 25.5,
        "timestamp": "2026-03-28T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 4.4 导出环境数据

**接口地址**: `POST /api/environment/export`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startTime | string | 是 | 开始时间 |
| endTime | string | 是 | 结束时间 |
| type | string | 否 | 数据类型 |
| location | string | 否 | 位置 |
| format | string | 否 | 导出格式，默认xlsx，支持xlsx/csv |

**响应**: 文件下载

---

### 4.5 获取数据统计

**接口地址**: `GET /api/environment/statistics`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startTime | string | 是 | 开始时间 |
| endTime | string | 是 | 结束时间 |
| type | string | 否 | 数据类型，默认all |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "temperature": {
      "avg": 25.5,
      "max": 28.0,
      "min": 23.0,
      "count": 100
    },
    "humidity": {
      "avg": 60,
      "max": 75,
      "min": 45,
      "count": 100
    },
    "pressure": {
      "avg": 1013.25,
      "max": 1015.0,
      "min": 1010.0,
      "count": 100
    }
  }
}
```

---

### 4.6 获取数据趋势

**接口地址**: `GET /api/environment/trends`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startTime | string | 是 | 开始时间 |
| endTime | string | 是 | 结束时间 |
| type | string | 是 | 数据类型 |
| interval | string | 否 | 时间间隔，默认hour，支持hour/day/week |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "labels": ["00:00", "01:00", "02:00"],
    "values": [25.5, 25.8, 26.0]
  }
}
```

---

## 5. 报警管理模块 (`/api/alerts`)

### 5.1 获取活跃报警

**接口地址**: `GET /api/alerts/active`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "alertId": "1",
      "type": "温度异常",
      "level": "high",
      "message": "设备1温度异常",
      "location": "A区",
      "timestamp": "2026-03-28T00:00:00.000Z",
      "processed": false
    }
  ]
}
```

---

### 5.2 获取报警列表

**接口地址**: `GET /api/alerts`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| level | string | 否 | 报警级别 |
| status | string | 否 | 状态，processed/unprocessed |
| type | string | 否 | 报警类型 |
| keyword | string | 否 | 关键词搜索 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "alertId": "1",
        "type": "温度异常",
        "level": "high",
        "message": "设备1温度异常",
        "location": "A区",
        "processed": false,
        "timestamp": "2026-03-28T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 5.3 标记报警为已处理

**接口地址**: `PUT /api/alerts/:alertId/process`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| note | string | 否 | 处理备注 |

**响应示例**:

```json
{
  "code": 200,
  "message": "报警已标记为已处理",
  "data": {
    "alertId": "1",
    "processed": true,
    "processedAt": "2026-03-28T00:00:00.000Z"
  }
}
```

---

## 6. 设备管理模块 (`/api/devices`)

### 6.1 获取设备统计

**接口地址**: `GET /api/devices/stats`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "online": 40,
    "offline": 5,
    "maintenance": 3,
    "error": 2
  }
}
```

---

## 7. 传感器管理模块 (`/api/sensors`)

### 7.1 获取传感器列表

**接口地址**: `GET /api/sensors`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| type | string | 否 | 传感器类型 |
| status | string | 否 | 状态 |
| keyword | string | 否 | 关键词搜索 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "sensorId": "1",
        "sensorName": "温度传感器1",
        "type": "temperature",
        "status": "online",
        "location": "A区",
        "lastUpdate": "2026-03-28T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 7.2 添加传感器

**接口地址**: `POST /api/sensors`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sensorName | string | 是 | 传感器名称 |
| type | string | 是 | 传感器类型 |
| model | string | 是 | 传感器型号 |
| serialNumber | string | 是 | 序列号 |
| location | string | 否 | 位置 |
| description | string | 否 | 描述 |

**响应示例**:

```json
{
  "code": 200,
  "message": "传感器添加成功",
  "data": {
    "sensorId": "sensor_123456",
    "sensorName": "温度传感器1"
  }
}
```

---

### 7.3 更新传感器信息

**接口地址**: `PUT /api/sensors/:sensorId`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sensorName | string | 是 | 传感器名称 |
| type | string | 是 | 传感器类型 |
| model | string | 是 | 传感器型号 |
| location | string | 否 | 位置 |
| description | string | 否 | 描述 |

**响应示例**:

```json
{
  "code": 200,
  "message": "传感器信息更新成功",
  "data": {
    "sensorId": "1",
    "sensorName": "温度传感器1"
  }
}
```

---

### 7.4 删除传感器

**接口地址**: `DELETE /api/sensors/:sensorId`

**响应示例**:

```json
{
  "code": 200,
  "message": "传感器删除成功",
  "data": null
}
```

---

## 8. 消息管理模块 (`/api/messages`)

### 8.1 获取消息列表

**接口地址**: `GET /api/messages`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| type | string | 否 | 消息类型 |
| status | string | 否 | 状态，read/unread |
| keyword | string | 否 | 关键词搜索 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "messageId": "1",
        "type": "system",
        "title": "系统通知",
        "content": "系统已启动",
        "unread": false,
        "timestamp": "2026-03-28T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 8.2 标记消息为已读

**接口地址**: `PUT /api/messages/:messageId/read`

**响应示例**:

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

**接口地址**: `PUT /api/messages/batch-read`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| messageIds | array | 是 | 消息ID数组 |

**响应示例**:

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

**接口地址**: `DELETE /api/messages/:messageId`

**响应示例**:

```json
{
  "code": 200,
  "message": "消息删除成功",
  "data": null
}
```

---

### 8.5 获取未读消息数量

**接口地址**: `GET /api/messages/unread-count`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "system": 3,
    "alert": 5,
    "notification": 2
  }
}
```

---

## 9. 用户管理模块 (`/api/users`)

### 9.1 获取用户列表

**接口地址**: `GET /api/users`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| role | string | 否 | 角色筛选 |
| status | string | 否 | 状态筛选 |
| keyword | string | 否 | 关键词搜索 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "userId": "1",
        "username": "admin",
        "email": "admin@example.com",
        "role": "1",
        "status": "online",
        "lastLogin": "2026-03-28T00:00:00.000Z",
        "createdAt": "2026-03-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 9.2 添加用户

**接口地址**: `POST /api/users`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| email | string | 是 | 邮箱 |
| password | string | 是 | 密码 |
| phone | string | 是 | 手机号 |
| role | string | 是 | 角色 |
| status | string | 是 | 状态 |

**响应示例**:

```json
{
  "code": 200,
  "message": "用户添加成功",
  "data": {
    "userId": "1",
    "username": "newuser"
  }
}
```

---

### 9.3 更新用户信息

**接口地址**: `PUT /api/users/:userId`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| email | string | 是 | 邮箱 |
| phone | string | 是 | 手机号 |
| role | string | 是 | 角色 |
| status | string | 是 | 状态 |

**响应示例**:

```json
{
  "code": 200,
  "message": "用户信息更新成功",
  "data": {
    "userId": "1",
    "username": "admin"
  }
}
```

---

### 9.4 删除用户

**接口地址**: `DELETE /api/users/:userId`

**响应示例**:

```json
{
  "code": 200,
  "message": "用户删除成功",
  "data": null
}
```

---

### 9.5 重置用户密码

**接口地址**: `POST /api/users/:userId/reset-password`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| newPassword | string | 是 | 新密码 |

**响应示例**:

```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

---

## 10. 系统管理模块 (`/api/system`)

### 10.1 获取系统状态

**接口地址**: `GET /api/system/status`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "database": "connected",
    "uptime": "1天 2小时 30分钟",
    "memory": {
      "used": "256MB",
      "total": "512MB",
      "percentage": "50%"
    },
    "cpu": {
      "1min": 0.5,
      "5min": 0.3,
      "15min": 0.2
    },
    "os": {
      "platform": "win32",
      "arch": "x64",
      "release": "10.0.19045"
    }
  }
}
```

---

### 10.2 获取系统配置

**接口地址**: `GET /api/system/config`

**响应示例**:

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

### 10.3 获取数据库状态

**接口地址**: `GET /api/system/database`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "connections": {
      "Max_used_connections": "100",
      "Threads_connected": "10",
      "Threads_running": "2"
    }
  }
}
```

---

### 10.4 获取系统设置

**接口地址**: `GET /api/system/settings`

**响应示例**:

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

### 10.5 获取系统日志

**接口地址**: `GET /api/system/logs`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "recent": [
      {
        "level": "info",
        "message": "系统启动",
        "timestamp": "2026-03-28T00:00:00.000Z"
      },
      {
        "level": "info",
        "message": "数据库连接成功",
        "timestamp": "2026-03-28T00:00:00.000Z"
      }
    ],
    "total": 0
  }
}
```

---

## 11. 报告管理模块 (`/api/reports`)

### 11.1 生成报告

**接口地址**: `POST /api/reports/generate`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 报告类型 |
| startTime | string | 是 | 开始时间 |
| endTime | string | 是 | 结束时间 |
| include | object | 否 | 包含内容 |
| format | string | 否 | 格式，默认pdf |

**响应示例**:

```json
{
  "code": 200,
  "message": "报告生成成功",
  "data": {
    "reportId": "550e8400-e29b-41d4-a716-446655440000",
    "fileName": "日常巡检报告_2026-03-28_1711584000000.pdf",
    "downloadUrl": "/api/reports/550e8400-e29b-41d4-a716-446655440000/download",
    "size": 1024,
    "createdAt": "2026-03-28T00:00:00.000Z"
  }
}
```

---

### 11.2 获取报告列表

**接口地址**: `GET /api/reports`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| type | string | 否 | 报告类型 |
| startTime | string | 否 | 开始时间 |
| endTime | string | 否 | 结束时间 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "reportId": "550e8400-e29b-41d4-a716-446655440000",
        "type": "daily",
        "title": "日常巡检报告_2026-03-28",
        "fileName": "日常巡检报告_2026-03-28.pdf",
        "size": 1024,
        "format": "pdf",
        "createdAt": "2026-03-28T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 11.3 下载报告

**接口地址**: `GET /api/reports/:reportId/download`

**响应**: 文件下载

---

### 11.4 删除报告

**接口地址**: `DELETE /api/reports/:reportId`

**响应示例**:

```json
{
  "code": 200,
  "message": "报告删除成功",
  "data": null
}
```

---

### 11.5 获取报告模板列表

**接口地址**: `GET /api/reports/templates`

**响应示例**:

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
    },
    {
      "templateId": "template_2",
      "name": "周度汇总报告模板",
      "description": "用于周度汇总的报告模板",
      "type": "weekly",
      "previewUrl": "/api/reports/templates/2/preview"
    },
    {
      "templateId": "template_3",
      "name": "月度分析报告模板",
      "description": "用于月度分析的报告模板",
      "type": "monthly",
      "previewUrl": "/api/reports/templates/3/preview"
    }
  ]
}
```

---

### 11.6 创建报告模板

**接口地址**: `POST /api/reports/templates`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 模板名称 |
| description | string | 否 | 描述 |
| type | string | 是 | 模板类型 |
| sections | array | 是 | 模板章节 |
| format | string | 是 | 格式 |

**响应示例**:

```json
{
  "code": 200,
  "message": "模板创建成功",
  "data": {
    "templateId": "template_1711584000000",
    "name": "自定义报告模板"
  }
}
```

---

### 11.7 更新报告模板

**接口地址**: `PUT /api/reports/templates/:templateId`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 模板名称 |
| description | string | 否 | 描述 |
| type | string | 是 | 模板类型 |
| sections | array | 是 | 模板章节 |
| format | string | 是 | 格式 |

**响应示例**:

```json
{
  "code": 200,
  "message": "模板更新成功",
  "data": {
    "templateId": "template_1",
    "name": "日常巡检报告模板"
  }
}
```

---

### 11.8 删除报告模板

**接口地址**: `DELETE /api/reports/templates/:templateId`

**响应示例**:

```json
{
  "code": 200,
  "message": "模板删除成功",
  "data": null
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 注意事项

1. 所有接口返回的时间戳均为ISO 8601格式
2. 分页接口默认每页返回10条数据
3. 需要认证的接口需要在请求头中携带JWT Token
4. 文件下载接口直接返回文件流
5. 部分接口支持缓存，缓存时间根据接口类型不同而不同

---

## 更新日志

- 2026-03-28: 初始版本，包含所有核心接口文档
