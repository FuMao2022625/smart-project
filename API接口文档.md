# AI项目API接口文档

## 文档说明

本文档描述了AI项目的所有API接口，包括认证、机器人、环境数据、告警、设备、传感器、消息、用户、系统、报告、Qwen AI和智能分析等模块。所有接口均返回JSON格式数据，包含code、message、data和timestamp字段。

## 接口列表

### 认证模块
- POST /api/auth/login - 用户登录
- POST /api/auth/register - 用户注册
- POST /api/auth/reset-password - 重置密码

### 机器人模块
- GET /api/robot/positions - 获取机器人位置
- GET /api/robot - 获取机器人列表
- POST /api/robot - 添加机器人
- PUT /api/robot/:robotId - 更新机器人信息
- DELETE /api/robot/:robotId - 删除机器人
- POST /api/robot/:robotId/control - 控制机器人

### SSE模块
- GET /api/sse/status - 获取SSE服务状态
- GET /api/sse/latest-data - 获取最新传感器数据
- GET /api/sse/history - 获取传感器历史数据

### 环境数据模块
- GET /api/environment/data - 获取最新环境数据
- GET /api/environment/temperature-history - 获取温度历史数据
- GET /api/environment/data-list - 获取环境数据列表
- POST /api/environment/export - 导出环境数据
- GET /api/environment/statistics - 获取环境统计数据
- GET /api/environment/trends - 获取环境数据趋势

### 告警模块
- GET /api/alerts/active - 获取活跃告警
- GET /api/alerts - 获取告警列表
- PUT /api/alerts/:alertId/process - 处理告警

### 设备模块
- GET /api/devices/stats - 获取设备统计信息
- GET /api/devices - 获取设备列表
- POST /api/devices - 添加设备
- GET /api/devices/:deviceId - 获取设备详情
- PUT /api/devices/:deviceId - 更新设备信息
- DELETE /api/devices/:deviceId - 删除设备

### 传感器模块
- GET /api/sensors - 获取传感器列表
- POST /api/sensors - 添加传感器
- PUT /api/sensors/:sensorId - 更新传感器信息
- DELETE /api/sensors/:sensorId - 删除传感器

### 消息模块
- GET /api/messages - 获取消息列表
- PUT /api/messages/:messageId/read - 标记消息为已读
- PUT /api/messages/batch-read - 批量标记消息为已读
- DELETE /api/messages/:messageId - 删除消息
- GET /api/messages/unread-count - 获取未读消息数量

### 用户模块
- GET /api/users - 获取用户列表
- POST /api/users - 添加用户
- PUT /api/users/:userId - 更新用户信息
- DELETE /api/users/:userId - 删除用户
- POST /api/users/:userId/reset-password - 重置用户密码

### 系统模块
- GET /api/system/status - 获取系统状态
- GET /api/system/config - 获取系统配置
- GET /api/system/database - 获取数据库状态
- GET /api/system/settings - 获取系统设置
- GET /api/system/logs - 获取系统日志
- PUT /api/system/settings - 更新系统设置

### 报告模块
- POST /api/reports/generate - 生成报告
- GET /api/reports - 获取报告列表
- GET /api/reports/:reportId/download - 下载报告
- DELETE /api/reports/:reportId - 删除报告
- GET /api/reports/templates - 获取报告模板
- POST /api/reports/templates - 创建报告模板
- PUT /api/reports/templates/:templateId - 更新报告模板
- DELETE /api/reports/templates/:templateId - 删除报告模板

### Qwen AI模块
- POST /api/qwen/chat - Qwen AI聊天
- GET /api/qwen/config - 获取Qwen配置

### 智能分析模块
- POST /api/ai/predict/environment - 环境数据预测
- POST /api/ai/predict/device-failure - 设备故障预测
- POST /api/ai/detect/anomalies - 异常检测
- POST /api/ai/generate/report - 智能分析报告生成
- POST /api/ai/query - 自然语言查询处理
- GET /api/ai/analyze/environment - 获取环境数据并进行智能分析

