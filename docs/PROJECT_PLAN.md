# 新手父母育儿知识库 - 项目方案文档

> **项目名称：** 育儿知识库 (BabyWiki)  
> **版本：** v1.0  
> **创建日期：** 2026-08-27  
> **技术栈：** Vue 3 + Node.js (Express) + MongoDB

---

## 一、项目背景与目标

### 1.1 项目背景

作为新手父母，面对海量的育儿知识往往感到无所适从：
- 信息散布在各个平台，质量参差不齐
- 缺乏系统化的知识分类和检索方式
- 难以找到与自己孩子年龄段匹配的内容
- 父母之间缺乏一个专注的交流平台

### 1.2 项目目标

- 构建一个**系统化、可检索**的育儿知识管理平台
- 支持**按月龄/年龄段**精准推荐内容
- 提供父母间的**讨论、收藏、分享**功能
- 打造一个**可信赖、结构化**的新手父母知识库

### 1.3 目标用户

| 用户角色 | 描述 |
|---------|------|
| 新手父母 | 0-3岁婴幼儿的父母，核心用户群体 |
| 内容编辑者 | 有育儿经验的用户，可创作和审核内容 |
| 管理员 | 系统管理、内容审核、用户管理 |

---

## 二、功能需求

### 2.1 功能模块总览

```
┌─────────────────────────────────────────────────────────┐
│                     BabyWiki 育儿知识库                   │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ 知识管理  │ 用户系统  │ 互动交流  │ 个人中心  │  系统管理   │
├──────────┼──────────┼──────────┼──────────┼──────────────┤
│ • 文章浏览 │ • 注册登录│ • 评论系统 │ • 收藏夹   │ • 内容审核  │
│ • 分类检索 │ • 资料完善│ • 点赞收藏 │ • 阅读历史 │ • 用户管理  │
│ • 全文搜索 │ • 角色权限│ • 内容分享 │ • 个人设置 │ • 分类管理  │
│ • 月龄筛选 │          │ • 讨论区   │ • 我的文章 │ • 数据统计  │
│ • 标签系统 │          │ • 问答模块 │ • 消息通知 │ • 敏感词过滤│
└──────────┴──────────┴──────────┴──────────┴──────────────┘
```

### 2.2 核心功能详述

#### 2.2.1 知识管理模块

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 知识分类 | 按喂养、睡眠、发育、健康、早教等大类 | P0 |
| 月龄筛选 | 按 0-1月、1-3月、3-6月、6-12月、1-3岁等筛选 | P0 |
| 标签系统 | 支持多标签，方便横向检索 | P0 |
| 全文搜索 | 基于关键词搜索文章标题、内容、标签 | P0 |
| 文章详情 | 支持 Markdown 渲染，图文并茂 | P0 |
| 相关文章推荐 | 根据分类/标签/月龄推荐相似内容 | P1 |
| 知识图谱 | 知识间的关联可视化展示 | P2 |

#### 2.2.2 用户系统模块

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 注册/登录 | 邮箱/手机号 + 密码，支持第三方登录 | P0 |
| 个人资料 | 昵称、头像、宝宝信息（预产期/生日） | P0 |
| 角色权限 | 普通用户、内容创作者、管理员 | P0 |
| JWT 认证 | Token 刷新机制 | P0 |

#### 2.2.3 互动交流模块

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 评论系统 | 支持楼中楼回复 | P0 |
| 点赞/收藏 | 对文章和评论点赞，收藏文章 | P0 |
| 内容分享 | 生成分享链接、海报 | P1 |
| 讨论区 | 按话题分类的社区讨论 | P1 |
| 问答模块 | 提问-回答模式的知识问答 | P2 |

#### 2.2.4 个人中心模块

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 收藏夹 | 查看和管理收藏的文章 | P0 |
| 阅读历史 | 最近阅读记录 | P1 |
| 我的文章 | 自己创建/编辑的文章管理 | P1 |
| 消息通知 | 评论回复、点赞、系统通知 | P1 |

