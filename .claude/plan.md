# 车辆信息管理系统 - 架构设计文档

## 一、系统概述

这是一个基于 **Golang + Angular** 的车辆信息管理系统，支持多角色注册和车辆信息管理，使用 JWT 进行安全验证。

### 核心功能需求
1. **用户注册**：支持三种角色（admin、user、company）
2. **车辆信息管理**：用户可以保存和管理自己的车辆信息
3. **JWT 认证**：安全的身份验证机制
4. **角色权限控制**：不同角色有不同的访问权限

---

## 二、技术栈选择

### 后端 (Golang)
- **Web 框架**：Gin (轻量级、高性能)
- **JWT 认证**：github.com/golang-jwt/jwt/v5
- **数据库**：PostgreSQL (支持 JSONB) / MySQL 5.7+ (支持 JSON)
- **ORM**：GORM (支持多种数据库)
- **密码加密**：bcrypt
- **环境配置**：github.com/spf13/viper
- **日志**：github.com/sirupsen/logrus

### 前端 (Angular)
- **框架**：Angular 16+
- **HTTP 客户端**：@angular/common/http
- **路由**：@angular/router (带路由守卫)
- **状态管理**：RxJS BehaviorSubject
- **UI 组件库**：Angular Material
- **表单验证**：Reactive Forms
- **JWT 存储**：HttpOnly Cookie

---

## 三、数据库模型设计（优化版）

### 核心优化点
**使用 JSON 字段统一存储角色特定信息**，而不是为每种角色创建单独的列。这样可以：
- ✅ 灵活扩展：轻松添加新的角色和属性
- ✅ 减少 NULL 值：避免大量无用的空字段
- ✅ 保持一致性：所有角色共享相同的 profile_info 格式
- ✅ 易于查询：使用 JSON 查询操作符

### 1. users 表
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user', 'company')),

    -- 统一的 JSONB/JSON 字段存储角色特定信息
    profile_info JSONB DEFAULT '{}'::JSONB,  -- PostgreSQL
    -- 或 profile_info JSON DEFAULT '{}'       -- MySQL

    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

#### profile_info 字段结构示例

**user 角色**:
```json
{
  "fullName": "张三",
  "idNumber": "110101199001011234",
  "address": "北京市朝阳区",
  "gender": "male"
}
```

**company 角色**:
```json
{
  "companyName": "北京某某科技有限公司",
  "businessLicense": "91110000MA0123456X",
  "legalRepresentative": "李四",
  "companyAddress": "北京市海淀区中关村大街1号",
  "industry": "信息技术"
}
```

**admin 角色**:
```json
{
  "fullName": "王五",
  "department": "技术部",
  "permissions": ["user:manage", "vehicle:manage"]
}
```

### 2. vehicles 表
```sql
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    plate_number VARCHAR(20) UNIQUE NOT NULL,  -- 车牌号
    vin VARCHAR(17) UNIQUE,                    -- 车辆识别号

    brand VARCHAR(50) NOT NULL,                -- 品牌
    model VARCHAR(50) NOT NULL,                -- 型号
    year INTEGER,                              -- 年份
    color VARCHAR(30),                         -- 颜色
    vehicle_type VARCHAR(30),                  -- 车辆类型

    engine_number VARCHAR(50),                 -- 发动机号
    registration_date DATE,                    -- 注册日期
    insurance_expiry DATE,                     -- 保险到期日

    images JSONB DEFAULT '[]'::JSONB,          -- 车辆图片数组
    notes TEXT,                                -- 备注

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

#### images 字段结构示例
```json
[
  {
    "url": "https://example.com/images/car1.jpg",
    "type": "front",
    "uploadedAt": "2024-01-01T10:00:00Z"
  },
  {
    "url": "https://example.com/images/car2.jpg",
    "type": "side",
    "uploadedAt": "2024-01-01T10:01:00Z"
  }
]
```

### 3. jwt_blacklist 表 (JWT 黑名单，用于登出)
```sql
CREATE TABLE jwt_blacklist (
    id SERIAL PRIMARY KEY,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 四、API 设计（更新）

### 认证相关

#### 1. 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "admin|user|company",
  "profileInfo": {
    // 根据角色不同，内容不同
    // user 角色:
    "fullName": "张三",
    "idNumber": "110101199001011234",

    // company 角色:
    "companyName": "某某公司",
    "businessLicense": "91110000MA0123456X"
  },
  "phone": "string"
}