### 报警模块
- GET /api/alarms - 获取报警列表
- POST /api/alarms - 创建报警
- GET /api/alarms/:alarmId - 获取报警详情
- PUT /api/alarms/:alarmId - 更新报警信息
- DELETE /api/alarms/:alarmId - 删除报警

### 审计日志模块
- GET /api/audit-logs - 获取审计日志列表
- GET /api/audit-logs/:logId - 获取审计日志详情

### 角色模块
- GET /api/roles - 获取角色列表
- POST /api/roles - 创建角色
- GET /api/roles/:roleId - 获取角色详情
- PUT /api/roles/:roleId - 更新角色信息
- DELETE /api/roles/:roleId - 删除角色

### 传感器数据模块
- GET /api/sensor-data - 获取传感器数据列表
- POST /api/sensor-data - 创建传感器数据
- GET /api/sensor-data/:dataId - 获取传感器数据详情
- GET /api/sensor-data/stats - 获取传感器数据统计

## 详细接口说明

### 认证模块

#### POST /api/auth/login
**功能**：用户登录
**请求参数**：
- username: 用户名
- password: 密码
- phone: 手机号

**响应示例**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "JWT token",
    "userInfo": {
      "id": "1",
      "username": "admin",
      "role": "1",
      "avatar": null
    }
  },
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

#### POST /api/auth/register
**功能**：用户注册
**请求参数**：
- username: 用户名
- password: 密码
- confirmPassword: 确认密码
- email: 邮箱
- phone: 手机号

**响应示例**：
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "1",
    "username": "testuser"
  }
}
```

#### POST /api/auth/reset-password
**功能**：重置密码
**请求参数**：
- email: 邮箱

**响应示例**：
```json
{
  "code": 200,
  "message": "重置密码邮件已发送",
  "data": null
}
```

### 机器人模块

#### GET /api/robot/positions
**功能**：获取机器人位置
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "robotId": "1",
      "robotName": "Robot 1",
      "x": 0,
      "y": 0,
      "status": "online",
      "battery": 100,
      "lastUpdate": "2026-04-02T22:26:23.123Z"
    }
  ]
}
```

#### GET /api/robot
**功能**：获取机器人列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- status: 状态
- keyword: 关键词

**响应示例**：
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
        "robotName": "Robot 1",
        "type": "巡检",
        "status": "online",
        "battery": 100,
        "location": "A区",
        "lastUpdate": "2026-04-02T22:26:23.123Z"
      }
    ]
  }
}
```

#### POST /api/robot
**功能**：添加机器人
**请求参数**：
- id: 机器人ID
- name: 机器人名称
- type: 类型
- model: 型号
- serialNumber: 序列号
- location: 位置
- description: 描述
- status: 状态，默认"离线"
- battery: 电池电量，默认100

**响应示例**：
```json
{
  "code": 200,
  "message": "机器人添加成功",
  "data": {
    "robotId": "1",
    "name": "Robot 1",
    "status": "离线",
    "battery": 100
  }
}
```

#### PUT /api/robot/:robotId
**功能**：更新机器人信息
**请求参数**：
- name: 机器人名称
- type: 类型
- model: 型号
- location: 位置
- description: 描述
- status: 状态
- battery: 电池电量

**响应示例**：
```json
{
  "code": 200,
  "message": "机器人信息更新成功",
  "data": {
    "robotId": "1",
    "name": "Robot 1"
  }
}
```

#### DELETE /api/robot/:robotId
**功能**：删除机器人
**响应示例**：
```json
{
  "code": 200,
  "message": "机器人删除成功",
  "data": null
}
```

#### POST /api/robot/:robotId/control
**功能**：控制机器人
**请求参数**：
- command: 命令
- parameters: 参数

**响应示例**：
```json
{
  "code": 200,
  "message": "控制指令发送成功",
  "data": {
    "robotId": "1",
    "command": "move",
    "timestamp": "2026-04-02T22:26:23.123Z"
  }
}
```

### SSE模块

#### GET /api/sse/status
**功能**：获取SSE服务状态
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "running",
    "connectedClients": 0,
    "config": {
      "cacheTTL": 1000,
      "corsEnabled": true
    },
    "timestamp": "2026-04-02T22:26:23.123Z"
  }
}
```