#### 2.2.5 系统管理模块（后台）

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 内容审核 | 审核用户提交的待审内容 | P0 |
| 分类/标签管理 | 增删改查分类和标签 | P0 |
| 用户管理 | 用户列表、封禁、角色调整 | P1 |
| 数据统计 | 文章数量、用户活跃度、热门内容 | P1 |
| 敏感词过滤 | 评论/文章敏感词检测 | P2 |

---

## 三、技术架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                         客户端                                │
│                   Vue 3 SPA / PWA                            │
│         (Vue Router + Pinia + Element Plus)                   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                         服务端                                │
│              Node.js + Express.js                            │
├─────────┬──────────┬──────────┬──────────────┬──────────────┤
│ 用户服务  │ 内容服务   │ 互动服务   │  搜索服务     │  管理服务     │
│ (Auth)  │ (Content) │ (Interact)│ (Search)    │ (Admin)     │
├─────────┴──────────┴──────────┴──────────────┴──────────────┤
│                    中间件层                                   │
│     认证中间件 │ 日志中间件 │ 错误处理 │ 限流中间件            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       数据层                                  │
│     MongoDB (数据存储) + Redis (缓存/会话)                    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 前端技术选型

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4.x | 前端框架（Composition API） |
| Vue Router | ^4.x | 路由管理 |
| Pinia | ^2.x | 状态管理 |
| Element Plus | ^2.x | UI 组件库 |
| Axios | ^1.x | HTTP 请求 |
| Vue Markdown Editor | - | Markdown 编辑与渲染 |
| Vite | ^5.x | 构建工具 |
| ECharts | ^5.x | 数据可视化（后台） |

### 3.3 后端技术选型

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | ^20.x | 运行环境 |
| Express.js | ^4.x | Web 框架 |
| Mongoose | ^8.x | MongoDB ODM |
| JSON Web Token | ^9.x | 用户认证 |
| bcryptjs | ^2.x | 密码加密 |
| Joi / Zod | - | 数据校验 |
| Morgan | - | 请求日志 |
| Helmet | - | 安全头设置 |
| Express Rate Limit | - | API 限流 |

### 3.4 数据库选型

| 技术 | 用途 |
|------|------|
| MongoDB | 主数据库，文档型存储 |
| MongoDB Atlas | 云端托管（可选） |
| Redis | 缓存热门内容、会话管理（可选） |

---

## 四、数据库设计

### 4.1 ER 关系图

```
User (用户)
  ├── 1 ──< Article (文章)
  ├── 1 ──< Comment (评论)
  ├── 1 ──< Collection (收藏)
  └── 1 ──< ReadingHistory (阅读历史)

Article (文章)
  ├── > ──< Tag (标签) [多对多]
  └── 1 ──< Category (分类) [多对一]

Category (分类)
  └── 1 ──< Article (文章)

Tag (标签)
  └── > ──< Article (文章) [多对多]

Comment (评论)
  ├── 1 ──< Comment (子评论/回复)
  └── 1 ──< Like (点赞)
```

### 4.2 数据表设计

#### 4.2.1 用户表 (users)

```javascript
{
  _id: ObjectId,
  username: String,           // 用户名，唯一
  email: String,              // 邮箱，唯一
  phone: String,              // 手机号，可选
  passwordHash: String,       // bcrypt 加密后的密码
  nickname: String,           // 昵称
  avatar: String,             // 头像 URL
  role: String,               // user | creator | admin
  babyInfo: {
    dueDate: Date,            // 预产期
    birthday: Date,           // 宝宝生日
    gender: String,           // male | female | unknown
  },
  status: String,             // active | banned
  createdAt: Date,
  updatedAt: Date,
}
```

**索引：**
- `username` 唯一索引
- `email` 唯一索引
- `phone` 稀疏唯一索引

#### 4.2.2 文章表 (articles)

