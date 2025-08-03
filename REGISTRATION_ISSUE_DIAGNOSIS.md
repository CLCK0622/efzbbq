# 注册功能问题诊断报告

## 问题概述
注册功能无法正常工作，主要原因是 Supabase 配置问题。

## 诊断结果

### 1. 环境变量配置问题 ✅ 已确认
- **问题**: `.env.local` 文件中的 Supabase 配置是示例值
- **当前配置**:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example
  ```
- **影响**: 无法连接到真实的 Supabase 项目

### 2. 代码逻辑检查 ✅ 正常
- 注册表单验证逻辑正确
- 邮箱域名验证 (@hsefz.cn) 正常
- 学号格式验证 (9位数字) 正常
- 密码长度验证 (至少6位) 正常
- 姓名长度验证 (2-10字符) 正常

### 3. 数据库结构检查 ✅ 正常
- `profiles` 表结构正确
- 外键关系正确
- RLS 策略配置正确

### 4. 前端组件检查 ✅ 正常
- `RegisterForm` 组件实现正确
- 错误处理机制完善
- 成功状态显示正确

## 解决方案

### 步骤 1: 配置真实的 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目或使用现有项目
3. 获取项目 URL 和 anon key

### 步骤 2: 更新环境变量

修改 `.env.local` 文件：
```bash
# 替换为你的真实 Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-real-anon-key
```

### 步骤 3: 初始化数据库

在 Supabase SQL Editor 中运行 `scripts/init-db.sql` 中的 SQL 语句：
```sql
-- 创建用户档案表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  student_id VARCHAR(9) UNIQUE NOT NULL,
  real_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 其他表结构和策略...
```

### 步骤 4: 测试注册功能

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 访问 http://localhost:3000

3. 使用有效的 hsefz.cn 邮箱进行注册测试

## 测试用例

### 有效注册数据
- 邮箱: `test@hsefz.cn`
- 密码: `123456`
- 学号: `123456789`
- 姓名: `测试用户`

### 预期结果
1. 注册成功，显示成功页面
2. 用户档案创建成功
3. 状态为 "等待验证"

## 其他注意事项

1. **邮箱验证**: 注册后需要验证邮箱地址
2. **管理员验证**: 用户需要管理员手动验证才能使用功能
3. **学号唯一性**: 每个学号只能注册一个账号
4. **邮箱唯一性**: 每个邮箱只能注册一个账号

## 故障排除

如果配置正确后仍有问题：

1. 检查浏览器控制台错误信息
2. 检查 Supabase 项目日志
3. 确认数据库表已正确创建
4. 验证 RLS 策略配置 