-- 测试likes表功能
-- 1. 检查表是否存在
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'likes'
) as table_exists;

-- 2. 检查表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'likes'
ORDER BY ordinal_position;

-- 3. 检查索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'likes';

-- 4. 检查RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'likes';

-- 5. 检查约束
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'likes'::regclass; 