-- 修复 likes 表的 RLS 策略
-- 这个脚本确保 likes 表有正确的行级安全策略

-- 首先删除可能存在的旧策略
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

-- 确保启用 RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 重新创建策略
-- 用户可以查看所有点赞
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

-- 用户可以创建自己的点赞
CREATE POLICY "Users can create their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的点赞
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- 验证策略
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