```javascript
{
  _id: ObjectId,
  title: String,              // 文章标题
  slug: String,               // URL 友好标识，唯一
  content: String,            // Markdown 正文
  summary: String,            // 摘要（前200字）
  coverImage: String,         // 封面图 URL
  category: ObjectId,         // 关联 Category
  tags: [ObjectId],           // 关联 Tag 数组
  ageRange: {                 // 适用月龄范围
    min: Number,              // 最小月龄（月）
    max: Number,              // 最大月龄（月），0表示不限
  },
  author: ObjectId,           // 关联 User
  status: String,             // draft | pending | published | rejected
  viewCount: Number,          // 浏览量
  likeCount: Number,          // 点赞数
  commentCount: Number,       // 评论数
  publishedAt: Date,          // 发布时间
  createdAt: Date,
  updatedAt: Date,
}
```

**索引：**
- `slug` 唯一索引
- `category` + `ageRange` 复合索引
- `tags` 多键索引
- `status` + `publishedAt` 复合索引
- `title` 文本索引（全文搜索）
- `content` 文本索引

#### 4.2.3 分类表 (categories)

```javascript
{
  _id: ObjectId,
  name: String,               // 分类名称
  slug: String,               // URL 标识，唯一
  icon: String,               // 图标
  description: String,        // 描述
  sort: Number,               // 排序权重
  parent: ObjectId,           // 父分类（支持二级分类）
  createdAt: Date,
}
```

**预置分类：**
| 分类 | 子分类 |
|------|--------|
| 备孕 | 备孕知识、营养调理、生活习惯、排卵监测 |
| 产前（待产） | 孕期营养、产检指南、胎教知识、待产准备 |
| 喂养 | 母乳喂养、配方奶、辅食添加、营养补充、睡眠规律、哄睡技巧、睡眠问题、大运动、精细动作、语言发育、社交发育 |
| 健康 | 常见疾病、疫苗接种、日常护理、急救知识 |
| 心理 | 情绪管理、亲子关系、父母心理、产后抑郁 |

#### 4.2.4 标签表 (tags)

```javascript
{
  _id: ObjectId,
  name: String,               // 标签名称，唯一
  slug: String,               // URL 标识，唯一
  useCount: Number,           // 使用次数
  createdAt: Date,
}
```

#### 4.2.5 评论表 (comments)

```javascript
{
  _id: ObjectId,
  article: ObjectId,          // 关联 Article
  author: ObjectId,           // 关联 User
  content: String,            // 评论内容
  parent: ObjectId,           // 父评论 ID（楼中楼）
  likeCount: Number,          // 点赞数
  status: String,             // active | hidden | deleted
  createdAt: Date,
  updatedAt: Date,
}
```

**索引：**
- `article` + `createdAt` 复合索引
- `parent` 索引

#### 4.2.6 收藏表 (collections)

```javascript
{
  _id: ObjectId,
  user: ObjectId,             // 关联 User
  article: ObjectId,          // 关联 Article
  createdAt: Date,
}
```

**索引：**
- `user` + `article` 联合唯一索引

#### 4.2.7 阅读历史表 (reading_histories)

```javascript
{
  _id: ObjectId,
  user: ObjectId,             // 关联 User
  article: ObjectId,          // 关联 Article
  readAt: Date,               // 阅读时间
}
```

**索引：**
- `user` + `readAt` 复合索引

---

## 五、API 接口设计

### 5.1 接口规范

- **基础路径：** `/api/v1`
- **数据格式：** JSON
- **认证方式：** Bearer Token (JWT)
- **统一响应格式：**

```json
{
  "code": 0,
  "message": "success",
  "data": { },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

- **错误码约定：**
  - `0` - 成功
  - `400` - 请求参数错误
  - `401` - 未认证
  - `403` - 权限不足
  - `404` - 资源不存在
  - `500` - 服务器内部错误

### 5.2 接口列表

#### 认证模块 (`/auth`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/auth/register` | 用户注册 | 否 |
| POST | `/auth/login` | 用户登录 | 否 |
| POST | `/auth/refresh` | 刷新 Token | 是 |
| POST | `/auth/logout` | 退出登录 | 是 |

#### 用户模块 (`/users`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/users/me` | 获取当前用户信息 | 是 |
| PUT | `/users/me` | 更新个人资料 | 是 |
| GET | `/users/:id` | 获取用户公开信息 | 是 |

#### 文章模块 (`/articles`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/articles` | 文章列表（分页、筛选） | 否 |
| GET | `/articles/:slug` | 文章详情 | 否 |
| POST | `/articles` | 创建文章 | 是(creator) |
| PUT | `/articles/:id` | 更新文章 | 是(作者) |
| DELETE | `/articles/:id` | 删除文章 | 是(作者/admin) |
| GET | `/articles/hot` | 热门文章 | 否 |
| GET | `/articles/recommended` | 推荐文章（基于宝宝月龄） | 是 |

#### 分类模块 (`/categories`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/categories` | 分类列表（含树形结构） | 否 |
| POST | `/categories` | 创建分类 | 是(admin) |
| PUT | `/categories/:id` | 更新分类 | 是(admin) |
| DELETE | `/categories/:id` | 删除分类 | 是(admin) |

#### 标签模块 (`/tags`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/tags` | 标签列表 | 否 |
| GET | `/tags/hot` | 热门标签 | 否 |

#### 评论模块 (`/articles/:id/comments`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/articles/:id/comments` | 文章评论列表 | 否 |
| POST | `/articles/:id/comments` | 发表评论 | 是 |
| PUT | `/comments/:id` | 更新评论 | 是(作者) |
| DELETE | `/comments/:id` | 删除评论 | 是(作者/admin) |

#### 互动模块 (`/interactions`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/articles/:id/like` | 点赞文章 | 是 |
| DELETE | `/articles/:id/like` | 取消点赞 | 是 |
| POST | `/articles/:id/collect` | 收藏文章 | 是 |
| DELETE | `/articles/:id/collect` | 取消收藏 | 是 |

#### 个人中心 (`/me`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/me/collections` | 我的收藏 | 是 |
| GET | `/me/history` | 阅读历史 | 是 |
| GET | `/me/articles` | 我的文章 | 是 |
| GET | `/me/notifications` | 我的通知 | 是 |

#### 管理后台 (`/admin`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/admin/articles/pending` | 待审核文章 | 是(admin) |
| PUT | `/admin/articles/:id/review` | 审核文章 | 是(admin) |
| GET | `/admin/users` | 用户列表 | 是(admin) |
| PUT | `/admin/users/:id/role` | 修改用户角色 | 是(admin) |
| PUT | `/admin/users/:id/status` | 封禁/解封用户 | 是(admin) |
| GET | `/admin/stats` | 统计数据 | 是(admin) |

#### 搜索模块 (`/search`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/search` | 全文搜索 | 否 |

---

## 六、项目目录结构