Response: 201 Created
{
  "message": "注册成功",
  "userId": 1
}
```

#### 2. 用户登录（返回简化用户信息）
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: 200 OK
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "admin|user|company",
    "profileInfo": {
      // 只返回公开信息，不返回敏感数据
      "fullName": "张三",
      "companyName": "某某公司"
    }
  }
}
```

### 车辆管理相关

#### 1. 获取当前用户的所有车辆（支持分页）
```
GET /api/vehicles?page=1&pageSize=20&sort=-createdAt
Headers: Authorization: Bearer <token>

Response: 200 OK
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### 2. 创建车辆（支持图片上传）
```
POST /api/vehicles
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "plateNumber": "京A12345",
  "vin": "1G1BL52P7TR115520",
  "brand": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "白色",
  "vehicleType": "轿车",
  "engineNumber": "123456789",
  "registrationDate": "2020-01-01",
  "insuranceExpiry": "2025-01-01",
  "images": [
    {
      "url": "https://cdn.example.com/car-front.jpg",
      "type": "front"
    }
  ],
  "notes": "备注信息"
}
```

#### 3. 更新车辆（部分更新）
```
PUT /api/vehicles/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "color": "黑色",
  "insuranceExpiry": "2026-01-01"
  // 只发送需要更新的字段
}
```

---

## 五、数据模型优化详解

### 1. JSON 字段的优势

#### 灵活性
- 不同角色有不同的信息需求
- 未来可能添加新的角色类型（如：dealer, mechanic）
- 可以随时添加新的属性，无需修改数据库结构

#### 查询示例（PostgreSQL）

**查询所有公司用户的营业执照号**:
```sql
SELECT
    username,
    email,
    profile_info->>'businessLicense' as business_license
FROM users
WHERE role = 'company';
```

**查询所有用户及其完整姓名**:
```sql
SELECT
    username,
    role,
    CASE
        WHEN role = 'user' THEN profile_info->>'fullName'
        WHEN role = 'company' THEN profile_info->>'companyName'
        WHEN role = 'admin' THEN profile_info->>'fullName'
    END as display_name
FROM users;
```

**查询保险即将到期的车辆（30天内）**:
```sql
SELECT * FROM vehicles
WHERE insurance_expiry BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY insurance_expiry ASC;
```

### 2. 索引优化建议

```sql
-- 在 JSON 字段上创建索引
CREATE INDEX idx_users_profile_company_name
ON users ((profile_info->>'companyName'))
WHERE role = 'company';

CREATE INDEX idx_users_profile_full_name
ON users ((profile_info->>'fullName'))
WHERE role = 'user';

-- 车牌号和 VIN 的索引（已在 UNIQUE 约束中）
-- 保险到期日期索引
CREATE INDEX idx_vehicles_insurance_expiry ON vehicles(insurance_expiry);
```

### 3. 数据验证

**后端验证**（Golang）:
```go
type ProfileInfo struct {
    // User 角色
    FullName         string `json:"fullName,omitempty" validate:"omitempty,max=100"`
    IDNumber         string `json:"idNumber,omitempty" validate:"omitempty,len=18"`
    Address          string `json:"address,omitempty" validate:"omitempty,max=200"`

    // Company 角色
    CompanyName      string `json:"companyName,omitempty" validate:"omitempty,max=100"`
    BusinessLicense  string `json:"businessLicense,omitempty" validate:"omitempty"`

    // Admin 角色
    Department       string `json:"department,omitempty" validate:"omitempty,max=50"`
    Permissions      []string `json:"permissions,omitempty"`
}
```

---

## 六、Golang 模型定义（优化版）

```go
// User 模型
type User struct {
    ID           uint           `gorm:"primarykey"`
    Username     string         `gorm:"unique;not null;size:50"`
    Email        string         `gorm:"unique;not null;size:100"`
    PasswordHash string         `gorm:"not null;size:255"`
    Role         string         `gorm:"not null;type:varchar(20);check:role IN ('admin','user','company')"`

    ProfileInfo  datatypes.JSON `gorm:"type:jsonb"`  // PostgreSQL
    // ProfileInfo  datatypes.JSON `gorm:"type:json"`    // MySQL

    Phone        string         `gorm:"size:20"`
    AvatarURL    string         `gorm:"size:255"`
    IsActive     bool           `gorm:"default:true"`

    CreatedAt    time.Time
    UpdatedAt    time.Time
    DeletedAt    gorm.DeletedAt `gorm:"index"`
}

