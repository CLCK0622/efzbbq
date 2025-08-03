-- 修复likes表的RLS策略

-- 1. 删除现有的策略（如果存在）
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

-- 2. 确保RLS已启用
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 3. 重新创建策略
-- 用户可以查看所有点赞
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

-- 用户可以创建自己的点赞
CREATE POLICY "Users can create their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的点赞
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- 4. 验证策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'likes'
ORDER BY policyname; 