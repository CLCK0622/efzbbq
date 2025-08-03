# 张江多功能墙

上海中学张江校区校园墙应用，基于 Next.js 和 Supabase 构建。

## 功能特性

- 🔐 **邮箱验证**：仅支持 hsefz.cn 邮箱注册
- 👤 **学号验证**：注册时需要输入9位学号和真实姓名
- ✅ **管理员验证**：新用户需要管理员验证后才能使用
- 📝 **动态发布**：支持文字和图片发布
- 🎭 **匿名设置**：支持全匿、匿名不匿头、不匿三种模式
- 💬 **评论互动**：支持评论功能，同样支持匿名设置
- ❤️ **点赞功能**：支持点赞和取消点赞
- 📱 **响应式设计**：适配各种设备屏幕

## 技术栈

- **前端框架**：Next.js 14 (App Router)
- **样式**：Tailwind CSS
- **数据库**：Supabase (PostgreSQL)
- **认证**：Supabase Auth
- **存储**：Supabase Storage
- **表单验证**：React Hook Form + Zod
- **图标**：Lucide React

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd zhangjiang-wall
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制 `.env.local.example` 为 `.env.local` 并填写配置：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Email Configuration for hsefz.cn domain verification
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=hsefz.cn
```

### 4. 数据库设置

1. 在 Supabase 控制台创建新项目
2. 在 SQL Editor 中运行 `scripts/init-db.sql` 脚本
3. 在 Storage 中创建 `post-images` 存储桶
4. 运行 `scripts/deploy-likes-table.sh` 脚本设置点赞功能（可选）

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── admin/          # 管理员页面
│   ├── auth/           # 认证相关页面
│   ├── posts/          # 帖子相关页面
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 首页
├── components/         # React 组件
│   ├── AuthGuard.tsx   # 认证守卫
│   ├── LoginForm.tsx   # 登录表单
│   ├── RegisterForm.tsx # 注册表单
│   ├── PostCard.tsx    # 帖子卡片
│   ├── CommentSection.tsx # 评论区域
│   ├── CreatePostButton.tsx # 发帖按钮
│   └── CreatePostModal.tsx # 发帖模态框
├── lib/               # 工具库
│   └── supabase.ts    # Supabase 客户端
└── types/             # TypeScript 类型定义
    └── index.ts       # 全局类型

scripts/
└── init-db.sql        # 数据库初始化脚本
```

## 匿名设置说明

- **全匿**：完全匿名，显示为"匿名用户"
- **匿名不匿头**：显示学号后4位，如"学号1234"
- **不匿**：显示真实姓名

## 管理员功能

访问 `/admin` 页面可以：
- 查看待验证用户列表
- 通过或拒绝用户验证申请

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 其他平台

项目支持部署到任何支持 Next.js 的平台。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
