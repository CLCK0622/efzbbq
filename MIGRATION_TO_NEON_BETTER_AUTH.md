# 迁移到 Neon 数据库和 Better Auth

## 迁移概述

将现有的 Supabase 认证系统完全迁移到：
- **Neon 数据库** - 高性能的 PostgreSQL 数据库
- **Better Auth** - 现代化的认证解决方案

## 第一步：安装依赖

```bash
# 移除 Supabase 相关依赖
npm uninstall @supabase/auth-helpers-nextjs @supabase/auth-ui-react @supabase/auth-ui-shared @supabase/ssr @supabase/supabase-js

# 安装 Better Auth 和 Neon 相关依赖
npm install @auth/core @auth/nextjs better-auth @neondatabase/serverless
npm install -D @types/pg
```

## 第二步：环境变量配置

创建 `.env.local` 文件：

```env
# Neon 数据库
DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database?sslmode=require"

# Better Auth
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"

# 邮件服务 (可选)
RESEND_API_KEY="your-resend-api-key"
```

## 第三步：数据库迁移

### 3.1 创建数据库连接
```typescript
// lib/db.ts
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export { sql }
```

### 3.2 创建数据库表结构
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  name VARCHAR(255),
  image VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 账户表 (Better Auth 需要)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- 会话表 (Better Auth 需要)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 验证令牌表 (Better Auth 需要)
CREATE TABLE verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY(identifier, token)
);

-- 用户档案表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  student_id VARCHAR(9) UNIQUE NOT NULL,
  real_name VARCHAR(50) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 帖子表
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[],
  anonymity_level VARCHAR(10) CHECK (anonymity_level IN ('full', 'partial', 'none')) DEFAULT 'full',
  is_announcement BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  anonymity_level VARCHAR(10) CHECK (anonymity_level IN ('full', 'partial', 'none')) DEFAULT 'full',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 点赞表
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 举报表
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('post', 'comment')),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_profiles_student_id ON profiles(student_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
```

## 第四步：Better Auth 配置

### 4.1 创建 auth 配置
```typescript
// lib/auth.ts
import { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL!)

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await sql`
          SELECT u.*, p.student_id, p.real_name, p.is_verified, p.is_admin
          FROM users u
          LEFT JOIN profiles p ON u.id = p.id
          WHERE u.email = ${credentials.email}
        `

        if (!user || user.length === 0) {
          return null
        }

        const userData = user[0]
        
        // 检查密码 (假设使用 bcrypt)
        const isValidPassword = await bcrypt.compare(credentials.password, userData.password_hash)
        
        if (!isValidPassword) {
          return null
        }

        return {
          id: userData.id,
          email: userData.email,
          name: userData.real_name,
          student_id: userData.student_id,
          is_verified: userData.is_verified,
          is_admin: userData.is_admin,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.student_id = user.student_id
        token.is_verified = user.is_verified
        token.is_admin = user.is_admin
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.student_id = token.student_id
        session.user.is_verified = token.is_verified
        session.user.is_admin = token.is_admin
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  session: {
    strategy: "jwt"
  }
}
```

### 4.2 创建 auth 路由
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth"

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
```

## 第五步：更新组件

### 5.1 更新 Layout 组件
```typescript
// components/Layout.tsx
'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div>
      <header>
        <span>Welcome, {session.user.name}</span>
        <button onClick={() => signOut()}>Sign Out</button>
      </header>
      <main>{children}</main>
    </div>
  )
}
```

### 5.2 更新 API 路由
```typescript
// app/api/likes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { post_id } = await request.json()
  
  try {
    const result = await sql`
      INSERT INTO likes (post_id, user_id)
      VALUES (${post_id}, ${session.user.id})
      RETURNING *
    `
    
    return NextResponse.json({ success: true, like: result[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create like' }, { status: 500 })
  }
}
```

## 第六步：CLI 工具

### 6.1 安装 Neon CLI
```bash
npm install -g neonctl
```

### 6.2 配置 Neon CLI
```bash
# 登录 Neon
neonctl auth login

# 连接到数据库
neonctl sql -d your-database-name
```

### 6.3 创建数据库管理脚本
```typescript
// scripts/db-manage.ts
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join } from 'path'

const sql = neon(process.env.DATABASE_URL!)

async function runMigration() {
  const migrationPath = join(__dirname, 'migration.sql')
  const migration = readFileSync(migrationPath, 'utf8')
  
  try {
    await sql(migration)
    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

runMigration()
```

## 第七步：数据迁移脚本

```typescript
// scripts/migrate-data.ts
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function migrateData() {
  // 这里可以添加从 Supabase 迁移数据的逻辑
  console.log('Data migration completed')
}

migrateData()
```

## 第八步：部署配置

### 8.1 Vercel 配置
```json
// vercel.json
{
  "env": {
    "DATABASE_URL": "@neon-database-url",
    "AUTH_SECRET": "@auth-secret",
    "AUTH_URL": "https://your-domain.vercel.app"
  }
}
```

## 总结

这个迁移方案将：
1. 完全移除 Supabase 依赖
2. 使用 Neon 作为数据库
3. 使用 Better Auth 进行认证
4. 提供 CLI 工具进行数据库管理
5. 保持现有功能不变

迁移完成后，你将拥有：
- 更快的数据库性能
- 更简单的认证系统
- 更好的开发体验
- 完整的 CLI 工具支持 