# AI Project

这是一个基于Express.js的物联网后端系统，用于处理环境数据、设备管理和用户认证等功能。

## 项目结构

```
ai-project/
├── bin/              # 启动脚本
├── config/           # 配置文件
├── data/             # 数据存储
├── middlewares/      # 中间件
├── routes/           # 路由
├── scripts/          # 脚本文件
├── logs/             # 日志文件
├── public/           # 静态文件
├── views/            # 视图文件
├── app.js            # 应用入口
├── package.json      # 项目配置
└── README.md         # 项目说明
```

## 主要功能

- **环境数据管理**：获取和分析环境数据，包括温度、湿度、气压等
- **设备管理**：管理物联网设备的状态和配置
- **用户认证**：基于JWT的用户认证系统
- **数据导出**：支持导出环境数据为Excel和CSV格式
- **实时数据**：通过SSE实现实时数据推送

## 技术栈

- **后端框架**：Express.js
- **数据库**：MySQL
- **缓存**：Redis
- **认证**：JWT
- **实时通信**：SSE
- **日志**：Winston

## 安装和运行

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建`.env`文件，配置以下环境变量：

```env
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=12305
DB_NAME=kpl
DB_CONNECTION_LIMIT=30

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 服务器配置
PORT=3000
NODE_ENV=development

# 安全配置
JWT_SECRET=your_jwt_secret_key

# 日志配置
LOG_LEVEL=info
```

### 启动服务器

```bash
npm start
```

### 启动Socket服务器

```bash
npm run socket-server
```

## API接口

### 环境数据

- `GET /api/environment/data` - 获取最新环境数据
- `GET /api/environment/temperature-history` - 获取温度历史数据
- `GET /api/environment/data-list` - 获取环境数据列表
- `POST /api/environment/export` - 导出环境数据
- `GET /api/environment/statistics` - 获取环境数据统计
- `GET /api/environment/trends` - 获取环境数据趋势

### 设备管理

- `GET /api/devices` - 获取设备列表
- `POST /api/devices` - 添加设备
- `PUT /api/devices/:id` - 更新设备
- `DELETE /api/devices/:id` - 删除设备

### 用户认证

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息

## 数据库优化

### 运行数据库优化脚本

```bash
node scripts/db-optimize.js
```

### 数据库索引

系统会自动创建以下索引：

- `idx_environment_record_time` - 环境数据表的时间索引
- `idx_sensor_record_time` - 传感器数据表的时间索引
- `idx_alerts_created_at` - 警报表的创建时间索引
- `idx_devices_status` - 设备表的状态索引
- `idx_users_email` - 用户表的邮箱索引

## 性能优化

1. **数据库连接池**：使用连接池管理数据库连接
2. **Redis缓存**：缓存频繁访问的数据
3. **请求验证**：使用Joi验证请求数据
4. **速率限制**：防止请求过于频繁
5. **安全防护**：使用Helmet保护应用安全

## 日志系统

系统使用Winston进行日志管理，日志文件存储在`logs`目录：

- `error.log` - 错误日志
- `combined.log` - 综合日志

## 监控和报警

系统集成了性能监控和报警机制，可通过以下命令查看系统状态：

```bash
npm run db:status
```

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT
