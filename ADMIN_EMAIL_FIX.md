# 管理员邮箱验证修复指南

## 问题描述
管理员账号 `zhongyi@hsefz.cn` 显示"邮箱未验证"，无法正常登录。

## 解决方案

### 步骤 1: 手动验证邮箱
在 Supabase SQL Editor 中运行以下 SQL 脚本：

```sql
-- 手动验证管理员邮箱
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    updated_at = NOW() 
WHERE email = 'zhongyi@hsefz.cn';

-- 确保用户档案也是已验证状态
UPDATE profiles 
SET is_verified = true, 
    is_admin = true,
    updated_at = NOW() 
WHERE email = 'zhongyi@hsefz.cn';
```

### 步骤 2: 验证修复结果
运行以下命令测试登录：
```bash
node test-admin-login.js
```

### 步骤 3: 访问管理员功能
1. 访问 http://localhost:3000
2. 使用管理员账号登录：
   - 邮箱: `zhongyi@hsefz.cn`
   - 密码: `Zy070622`
3. 访问管理员页面: http://localhost:3000/admin

## 操作步骤详解

### 1. 访问 Supabase Dashboard
1. 打开浏览器，访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登录并选择项目 `vedvbbspragifvspfwzf`
3. 在左侧菜单中点击 **SQL Editor**

### 2. 运行修复脚本
1. 点击 **New query** 创建新查询
2. 复制上面的 SQL 代码并粘贴
3. 点击 **Run** 执行

### 3. 验证结果
执行以下查询确认修复成功：
```sql
-- 检查用户验证状态
SELECT id, email, email_confirmed_at, updated_at 
FROM auth.users 
WHERE email = 'zhongyi@hsefz.cn';

-- 检查用户档案状态
SELECT id, email, is_verified, is_admin, updated_at 
FROM profiles 
WHERE email = 'zhongyi@hsefz.cn';
```

## 预期结果
- ✅ 邮箱验证状态: `email_confirmed_at` 不为 null
- ✅ 用户档案验证: `is_verified` 为 true
- ✅ 管理员权限: `is_admin` 为 true
- ✅ 可以正常登录系统
- ✅ 可以访问管理员页面

## 故障排除

### 如果 SQL 执行失败：
1. 检查是否有语法错误
2. 确认用户邮箱地址正确
3. 验证数据库权限

### 如果登录仍然失败：
1. 清除浏览器缓存
2. 重新启动开发服务器
3. 检查 Supabase 项目状态

### 如果管理员页面无法访问：
1. 确认 `is_admin` 字段为 true
2. 检查 RLS 策略配置
3. 验证用户登录状态

## 安全注意事项
- 手动验证邮箱仅用于开发测试
- 生产环境应使用正式的邮箱验证流程
- 定期检查管理员权限设置 