// Vehicle 模型
type Vehicle struct {
    ID                uint           `gorm:"primarykey"`
    UserID            uint           `gorm:"not null"`
    User              User           `gorm:"foreignKey:UserID"`

    PlateNumber       string         `gorm:"unique;not null;size:20"`
    VIN               string         `gorm:"unique;size:17"`

    Brand             string         `gorm:"not null;size:50"`
    Model             string         `gorm:"not null;size:50"`
    Year              int            `gorm:"type:integer"`
    Color             string         `gorm:"size:30"`
    VehicleType       string         `gorm:"size:30"`

    EngineNumber      string         `gorm:"size:50"`
    RegistrationDate  *time.Time     `gorm:"type:date"`
    InsuranceExpiry   *time.Time     `gorm:"type:date"`

    Images            datatypes.JSON `gorm:"type:jsonb"`  // 图片数组
    Notes             string         `gorm:"type:text"`

    CreatedAt         time.Time
    UpdatedAt         time.Time
    DeletedAt         gorm.DeletedAt `gorm:"index"`
}
```

---

## 七、项目结构规划（保持不变）

### Golang 后端项目结构
```
backend/
├── cmd/
│   └── server/
│       └── main.go              # 应用入口
├── internal/
│   ├── config/                  # 配置文件
│   │   ├── config.go
│   │   └── config.yaml
│   ├── models/                  # 数据模型
│   │   ├── user.go
│   │   ├── vehicle.go
│   │   └── jwt_blacklist.go
│   ├── middleware/              # 中间件
│   │   ├── auth.go
│   │   ├── cors.go
│   │   └── logger.go
│   ├── handlers/                # HTTP 处理器
│   │   ├── auth_handler.go
│   │   ├── vehicle_handler.go
│   │   └── admin_handler.go
│   ├── services/                # 业务逻辑
│   │   ├── auth_service.go
│   │   ├── user_service.go
│   │   └── vehicle_service.go
│   ├── repositories/            # 数据访问层
│   │   ├── user_repository.go
│   │   ├── vehicle_repository.go
│   │   └── jwt_repository.go
│   ├── utils/                   # 工具函数
│   │   ├── jwt.go
│   │   ├── password.go
│   │   └── validator.go
│   └── database/                # 数据库初始化
│       └── database.go
├── pkg/
│   └── response/                # 统一响应格式
│       └── response.go
├── migrations/                  # 数据库迁移
│   ├── 000001_create_users_table.up.sql
│   ├── 000002_create_vehicles_table.up.sql
│   └── 000003_create_jwt_blacklist_table.up.sql
├── .env.example
├── go.mod
└── README.md
```

---

## 八、优势总结

### 优化后的数据模型优势：

1. **✅ 灵活性强**：轻松支持新角色和新属性
2. **✅ 减少冗余**：避免大量 NULL 值
3. **✅ 易于扩展**：无需频繁修改数据库结构
4. **✅ 类型安全**：Go 结构体 + JSON 验证
5. **✅ 查询高效**：支持 JSON 字段索引
6. **✅ 数据一致性**：统一的数据格式
7. **✅ 前端友好**：JSON 格式直接映射

### 适用场景：
- 多角色系统
- 需要灵活配置的系统
- 快速迭代的产品
- 用户信息差异大的系统

---

## 九、待确认事项

1. 数据库选择: 使用 PostgreSQL 还是 MySQL?
2. 是否需要文件上传功能（车辆图片）?
3. 是否需要邮件验证功能?
4. 是否需要分页、排序、过滤等高级查询功能?