#### GET /api/sse/latest-data
**功能**：获取最新传感器数据
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "type": "temperature",
    "temperature": 25.5,
    "humidity": 45.0,
    "smokeLevel": 10,
    "maxTemp": 30.0,
    "humanDetected": false,
    "fireRisk": "low",
    "envStatus": "normal",
    "battery": 95,
    "timestamp": "2026-04-02T22:26:23.123Z"
  },
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

#### GET /api/sse/history
**功能**：获取传感器历史数据
**查询参数**：
- limit: 数据条数，默认100，最大1000

**响应示例**：
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
        "humidity": 45.0,
        "smokeLevel": 10,
        "maxTemp": 30.0,
        "humanDetected": false,
        "fireRisk": "low",
        "envStatus": "normal",
        "battery": 95
      }
    ]
  },
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

### 环境数据模块

#### GET /api/environment/data
**功能**：获取最新环境数据
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "temperature": 25.5,
    "humidity": 45.0,
    "pressure": 10,
    "co2": null,
    "pm25": null,
    "timestamp": "2026-04-02T22:26:23.123Z"
  }
}
```

#### GET /api/environment/temperature-history
**功能**：获取温度历史数据
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "labels": ["22:00:00", "22:10:00", "22:20:00"],
    "temperatures": [25.5, 25.6, 25.7]
  }
}
```

#### GET /api/environment/data-list
**功能**：获取环境数据列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- startTime: 开始时间
- endTime: 结束时间
- type: 类型
- location: 位置

**响应示例**：
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
        "timestamp": "2026-04-02T22:26:23.123Z"
      }
    ]
  }
}
```

#### POST /api/environment/export
**功能**：导出环境数据
**请求参数**：
- startTime: 开始时间
- endTime: 结束时间
- type: 类型
- location: 位置
- format: 格式，默认"xlsx"，可选"csv"

**响应**：文件下载

#### GET /api/environment/statistics
**功能**：获取环境统计数据
**查询参数**：
- startTime: 开始时间
- endTime: 结束时间
- type: 类型，默认"all"

**响应示例**：
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
      "avg": 45.0,
      "max": 60.0,
      "min": 30.0,
      "count": 100
    },
    "pressure": {
      "avg": 10.0,
      "max": 20.0,
      "min": 5.0,
      "count": 100
    }
  }
}
```

#### GET /api/environment/trends
**功能**：获取环境数据趋势
**查询参数**：
- startTime: 开始时间
- endTime: 结束时间
- type: 类型
- interval: 时间间隔，默认"hour"，可选"day"、"week"

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "labels": ["10:00", "11:00", "12:00"],
    "values": [25.5, 25.6, 25.7]
  }
}
```

### 告警模块

#### GET /api/alerts/active
**功能**：获取活跃告警
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "alertId": "1",
      "type": "温度异常",
      "level": "high",
      "message": "设备1温度过高",
      "location": "A区",
      "timestamp": "2026-04-02T22:26:23.123Z",
      "processed": false
    }
  ]
}
```

#### GET /api/alerts
**功能**：获取告警列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- level: 级别
- status: 状态
- type: 类型
- keyword: 关键词

**响应示例**：
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
        "message": "设备1温度过高",
        "location": "A区",
        "processed": false,
        "timestamp": "2026-04-02T22:26:23.123Z"
      }
    ]
  }
}
```

#### PUT /api/alerts/:alertId/process
**功能**：处理告警
**请求参数**：
- note: 处理备注

**响应示例**：
```json
{
  "code": 200,
  "message": "报警已标记为已处理",
  "data": {
    "alertId": "1",
    "processed": true,
    "processedAt": "2026-04-02T22:26:23.123Z"
  }
}
```

### 设备模块

#### GET /api/devices/stats
**功能**：获取设备统计信息
**响应示例**：
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

#### GET /api/devices
**功能**：获取设备列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- status: 状态
- type_id: 设备类型ID
- location: 位置
- keyword: 关键词

**响应示例**：
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
        "id": "device_1",
        "name": "温度传感器",
        "type_id": 1,
        "model": "TS-100",
        "serial_number": "SN123456",
        "location": "A区",
        "status": "online",
        "install_date": "2026-01-01T00:00:00.000Z",
        "last_maintenance": "2026-03-01T00:00:00.000Z",
        "next_maintenance": "2026-06-01T00:00:00.000Z",
        "last_heartbeat": "2026-04-02T22:26:23.123Z",
        "create_time": "2026-01-01T00:00:00.000Z",
        "update_time": "2026-04-02T22:26:23.123Z"
      }
    ]
  }
}
```

#### POST /api/devices
**功能**：添加设备
**请求参数**：
- id: 设备ID
- name: 设备名称
- type_id: 设备类型ID
- model: 设备型号
- serial_number: 设备序列号
- location: 设备部署位置
- status: 设备状态
- install_date: 安装日期
- last_maintenance: 最后维护时间
- next_maintenance: 下次维护时间

**响应示例**：
```json
{
  "code": 200,
  "message": "设备添加成功",
  "data": {
    "id": "device_1",
    "name": "温度传感器",
    "status": "offline"
  }
}
```

#### GET /api/devices/:deviceId
**功能**：获取设备详情
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "device_1",
    "name": "温度传感器",
    "type_id": 1,
    "model": "TS-100",
    "serial_number": "SN123456",
    "location": "A区",
    "status": "online",
    "install_date": "2026-01-01T00:00:00.000Z",
    "last_maintenance": "2026-03-01T00:00:00.000Z",
    "next_maintenance": "2026-06-01T00:00:00.000Z",
    "last_heartbeat": "2026-04-02T22:26:23.123Z",
    "create_time": "2026-01-01T00:00:00.000Z",
    "update_time": "2026-04-02T22:26:23.123Z"
  }
}
```

#### PUT /api/devices/:deviceId
**功能**：更新设备信息
**请求参数**：
- name: 设备名称
- type_id: 设备类型ID
- model: 设备型号
- location: 设备部署位置
- status: 设备状态
- last_maintenance: 最后维护时间
- next_maintenance: 下次维护时间

**响应示例**：
```json
{
  "code": 200,
  "message": "设备信息更新成功",
  "data": {
    "id": "device_1",
    "name": "温度传感器",
    "status": "online"
  }
}
```

#### DELETE /api/devices/:deviceId
**功能**：删除设备
**响应示例**：
```json
{
  "code": 200,
  "message": "设备删除成功",
  "data": null
}
```

### 传感器模块

#### GET /api/sensors
**功能**：获取传感器列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- type: 类型
- status: 状态
- keyword: 关键词

**响应示例**：
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
        "sensorId": "1",
        "sensorName": "温度传感器1",
        "type": "1",
        "status": "online",
        "location": "A区",
        "lastUpdate": "2026-04-02T22:26:23.123Z"
      }
    ]
  }
}
```

#### POST /api/sensors
**功能**：添加传感器
**请求参数**：
- sensorName: 传感器名称
- type: 类型
- model: 型号
- serialNumber: 序列号
- location: 位置
- description: 描述

**响应示例**：
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

#### PUT /api/sensors/:sensorId
**功能**：更新传感器信息
**请求参数**：
- sensorName: 传感器名称
- type: 类型
- model: 型号
- location: 位置
- description: 描述

**响应示例**：
```json
{
  "code": 200,
  "message": "传感器信息更新成功",
  "data": {
    "sensorId": "sensor_123456",
    "sensorName": "温度传感器1"
  }
}
```

#### DELETE /api/sensors/:sensorId
**功能**：删除传感器
**响应示例**：
```json
{
  "code": 200,
  "message": "传感器删除成功",
  "data": null
}
```

### 消息模块

#### GET /api/messages
**功能**：获取消息列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- type: 类型
- status: 状态
- keyword: 关键词