```
baby-wiki/
├── client/                         # 前端项目 (Vue 3)
│   ├── public/
│   ├── src/
│   │   ├── api/                    # API 请求封装
│   │   │   ├── auth.js
│   │   │   ├── article.js
│   │   │   ├── comment.js
│   │   │   ├── category.js
│   │   │   ├── tag.js
│   │   │   └── user.js
│   │   ├── assets/                 # 静态资源
│   │   │   ├── images/
│   │   │   └── styles/
│   │   │       └── global.css
│   │   ├── components/             # 公共组件
│   │   │   ├── AppHeader.vue       # 顶部导航
│   │   │   ├── AppFooter.vue       # 底部
│   │   │   ├── ArticleCard.vue     # 文章卡片
│   │   │   ├── ArticleList.vue     # 文章列表
│   │   │   ├── CommentSection.vue  # 评论区域
│   │   │   ├── MarkdownEditor.vue  # Markdown 编辑器
│   │   │   ├── MarkdownRenderer.vue# Markdown 渲染
│   │   │   ├── TagList.vue         # 标签列表
│   │   │   ├── CategoryTree.vue    # 分类树
│   │   │   └── SearchBar.vue       # 搜索栏
│   │   ├── views/                  # 页面组件
│   │   │   ├── HomeView.vue        # 首页
│   │   │   ├── ArticleDetailView.vue # 文章详情
│   │   │   ├── CategoryView.vue    # 分类浏览
│   │   │   ├── TagView.vue         # 标签浏览
│   │   │   ├── SearchView.vue      # 搜索结果
│   │   │   ├── LoginView.vue       # 登录
│   │   │   ├── RegisterView.vue    # 注册
│   │   │   ├── ProfileView.vue     # 个人主页
│   │   │   ├── EditorView.vue      # 文章编辑
│   │   │   └── admin/              # 管理后台页面
│   │   │       ├── DashboardView.vue
│   │   │       ├── ArticleManageView.vue
│   │   │       └── UserManageView.vue
│   │   ├── stores/                 # Pinia 状态管理
│   │   │   ├── user.js
│   │   │   ├── article.js
│   │   │   └── ui.js
│   │   ├── router/                 # 路由配置
│   │   │   └── index.js
│   │   ├── utils/                  # 工具函数
│   │   │   ├── auth.js             # 认证相关
│   │   │   ├── date.js             # 日期处理
│   │   │   └── http.js             # Axios 封装
│   │   ├── composables/            # 组合式函数
│   │   │   ├── useAuth.js
│   │   │   ├── useArticle.js
│   │   │   └── usePagination.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── server/                         # 后端项目 (Node.js + Express)
│   ├── src/
│   │   ├── config/                 # 配置文件
│   │   │   ├── database.js         # MongoDB 连接
│   │   │   ├── auth.js             # JWT 配置
│   │   │   └── index.js            # 环境变量
│   │   ├── models/                 # Mongoose 模型
│   │   │   ├── User.js
│   │   │   ├── Article.js
│   │   │   ├── Category.js
│   │   │   ├── Tag.js
│   │   │   ├── Comment.js
│   │   │   ├── Collection.js
│   │   │   └── ReadingHistory.js
│   │   ├── controllers/            # 控制器
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── articleController.js
│   │   │   ├── categoryController.js
│   │   │   ├── tagController.js
│   │   │   ├── commentController.js
│   │   │   └── adminController.js
│   │   ├── routes/                 # 路由
│   │   │   ├── auth.js
│   │   │   ├── user.js
│   │   │   ├── article.js
│   │   │   ├── category.js
│   │   │   ├── tag.js
│   │   │   ├── comment.js
│   │   │   ├── interaction.js
│   │   │   ├── search.js
│   │   │   └── admin.js
│   │   ├── middlewares/            # 中间件
│   │   │   ├── auth.js             # JWT 认证
│   │   │   ├── role.js             # 角色权限
│   │   │   ├── validator.js        # 参数校验
│   │   │   ├── errorHandler.js     # 错误处理
│   │   │   ├── logger.js           # 日志
│   │   │   └── rateLimiter.js      # 限流
│   │   ├── services/               # 业务逻辑层
│   │   │   ├── authService.js
│   │   │   ├── articleService.js
│   │   │   ├── searchService.js
│   │   │   └── notificationService.js
│   │   ├── utils/                  # 工具函数
│   │   │   ├── response.js         # 统一响应格式
│   │   │   └── slug.js             # Slug 生成
│   │   └── app.js                  # Express 应用入口
│   ├── package.json
│   └── .env.example
│
├── docs/                           # 项目文档
│   └── PROJECT_PLAN.md             # 本文档
│
├── README.md                       # 项目说明
├── .gitignore
└── docker-compose.yml              # Docker 编排（可选）
```

---

## 七、核心业务流程

### 7.1 用户注册登录流程

```
用户注册:
  填写资料 → 数据校验 → 密码加密 → 写入数据库 → 返回成功

用户登录:
  输入账号密码 → 查询用户 → 比对密码 → 生成 JWT → 返回 Token
```

### 7.2 文章发布流程

```
创作者写文章 → 填写标题/内容/分类/标签/月龄 → 提交
  → 状态设为 pending（待审核）
  → 管理员审核通过
  → 状态改为 published，设置 publishedAt
  → 文章对用户可见
```

