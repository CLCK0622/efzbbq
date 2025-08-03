# 新功能部署说明

## 新增功能概述

本次更新添加了以下新功能：

1. **用户界面优化**
   - 右上角用户菜单（头像、真名、邮箱）
   - 我的动态页面
   - 退出登录功能

2. **管理员公告功能**
   - 管理员可以发布公告
   - 公告在首页置顶显示
   - 公告特殊样式标识

3. **微信公众号集成**
   - 用户账号绑定微信公众号
   - 每日自动推送更新
   - 公告及时通知

## 数据库更新

### 1. 运行迁移脚本

在 Supabase SQL Editor 中执行以下脚本：

```sql
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
```

### 2. 设置管理员

执行以下脚本设置管理员（请替换邮箱地址）：

```sql
UPDATE profiles 
SET is_admin = true, 
    updated_at = NOW()
WHERE email = 'your-admin-email@hsefz.cn';
```

## 环境变量配置

在 `.env.local` 文件中添加以下配置：

```env
# 微信公众号配置（可选）
WECHAT_APP_ID=your_wechat_app_id_here
WECHAT_APP_SECRET=your_wechat_app_secret_here
WECHAT_TOKEN=your_wechat_token_here

# 定时任务密钥
CRON_SECRET=your_cron_secret_here
```

## 微信公众号配置

### 1. 申请微信公众号

1. 访问微信公众平台：https://mp.weixin.qq.com/
2. 注册服务号或订阅号
3. 获取 AppID 和 AppSecret

### 2. 配置服务器

在微信公众号后台配置：
- URL: `https://your-domain.com/api/wechat/webhook`
- Token: 自定义的 Token
- EncodingAESKey: 消息加解密密钥

### 3. 设置定时任务

使用 cron 或第三方服务设置每日推送：

```bash
# 每天上午 9 点推送
0 9 * * * curl -X POST https://your-domain.com/api/cron/daily-push \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json"
```

## 功能测试

### 1. 用户界面测试

1. 登录后检查右上角用户菜单
2. 点击用户菜单查看功能
3. 测试"我的动态"页面
4. 测试退出登录功能

### 2. 管理员功能测试

1. 使用管理员账号登录
2. 发布动态时检查公告选项
3. 发布公告后检查首页置顶
4. 访问管理控制台

### 3. 微信功能测试

1. 测试微信绑定功能
2. 检查数据库中的微信字段
3. 测试每日推送API
4. 验证推送消息格式

## 故障排除

### 常见问题

1. **用户菜单不显示**
   - 检查 AuthGuard 组件是否正确导入
   - 确认用户已登录且已验证

2. **公告功能不工作**
   - 确认用户具有管理员权限
   - 检查数据库中的 is_admin 字段
   - 验证前端表单是否正确提交

3. **微信绑定失败**
   - 检查微信API配置
   - 确认网络连接正常
   - 查看服务器日志

4. **推送不工作**
   - 检查定时任务配置
   - 确认API密钥正确
   - 验证微信用户绑定状态

### 调试步骤

1. 检查浏览器控制台错误
2. 查看服务器日志
3. 验证数据库连接
4. 测试API端点

## 性能优化

### 1. 数据库优化

- 确保索引正确创建
- 监控查询性能
- 定期清理无用数据

### 2. 前端优化

- 图片压缩和优化
- 代码分割和懒加载
- 缓存策略优化

### 3. 推送优化

- 批量处理推送消息
- 错误重试机制
- 推送频率控制

## 安全注意事项

1. **API 密钥保护**
   - 不要在代码中硬编码密钥
   - 使用环境变量存储敏感信息
   - 定期轮换密钥

2. **用户数据保护**
   - 微信用户信息加密存储
   - 遵守数据保护法规
   - 定期安全审计

3. **访问控制**
   - 验证管理员权限
   - 限制API访问频率
   - 监控异常访问

## 监控和维护

### 1. 日志监控

- 设置错误日志收集
- 监控API调用频率
- 跟踪用户行为

### 2. 性能监控

- 监控页面加载速度
- 跟踪数据库查询性能
- 监控推送成功率

### 3. 定期维护

- 更新依赖包
- 清理过期数据
- 备份重要数据 