**响应示例**：
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
        "messageId": "1",
        "type": "system",
        "title": "系统通知",
        "content": "系统已更新",
        "unread": true,
        "timestamp": "2026-04-02T22:26:23.123Z"
      }
    ]
  }
}
```

#### PUT /api/messages/:messageId/read
**功能**：标记消息为已读
**响应示例**：
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

#### PUT /api/messages/batch-read
**功能**：批量标记消息为已读
**请求参数**：
- messageIds: 消息ID数组

**响应示例**：
```json
{
  "code": 200,
  "message": "批量标记成功",
  "data": {
    "count": 5
  }
}
```

#### DELETE /api/messages/:messageId
**功能**：删除消息
**响应示例**：
```json
{
  "code": 200,
  "message": "消息删除成功",
  "data": null
}
```

#### GET /api/messages/unread-count
**功能**：获取未读消息数量
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "system": 2,
    "alert": 1,
    "notification": 2
  }
}
```

### 用户模块

#### GET /api/users
**功能**：获取用户列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- role: 角色
- status: 状态
- keyword: 关键词

**响应示例**：
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
        "userId": "1",
        "username": "admin",
        "email": "admin@example.com",
        "role": "1",
        "status": "active",
        "lastLogin": "2026-04-02T22:26:23.123Z",
        "createdAt": "2026-04-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### POST /api/users
**功能**：添加用户
**请求参数**：
- username: 用户名
- email: 邮箱
- password: 密码
- phone: 手机号
- role: 角色
- status: 状态

**响应示例**：
```json
{
  "code": 200,
  "message": "用户添加成功",
  "data": {
    "userId": "1",
    "username": "testuser"
  }
}
```

#### PUT /api/users/:userId
**功能**：更新用户信息
**请求参数**：
- username: 用户名
- email: 邮箱
- phone: 手机号
- role: 角色
- status: 状态

**响应示例**：
```json
{
  "code": 200,
  "message": "用户信息更新成功",
  "data": {
    "userId": "1",
    "username": "testuser"
  }
}
```

#### DELETE /api/users/:userId
**功能**：删除用户
**响应示例**：
```json
{
  "code": 200,
  "message": "用户删除成功",
  "data": null
}
```

#### POST /api/users/:userId/reset-password
**功能**：重置用户密码
**请求参数**：
- newPassword: 新密码

**响应示例**：
```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

### 系统模块

#### GET /api/system/status
**功能**：获取系统状态
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "database": "connected",
    "uptime": "1天 2小时 30分钟",
    "memory": {
      "used": "512MB",
      "total": "2GB",
      "percentage": "25%"
    },
    "cpu": {
      "1min": 0.1,
      "5min": 0.2,
      "15min": 0.15
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
    "os": "Windows Server 2019"
  }
}
```

#### GET /api/system/config
**功能**：获取系统配置
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "version": "1.0.0",
    "nodeEnv": "development",
    "apiPrefix": "/api",
    "port": "3000"
  }
}
```

#### GET /api/system/database
**功能**：获取数据库状态
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "connections": {
      "Connections": "10",
      "Max_used_connections": "5"
    }
  }
}
```

#### GET /api/system/settings
**功能**：获取系统设置
**响应示例**：
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

#### GET /api/system/logs
**功能**：获取系统日志
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "recent": [
      {
        "level": "info",
        "message": "系统启动",
        "timestamp": "2026-04-02T22:26:23.123Z"
      },
      {
        "level": "info",
        "message": "数据库连接成功",
        "timestamp": "2026-04-02T22:26:23.123Z"
      }
    ],
    "total": 0
  }
}
```

#### PUT /api/system/settings
**功能**：更新系统设置
**请求参数**：
- appName: 应用名称
- features: 功能配置

**响应示例**：
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

### 报告模块

#### POST /api/reports/generate
**功能**：生成报告
**请求参数**：
- type: 报告类型
- startTime: 开始时间
- endTime: 结束时间
- include: 包含内容
- format: 格式，默认"pdf"

**响应示例**：
```json
{
  "code": 200,
  "message": "报告生成成功",
  "data": {
    "reportId": "123e4567-e89b-12d3-a456-426614174000",
    "fileName": "温度报告_2026-04-02_123456.pdf",
    "downloadUrl": "/api/reports/123e4567-e89b-12d3-a456-426614174000/download",
    "size": 1024,
    "createdAt": "2026-04-02T22:26:23.123Z"
  }
}
```

#### GET /api/reports
**功能**：获取报告列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- type: 报告类型
- startTime: 开始时间
- endTime: 结束时间

**响应示例**：
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
        "reportId": "123e4567-e89b-12d3-a456-426614174000",
        "type": "temperature",
        "title": "温度报告_2026-04-02",
        "fileName": "温度报告_2026-04-02.pdf",
        "size": 1024,
        "format": "pdf",
        "createdAt": "2026-04-02T22:26:23.123Z"
      }
    ]
  }
}
```

