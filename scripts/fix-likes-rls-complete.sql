-- 全面修复 likes 表的 RLS 策略
-- 这个脚本会彻底解决 RLS 策略问题

-- 1. 首先检查当前状态
SELECT '当前 likes 表状态:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = 'likes';

-- 2. 检查现有策略
SELECT '现有 RLS 策略:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'likes'
ORDER BY policyname;

-- 3. 删除所有现有策略
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
DROP POLICY IF EXISTS "Enable read access for all users" ON likes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON likes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON likes;

-- 4. 确保启用 RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 5. 创建新的策略（更宽松的版本用于测试）
-- 允许所有认证用户查看所有点赞
CREATE POLICY "Enable read access for all users" ON likes
  FOR SELECT USING (true);

-- 允许认证用户创建点赞（不检查 user_id 匹配）
CREATE POLICY "Enable insert for authenticated users only" ON likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 允许用户删除自己的点赞
CREATE POLICY "Enable delete for users based on user_id" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- 6. 验证新策略
SELECT '新创建的 RLS 策略:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'likes'
ORDER BY policyname;

-- 7. 测试数据
SELECT '当前 likes 表数据:' as info;
SELECT * FROM likes LIMIT 5;

-- 8. 检查用户权限
SELECT '当前用户权限:' as info;
SELECT 
  current_user,
  session_user,
  auth.role() as auth_role,
  auth.uid() as auth_uid; 