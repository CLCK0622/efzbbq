# 环境变量设置

请创建 `.env.local` 文件并设置以下环境变量：

## 必需的环境变量

```bash
# 数据库配置
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth 配置
AUTH_SECRET="your-secret-key-here"
AUTH_URL="https://efzbbq.top"
NEXTAUTH_URL="https://efzbbq.top"

# 邮件服务配置（用于邮箱验证）
RESEND_API_KEY="re_hiEAK2Sq_474AMj3PNK4uq97CWokTFpse"
```

## 可选的环境变量

```bash
# 备用邮件服务配置（Gmail）
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

## 获取配置值

### DATABASE_URL
从 Neon 数据库控制台获取连接字符串

### AUTH_SECRET
生成一个随机字符串：
```bash
openssl rand -base64 32
```

### AUTH_URL 和 NEXTAUTH_URL
开发环境使用 `http://localhost:3000`
生产环境使用你的域名

### RESEND_API_KEY
使用提供的 Resend API 密钥：
```bash
RESEND_API_KEY="re_hiEAK2Sq_474AMj3PNK4uq97CWokTFpse"
```

### EMAIL_USER 和 EMAIL_PASS（可选，备用方案）
1. 使用 Gmail 账户
2. 开启两步验证
3. 生成应用专用密码
4. 设置 EMAIL_USER 为你的 Gmail 地址
5. 设置 EMAIL_PASS 为应用专用密码 