#### GET /api/reports/:reportId/download
**功能**：下载报告
**响应**：文件下载

#### DELETE /api/reports/:reportId
**功能**：删除报告
**响应示例**：
```json
{
  "code": 200,
  "message": "报告删除成功",
  "data": null
}
```

#### GET /api/reports/templates
**功能**：获取报告模板
**响应示例**：
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

#### POST /api/reports/templates
**功能**：创建报告模板
**请求参数**：
- name: 模板名称
- description: 描述
- type: 类型
- sections:  sections
- format: 格式

**响应示例**：
```json
{
  "code": 200,
  "message": "模板创建成功",
  "data": {
    "templateId": "template_123456",
    "name": "测试模板"
  }
}
```

#### PUT /api/reports/templates/:templateId
**功能**：更新报告模板
**请求参数**：
- name: 模板名称
- description: 描述
- type: 类型
- sections:  sections
- format: 格式

**响应示例**：
```json
{
  "code": 200,
  "message": "模板更新成功",
  "data": {
    "templateId": "template_123456",
    "name": "测试模板"
  }
}
```

#### DELETE /api/reports/templates/:templateId
**功能**：删除报告模板
**响应示例**：
```json
{
  "code": 200,
  "message": "模板删除成功",
  "data": null
}
```

### Qwen AI模块

#### POST /api/qwen/chat
**功能**：Qwen AI聊天
**请求参数**：
- messages: 消息数组
- model: 模型，默认"qwen-max"
- temperature: 温度，默认0.7

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "chatcmpl-123",
    "object": "chat.completion",
    "created": 1677858242,
    "model": "qwen-max",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "Hello!"
        },
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": 10,
      "completion_tokens": 5,
      "total_tokens": 15
    }
  },
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

#### GET /api/qwen/config
**功能**：获取Qwen配置
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "workspaceName": "AI Project",
    "workspaceId": "123456",
    "apiHost": "api.qwen.com"
  },
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

### 智能分析模块

#### POST /api/ai/predict/environment
**功能**：环境数据预测
**请求参数**：
- data: 数据数组

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "prediction": [
      {
        "timestamp": "2026-04-03T00:00:00.000Z",
        "temperature": 26.0,
        "humidity": 46.0,
        "pressure": 11.0
      }
    ]
  },
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

#### POST /api/ai/predict/device-failure
**功能**：设备故障预测
**请求参数**：
- deviceData: 设备数据

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "prediction": {
      "deviceId": "1",
      "failureProbability": 0.1,
      "failureType": "low",
      "recommendation": "正常运行"
    }
  },
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

#### POST /api/ai/detect/anomalies
**功能**：异常检测
**请求参数**：
- data: 数据
- type: 类型

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "anomalies": [
      {
        "timestamp": "2026-04-02T22:26:23.123Z",
        "value": 35.0,
        "type": "temperature",
        "severity": "high"
      }
    ]
  },
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

#### POST /api/ai/generate/report
**功能**：智能分析报告生成
**请求参数**：
- data: 数据
- reportType: 报告类型

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "report": {
      "title": "环境数据分析报告",
      "summary": "本周温度平均25.5℃，湿度45%",
      "details": "详细分析..."
    }
  },
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

#### POST /api/ai/query
**功能**：自然语言查询处理
**请求参数**：
- query: 查询语句
- context: 上下文

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "response": "今天的平均温度是25.5℃"
  },
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

#### GET /api/ai/analyze/environment
**功能**：获取环境数据并进行智能分析
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "report": {
      "title": "环境数据分析报告",
      "summary": "最近24小时温度平均25.5℃，湿度45%",
      "details": "详细分析..."
    },
    "dataPoints": 100
  },
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

