# 数据库初始化指南

## 当前状态
✅ Supabase 配置正确  
✅ 认证功能正常  
❌ 数据库表未创建

## 初始化步骤

### 步骤 1: 访问 Supabase SQL Editor
1. 打开浏览器，访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登录并选择项目 `vedvbbspragifvspfwzf`
3. 在左侧菜单中点击 **SQL Editor**

### 步骤 2: 运行初始化脚本
1. 点击 **New query** 创建新查询
2. 复制以下 SQL 代码并粘贴到编辑器中：

```sql
-- 创建用户档案表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  student_id VARCHAR(9) UNIQUE NOT NULL,
  real_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建帖子表
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  anonymity_level VARCHAR(10) CHECK (anonymity_level IN ('full', 'partial', 'none')) DEFAULT 'full',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  anonymity_level VARCHAR(10) CHECK (anonymity_level IN ('full', 'partial', 'none')) DEFAULT 'full',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);

-- 启用行级安全策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 创建策略
-- 用户档案策略
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_verified = true
    )
  );

-- 帖子策略
CREATE POLICY "Anyone can view verified posts" ON posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = posts.user_id AND is_verified = true
    )
  );

CREATE POLICY "Verified users can create posts" ON posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_verified = true
    )
  );

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- 评论策略
CREATE POLICY "Anyone can view comments on verified posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p
      JOIN profiles pr ON p.user_id = pr.id
      WHERE p.id = comments.post_id AND pr.is_verified = true
    )
  );

CREATE POLICY "Verified users can create comments" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_verified = true
    )
  );

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- 创建存储桶用于图片上传
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- 存储策略
CREATE POLICY "Anyone can view post images" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'post-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

3. 点击 **Run** 执行查询

### 步骤 3: 验证表创建
执行以下查询验证表是否创建成功：

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'posts', 'comments');
```

应该返回：
```
table_name
-----------
profiles
posts
comments
```

## 测试注册功能

### 步骤 1: 重新运行连接测试
```bash
node test-connection.js
```

### 步骤 2: 访问应用
打开浏览器访问 http://localhost:3000

### 步骤 3: 测试注册
使用以下测试数据：
- 邮箱: `test@hsefz.cn`
- 密码: `123456`
- 学号: `123456789`
- 姓名: `测试用户`

## 预期结果
1. ✅ 连接测试通过
2. ✅ 认证测试通过
3. ✅ 注册表单正常显示
4. ✅ 注册成功，显示成功页面
5. ✅ 用户档案创建成功

## 故障排除

### 如果 SQL 执行失败：
1. 检查错误信息
2. 确保有足够的权限
3. 尝试分段执行（先创建表，再创建策略）

### 如果注册仍然失败：
1. 检查浏览器控制台错误
2. 确认所有表都已创建
3. 验证 RLS 策略配置 