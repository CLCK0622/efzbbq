-- 手动验证管理员邮箱
-- 请在 Supabase SQL Editor 中运行此脚本

-- 1. 查找管理员用户
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'zhongyi@hsefz.cn';

-- 2. 手动验证邮箱（替换下面的用户ID为上面查询结果中的实际ID）
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    updated_at = NOW() 
WHERE email = 'zhongyi@hsefz.cn';

-- 3. 验证更新结果
SELECT id, email, email_confirmed_at, updated_at 
FROM auth.users 
WHERE email = 'zhongyi@hsefz.cn';

-- 4. 确保用户档案也是已验证状态
UPDATE profiles 
SET is_verified = true, 
    is_admin = true,
    updated_at = NOW() 
WHERE email = 'zhongyi@hsefz.cn';

-- 5. 验证用户档案状态
SELECT id, email, is_verified, is_admin, updated_at 
FROM profiles 
WHERE email = 'zhongyi@hsefz.cn'; 