-- 设置管理员用户
-- 请将 'admin@hsefz.cn' 替换为实际的管理员邮箱

UPDATE profiles 
SET is_admin = true, 
    updated_at = NOW()
WHERE email = 'admin@hsefz.cn';

-- 查看当前管理员列表
SELECT id, student_id, real_name, email, is_admin, created_at 
FROM profiles 
WHERE is_admin = true;