### 报警模块

#### GET /api/alarms
**功能**：获取报警列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- level: 报警级别
- status: 报警状态
- device_id: 设备ID
- start_time: 开始时间
- end_time: 结束时间

**响应示例**：
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
        "id": 1,
        "alarm_item": "温度异常",
        "level": "high",
        "device_id": "device_1",
        "device_name": "温度传感器",
        "location": "A区",
        "alarm_time": "2026-04-02T22:26:23.123Z",
        "resolve_time": null,
        "status": "pending",
        "handle_notes": null,
        "create_time": "2026-04-02T22:26:23.123Z",
        "update_time": "2026-04-02T22:26:23.123Z"
      }
    ]
  }
}
```

#### POST /api/alarms
**功能**：创建报警
**请求参数**：
- alarm_item: 报警项
- level: 报警级别
- device_id: 关联设备ID
- device_name: 设备名称
- location: 报警位置
- alarm_time: 报警时间
- status: 报警状态
- handle_notes: 处理备注

**响应示例**：
```json
{
  "code": 200,
  "message": "报警创建成功",
  "data": {
    "id": 1,
    "alarm_item": "温度异常",
    "level": "high",
    "status": "pending"
  }
}
```

#### GET /api/alarms/:alarmId
**功能**：获取报警详情
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "alarm_item": "温度异常",
    "level": "high",
    "device_id": "device_1",
    "device_name": "温度传感器",
    "location": "A区",
    "alarm_time": "2026-04-02T22:26:23.123Z",
    "resolve_time": null,
    "status": "pending",
    "handle_notes": null,
    "create_time": "2026-04-02T22:26:23.123Z",
    "update_time": "2026-04-02T22:26:23.123Z"
  }
}
```

#### PUT /api/alarms/:alarmId
**功能**：更新报警信息
**请求参数**：
- level: 报警级别
- status: 报警状态
- resolve_time: 解决时间
- handle_notes: 处理备注

**响应示例**：
```json
{
  "code": 200,
  "message": "报警信息更新成功",
  "data": {
    "id": 1,
    "status": "resolved",
    "resolve_time": "2026-04-02T22:30:23.123Z"
  }
}
```

#### DELETE /api/alarms/:alarmId
**功能**：删除报警
**响应示例**：
```json
{
  "code": 200,
  "message": "报警删除成功",
  "data": null
}
```

### 审计日志模块

#### GET /api/audit-logs
**功能**：获取审计日志列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- user_id: 操作用户ID
- action: 操作类型
- resource_type: 资源类型
- start_time: 开始时间
- end_time: 结束时间

**响应示例**：
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
        "id": 1,
        "user_id": 1,
        "action": "login",
        "resource_type": "user",
        "resource_id": "1",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0",
        "details": {"login_time": "2026-04-02T22:26:23.123Z"},
        "create_time": "2026-04-02T22:26:23.123Z"
      }
    ]
  }
}
```

#### GET /api/audit-logs/:logId
**功能**：获取审计日志详情
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "user_id": 1,
    "action": "login",
    "resource_type": "user",
    "resource_id": "1",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0",
    "details": {"login_time": "2026-04-02T22:26:23.123Z"},
    "create_time": "2026-04-02T22:26:23.123Z"
  }
}
```

### 角色模块

#### GET /api/roles
**功能**：获取角色列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- keyword: 关键词

**响应示例**：
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
        "id": 1,
        "name": "admin",
        "description": "管理员角色",
        "permissions": {"users": "all", "devices": "all"},
        "create_time": "2026-04-01T00:00:00.000Z",
        "update_time": "2026-04-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### POST /api/roles
**功能**：创建角色
**请求参数**：
- name: 角色名称
- description: 角色描述
- permissions: 角色权限

**响应示例**：
```json
{
  "code": 200,
  "message": "角色创建成功",
  "data": {
    "id": 1,
    "name": "admin",
    "description": "管理员角色"
  }
}
```

