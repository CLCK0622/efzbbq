# Supabase 配置指南

## 当前状态
✅ 项目 URL 已配置: `https://vedvbbspragifvspfwzf.supabase.co`  
❌ Anon Key 需要更新 (当前是示例值)

## 获取正确的 Anon Key

### 步骤 1: 访问 Supabase 仪表板
1. 打开浏览器，访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登录你的 Supabase 账户
3. 选择项目 `vedvbbspragifvspfwzf`

### 步骤 2: 获取 API 配置
1. 在左侧菜单中点击 **Settings**
2. 选择 **API**
3. 在 **Project API keys** 部分找到：
   - **Project URL**: `https://vedvbbspragifvspfwzf.supabase.co` (已配置)
   - **anon public**: 复制这个值 (需要更新)

### 步骤 3: 更新环境变量
将复制的 anon public key 替换 `.env.local` 文件中的示例值：

```bash
# 当前配置
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZHZiYnNwcmFnaWZ2c3Bmd3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NzQ0MDAsImV4cCI6MjA0OTU1MDQwMH0.example

# 替换为真实的 anon key (以 eyJ 开头的长字符串)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ... (你的真实 anon key)
```

## 初始化数据库

### 步骤 1: 运行 SQL 脚本
1. 在 Supabase 仪表板中，点击 **SQL Editor**
2. 复制 `scripts/init-db.sql` 文件的内容
3. 粘贴到 SQL Editor 中并执行

### 步骤 2: 验证表创建
执行以下查询验证表是否创建成功：
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'posts', 'comments');
```

## 测试注册功能

### 步骤 1: 重启开发服务器
```bash
npm run dev
```

### 步骤 2: 访问应用
打开浏览器访问 http://localhost:3000

### 步骤 3: 测试注册
使用以下测试数据：
- 邮箱: `test@hsefz.cn`
- 密码: `123456`
- 学号: `123456789`
- 姓名: `测试用户`

## 预期结果
1. ✅ 注册表单正常显示
2. ✅ 表单验证正常工作
3. ✅ 注册成功，显示成功页面
4. ✅ 用户档案创建成功
5. ✅ 状态为 "等待验证"

## 故障排除

### 如果注册仍然失败：
1. 检查浏览器控制台错误信息
2. 确认 anon key 格式正确 (以 `eyJ` 开头)
3. 验证数据库表已创建
4. 检查 Supabase 项目设置中的 Auth 配置

### 常见错误：
- **"Invalid API key"**: anon key 格式错误或无效
- **"Table does not exist"**: 数据库表未创建
- **"Email already registered"**: 邮箱已被使用
- **"Student ID already exists"**: 学号已被使用

## 安全注意事项
- 不要将真实的 anon key 提交到版本控制系统
- `.env.local` 文件已被 `.gitignore` 忽略
- 生产环境应使用不同的密钥 