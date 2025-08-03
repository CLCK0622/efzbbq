-- 添加微信相关字段到 profiles 表
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wechat_openid VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS wechat_nickname VARCHAR(100),
ADD COLUMN IF NOT EXISTS wechat_avatar TEXT;

-- 添加管理员字段到 profiles 表
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 添加公告字段到 posts 表
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT FALSE;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_posts_is_announcement ON posts(is_announcement);
CREATE INDEX IF NOT EXISTS idx_profiles_wechat_openid ON profiles(wechat_openid);

-- 更新现有用户的 is_admin 字段（示例：将特定邮箱设为管理员）
-- UPDATE profiles SET is_admin = true WHERE email = 'admin@hsefz.cn'; 