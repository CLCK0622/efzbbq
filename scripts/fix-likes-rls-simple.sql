-- 简化版 likes 表 RLS 策略修复
-- 这个脚本会创建一个更宽松的策略来允许点赞功能正常工作

-- 1. 删除所有现有策略
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
DROP POLICY IF EXISTS "Enable read access for all users" ON likes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON likes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON likes;

-- 2. 确保启用 RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 3. 创建简化的策略
-- 允许所有用户查看点赞
CREATE POLICY "likes_select_policy" ON likes
  FOR SELECT USING (true);

-- 允许认证用户创建点赞（不检查 user_id 匹配）
CREATE POLICY "likes_insert_policy" ON likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 允许用户删除自己的点赞
CREATE POLICY "likes_delete_policy" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- 4. 验证策略
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'likes'
ORDER BY policyname; 