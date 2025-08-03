# Likes表设置说明

## 问题
如果点赞功能出现错误，可能是因为likes表还没有在数据库中创建。

## 解决方案

### 方法1：通过Supabase Dashboard
1. 登录到你的Supabase项目
2. 进入SQL Editor
3. 运行以下SQL：

```sql
-- 创建点赞表
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at);

-- 添加 RLS 策略
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 用户可以查看所有点赞
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

-- 用户可以创建自己的点赞
CREATE POLICY "Users can create their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的点赞
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);
```

### 方法2：通过命令行
如果你有数据库连接，可以运行：
```bash
psql $DATABASE_URL -f scripts/migrate-add-likes-table.sql
```

## 临时解决方案
在likes表创建之前，点赞功能会被禁用，用户会看到"点赞功能暂时不可用"的提示。

## 验证
创建表后，点赞功能应该正常工作。你可以：
1. 刷新页面
2. 尝试点赞一个帖子
3. 检查控制台是否还有错误信息

## 测试表结构
运行以下SQL来验证表是否正确创建：
```bash
psql $DATABASE_URL -f scripts/test-likes-table.sql
```

## API路由
项目现在使用API路由来处理点赞功能：
- `GET /api/likes?post_id=<post_id>` - 获取帖子的点赞数和当前用户是否已点赞
- `POST /api/likes` - 创建点赞
- `DELETE /api/likes` - 删除点赞

这些API路由提供了更好的错误处理和安全性。

## 故障排除
如果点赞功能仍然不工作：

1. **检查数据库连接**：确保Supabase连接正常
2. **检查RLS策略**：确保RLS策略正确设置
3. **检查用户权限**：确保用户已登录
4. **查看控制台错误**：检查浏览器控制台和服务器日志
5. **验证表结构**：使用测试脚本验证表是否正确创建

## 手动创建表（如果自动创建失败）
如果通过脚本创建表失败，可以手动在Supabase Dashboard中执行以下SQL：

```sql
-- 创建点赞表
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at);

-- 添加 RLS 策略
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 用户可以查看所有点赞
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

-- 用户可以创建自己的点赞
CREATE POLICY "Users can create their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的点赞
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);
``` 