#### GET /api/roles/:roleId
**功能**：获取角色详情
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "admin",
    "description": "管理员角色",
    "permissions": {"users": "all", "devices": "all"},
    "create_time": "2026-04-01T00:00:00.000Z",
    "update_time": "2026-04-01T00:00:00.000Z"
  }
}
```

#### PUT /api/roles/:roleId
**功能**：更新角色信息
**请求参数**：
- name: 角色名称
- description: 角色描述
- permissions: 角色权限

**响应示例**：
```json
{
  "code": 200,
  "message": "角色信息更新成功",
  "data": {
    "id": 1,
    "name": "admin",
    "description": "超级管理员角色"
  }
}
```

#### DELETE /api/roles/:roleId
**功能**：删除角色
**响应示例**：
```json
{
  "code": 200,
  "message": "角色删除成功",
  "data": null
}
```

### 传感器数据模块

#### GET /api/sensor-data
**功能**：获取传感器数据列表
**查询参数**：
- page: 页码，默认1
- pageSize: 每页数量，默认10
- device_id: 设备ID
- type: 传感器类型
- start_time: 开始时间
- end_time: 结束时间

**响应示例**：
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
        "id": 1,
        "device_id": "device_1",
        "type": "temperature",
        "temperature": 25.5,
        "humidity": 45.0,
        "smoke_level": 10.0,
        "max_temp": {"value": 30.0, "timestamp": "2026-04-02T22:00:00.000Z"},
        "human_detected": false,
        "fire_risk": 0,
        "env_status": 0.0,
        "battery": 100,
        "record_time": "2026-04-02T22:26:23.123Z",
        "create_time": "2026-04-02T22:26:23.123Z"
      }
    ]
  }
}
```

#### POST /api/sensor-data
**功能**：创建传感器数据
**请求参数**：
- device_id: 设备ID
- type: 传感器类型
- temperature: 温度
- humidity: 湿度
- smoke_level: 烟雾浓度
- max_temp: 最高温度
- human_detected: 是否检测到人
- fire_risk: 火灾风险等级
- env_status: 环境状态
- battery: 电池电量
- record_time: 记录时间

**响应示例**：
```json
{
  "code": 200,
  "message": "传感器数据创建成功",
  "data": {
    "id": 1,
    "device_id": "device_1",
    "type": "temperature",
    "record_time": "2026-04-02T22:26:23.123Z"
  }
}
```

#### GET /api/sensor-data/:dataId
**功能**：获取传感器数据详情
**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "device_id": "device_1",
    "type": "temperature",
    "temperature": 25.5,
    "humidity": 45.0,
    "smoke_level": 10.0,
    "max_temp": {"value": 30.0, "timestamp": "2026-04-02T22:00:00.000Z"},
    "human_detected": false,
    "fire_risk": 0,
    "env_status": 0.0,
    "battery": 100,
    "record_time": "2026-04-02T22:26:23.123Z",
    "create_time": "2026-04-02T22:26:23.123Z"
  }
}
```

#### GET /api/sensor-data/stats
**功能**：获取传感器数据统计
**查询参数**：
- device_id: 设备ID
- type: 传感器类型
- start_time: 开始时间
- end_time: 结束时间

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "temperature": {
      "avg": 25.5,
      "max": 30.0,
      "min": 20.0,
      "count": 1000
    },
    "humidity": {
      "avg": 45.0,
      "max": 60.0,
      "min": 30.0,
      "count": 1000
    },
    "smoke_level": {
      "avg": 10.0,
      "max": 50.0,
      "min": 0.0,
      "count": 1000
    }
  }
}
```

## 错误处理

所有接口在遇到错误时，会返回以下格式的错误响应：

```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null,
  "timestamp": "2026-04-02T22:26:23.123Z"
}
```

常见的错误码：
- 400: 请求参数错误
- 401: 未授权
- 404: 资源不存在
- 500: 服务器内部错误

## 注意事项

1. 所有接口均返回JSON格式数据
2. 所有时间戳均为ISO格式
3. 所有ID字段均为字符串类型
4. 分页接口默认页码为1，默认每页数量为10
5. 部分接口需要认证，需要在请求头中携带Authorization token
6. 环境数据接口现在使用sensor_data表作为数据源