### 7.3 内容检索流程

```
用户输入关键词 → 后端搜索服务
  → MongoDB 文本搜索（标题、内容、标签）
  → 按相关度 + 发布时间排序
  → 分页返回结果
```

### 7.4 月龄推荐流程

```
用户登录 → 读取宝宝生日 → 计算当前月龄
  → 查询 ageRange 匹配的文章
  → 按热度排序 → 返回推荐列表
```

---

## 八、安全设计

| 安全措施 | 实现方式 |
|----------|----------|
| 密码安全 | bcrypt 加密，盐值轮数 12 |
| 认证机制 | JWT Access Token (15min) + Refresh Token (7d) |
| 请求限流 | express-rate-limit，登录接口更严格 |
| XSS 防护 | 前端渲染时转义，CSP 头设置 |
| CSRF 防护 | SameSite Cookie + Token 验证 |
| 输入校验 | Joi/Zod 对全部接口入参校验 |
| SQL 注入 | 使用 MongoDB ODM，无原始查询 |
| 文件上传 | 白名单后缀 + 大小限制（后续版本） |

---

## 九、开发计划

### Phase 1：基础框架（预计 1-2 周）

- [ ] 搭建 Vue 3 前端项目（Vite + Element Plus）
- [ ] 搭建 Node.js 后端项目（Express + MongoDB）
- [ ] 完成用户注册/登录功能
- [ ] 完成 JWT 认证中间件
- [ ] 完成数据库模型定义

### Phase 2：核心功能（预计 2-3 周）

- [ ] 完成分类/标签管理（后台）
- [ ] 完成文章 CRUD（创建/编辑/发布）
- [ ] 完成文章列表/详情/搜索
- [ ] 完成评论系统（楼中楼）
- [ ] 完成点赞/收藏功能
- [ ] 完成内容审核流程

### Phase 3：个人中心（预计 1 周）

- [ ] 完成个人资料编辑（含宝宝信息）
- [ ] 完成收藏夹功能
- [ ] 完成阅读历史
- [ ] 完成基于月龄的推荐功能

### Phase 4：管理后台（预计 1-2 周）

- [ ] 完成后台 Dashboard
- [ ] 完成内容审核界面
- [ ] 完成用户管理
- [ ] 完成数据统计

### Phase 5：优化与部署（预计 1 周）

- [ ] 前端性能优化（懒加载、代码分割）
- [ ] 后端缓存优化
- [ ] SEO 优化（SSR 或预渲染）
- [ ] Docker 部署
- [ ] CI/CD 配置

---

## 十、运行环境要求

### 开发环境

| 工具 | 最低版本 |
|------|----------|
| Node.js | 20.x |
| MongoDB | 6.x |
| npm / pnpm | npm 10+ / pnpm 8+ |
| Git | 2.40+ |

### 环境变量 (.env)

#### 服务端

```env
# 服务器
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/baby-wiki

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# 日志
LOG_LEVEL=debug
```

#### 客户端

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 十一、后续迭代方向

| 版本 | 功能 | 描述 |
|------|------|------|
| v1.1 | 文件上传 | 支持文章配图上传 |
| v1.2 | 消息通知 | WebSocket 实时通知 |
| v1.3 | 社区讨论 | 独立的话题讨论区 |
| v2.0 | 知识图谱 | 知识关联可视化 |
| v2.0 | AI 问答 | 接入大模型，智能育儿问答 |
| v2.0 | 小程序端 | 微信小程序适配 |
| v2.1 | 多语言 | 国际化支持 |
| v2.1 | 内容导出 | 文章导出 PDF/图片分享 |

---

## 十二、项目启动命令

```bash
# 克隆项目后

# 1. 安装后端依赖
cd server
npm install

# 2. 安装前端依赖
cd ../client
npm install

# 3. 启动 MongoDB（本地）
mongod

# 4. 启动后端（开发模式）
cd ../server
npm run dev

# 5. 启动前端（新终端）
cd ../client
npm run dev
```

---

*文档版本：1.0 | 最后更新：2026-08-27*
