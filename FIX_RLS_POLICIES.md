# 修复 RLS 策略指南

## 问题描述
数据库表已创建，但 RLS (Row Level Security) 策略存在无限递归问题，导致无法正常访问数据。

## 错误信息
- `infinite recursion detected in policy for relation "profiles"`
- `new row violates row-level security policy for table "profiles"`
- `policy "Users can view their own profile" for table "profiles" already exists`

## 解决方案

### 步骤 1: 访问 Supabase SQL Editor
1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 选择项目 `vedvbbspragifvspfwzf`
3. 点击 **SQL Editor**

### 步骤 2: 运行修复脚本
复制以下 SQL 代码并执行：

```sql
-- 修复 RLS 策略 - 解决无限递归问题

-- 删除所有现有策略
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

DROP POLICY IF EXISTS "Anyone can view verified posts" ON posts;
DROP POLICY IF EXISTS "Verified users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;

DROP POLICY IF EXISTS "Anyone can view comments on verified posts" ON comments;
DROP POLICY IF EXISTS "Verified users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;

-- 重新创建简化的策略
-- 用户档案策略
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 允许所有已验证用户查看其他用户的档案（简化版）
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- 帖子策略
CREATE POLICY "Anyone can view posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- 评论策略
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);
```

### 步骤 3: 验证修复
执行以下查询验证策略是否正常：

```sql
-- 检查策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'posts', 'comments')
ORDER BY tablename, policyname;
```

### 步骤 4: 测试连接
执行以下查询测试基本连接：

```sql
-- 测试 profiles 表访问
SELECT COUNT(*) FROM profiles LIMIT 1;
```

## 策略说明

### 修复后的策略特点：
1. **简化权限模型**: 移除了复杂的验证逻辑
2. **避免递归**: 不再在策略中查询同一张表
3. **基本安全**: 用户只能修改自己的数据
4. **公开读取**: 允许查看所有公开内容

### 权限分配：
- **用户档案**: 用户可以创建、查看、更新自己的档案
- **帖子**: 任何人都可以查看，认证用户可以创建自己的帖子
- **评论**: 任何人都可以查看，认证用户可以创建自己的评论

## 测试步骤

### 1. 重新运行测试
```bash
node test-simple.js
```

### 2. 访问应用
打开 http://localhost:3000

### 3. 测试注册
使用测试数据：
- 邮箱: `test@hsefz.cn`
- 密码: `123456`
- 学号: `123456789`
- 姓名: `测试用户`

## 预期结果
- ✅ 数据库连接正常
- ✅ 认证功能正常
- ✅ 用户档案创建成功
- ✅ 注册流程完整

## 故障排除

### 如果仍然出现策略错误：
1. **手动删除策略**: 在 SQL Editor 中逐个删除策略
2. **禁用 RLS**: 临时禁用 RLS 进行测试
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
   ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
   ```
3. **重新启用 RLS**: 测试通过后重新启用
   ```sql
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
   ```

### 如果注册仍然失败：
1. 检查浏览器控制台错误信息
2. 确认所有策略都已正确创建
3. 验证用户认证状态

## 注意事项
- 这个修复简化了权限模型，适合开发和测试
- 生产环境可能需要更严格的权限控制
- 后续可以根据需求调整策略 