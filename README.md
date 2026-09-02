# BabyWiki - 新手父母育儿知识库

一个为新手父母打造的系统化育儿知识管理平台。

## 技术栈

- **前端：** Vue 3 + Vite + Element Plus + Pinia
- **后端：** Node.js + Express + MongoDB
- **认证：** JWT (Access Token + Refresh Token)

## 快速开始

### 前置要求

- Node.js >= 20.x
- MongoDB >= 6.x

### 安装

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 运行

```bash
# 启动 MongoDB（如未运行）
mongod

# 启动后端（终端 1）
cd server
npm run dev

# 启动前端（终端 2）
cd client
npm run dev
```

- 前端地址：http://localhost:5173
- 后端地址：http://localhost:3000
- 健康检查：http://localhost:3000/health

### API 测试

```bash
# 注册
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"新手爸爸","email":"test@test.com","password":"123456"}'

# 登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

## 项目结构

```
├── client/          # Vue 3 前端
├── server/          # Node.js 后端
├── docs/            # 项目文档
│   └── PROJECT_PLAN.md
└── .gitignore
```

## 开发阶段

- [x] Phase 1: 基础框架 + 用户认证系统
- [ ] Phase 2: 知识管理（文章 CRUD + 评论 + 搜索）
- [ ] Phase 3: 个人中心 + 月龄推荐
- [ ] Phase 4: 管理后台
- [ ] Phase 5: 优化与部署

## License

MIT
