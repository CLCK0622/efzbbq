# 管理员功能设置指南

## 功能概述
- 创建管理员账号 (zhongyi@hsefz.cn)
- 用户验证请求系统
- 管理员审核界面
- 照片上传功能

## 设置步骤

### 步骤 1: 更新数据库结构
在 Supabase SQL Editor 中运行以下 SQL：

```sql
-- 更新数据库结构 - 添加管理员和验证请求功能

-- 1. 为 profiles 表添加管理员字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. 创建验证请求表
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  student_id VARCHAR(9) NOT NULL,
  real_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  photo_url TEXT,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_created_at ON verification_requests(created_at DESC);

-- 4. 启用 RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- 5. 创建验证请求的策略
CREATE POLICY "Users can view their own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification requests" ON verification_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- 管理员可以查看所有验证请求
CREATE POLICY "Admins can view all verification requests" ON verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 管理员可以更新所有验证请求
CREATE POLICY "Admins can update all verification requests" ON verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 6. 创建存储桶用于验证照片
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-photos', 'verification-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 7. 存储策略
CREATE POLICY "Users can upload their own verification photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own verification photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all verification photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-photos' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### 步骤 2: 创建管理员账号
运行以下命令：
```bash
node create-admin.js
```

### 步骤 3: 验证设置
1. 访问 http://localhost:3000
2. 使用管理员账号登录：
   - 邮箱: zhongyi@hsefz.cn
   - 密码: Zy070622
3. 访问管理员页面: http://localhost:3000/admin

## 功能说明

### 用户验证流程
1. 用户注册后状态为"未验证"
2. 用户点击"申请验证"按钮
3. 上传学生证照片和说明
4. 提交验证请求
5. 管理员在 /admin 页面审核
6. 管理员可以批准或拒绝请求
7. 批准后用户可以使用所有功能

### 管理员功能
- 查看所有验证请求
- 查看用户上传的照片
- 批准或拒绝请求
- 添加拒绝原因
- 实时更新请求状态

### 安全特性
- 只有管理员可以访问 /admin 页面
- 用户只能查看自己的验证请求
- 照片存储在安全的存储桶中
- RLS 策略保护数据安全

## 邮箱验证服务推荐

### 免费邮箱服务选项：

1. **Resend** (推荐)
   - 免费额度: 3,000 封/月
   - 特点: 简单易用，API 友好
   - 网址: https://resend.com

2. **SendGrid**
   - 免费额度: 100 封/天
   - 特点: 功能强大，文档完善
   - 网址: https://sendgrid.com

3. **Mailgun**
   - 免费额度: 5,000 封/月（前3个月）
   - 特点: 开发者友好
   - 网址: https://mailgun.com

4. **Brevo (原 Sendinblue)**
   - 免费额度: 300 封/天
   - 特点: 界面友好，功能全面
   - 网址: https://brevo.com

### 推荐使用 Resend：
- 免费额度充足
- 设置简单
- 支持中文
- 送达率高
- 开发者友好

## 故障排除

### 如果管理员创建失败：
1. 确认数据库结构已更新
2. 检查 RLS 策略是否正确
3. 验证存储桶是否创建

### 如果验证请求无法提交：
1. 检查存储策略
2. 确认用户已登录
3. 验证照片格式

### 如果管理员页面无法访问：
1. 确认用户 is_admin 字段为 true
2. 检查管理员权限策略
3. 验证用户登录状态 