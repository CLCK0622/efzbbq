# 部署指南

## 1. Supabase 设置

### 创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com) 并创建账户
2. 创建新项目
3. 等待项目初始化完成

### 配置数据库
1. 在 Supabase 控制台中，进入 SQL Editor
2. 复制 `scripts/init-db.sql` 的内容
3. 在 SQL Editor 中执行脚本
4. 在 Storage 中创建名为 `post-images` 的存储桶，设置为公开

### 获取环境变量
1. 在项目设置中找到 API 设置
2. 复制 Project URL 和 anon public key
3. 更新 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=hsefz.cn
```

## 2. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 3. 生产部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com) 并连接 GitHub 账户
3. 导入项目
4. 在环境变量中设置：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN`
5. 部署

### 其他平台

项目支持部署到任何支持 Next.js 的平台：
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 4. 管理员设置

1. 部署完成后，访问 `/admin` 页面
2. 使用管理员账户登录（需要先在 Supabase 中手动设置管理员权限）
3. 验证新用户注册申请

## 5. 安全注意事项

- 确保 Supabase 项目的 RLS 策略正确配置
- 定期备份数据库
- 监控异常活动
- 考虑设置速率限制

## 6. 故障排除

### 常见问题

1. **构建失败**
   - 检查环境变量是否正确设置
   - 确保所有依赖已安装

2. **数据库连接失败**
   - 验证 Supabase URL 和 Key
   - 检查网络连接

3. **图片上传失败**
   - 确认 Storage 存储桶已创建
   - 检查存储桶权限设置

### 获取帮助

如果遇到问题，请检查：
- Supabase 控制台日志
- 浏览器开发者工具
- 服务器日志
