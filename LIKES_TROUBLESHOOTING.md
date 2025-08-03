# 点赞功能故障排除指南

## 常见问题

### 1. "未授权" 错误

**症状**: 点击点赞按钮时出现"未授权"错误

**可能原因**:
- 用户未登录
- 登录状态已过期
- 认证cookie丢失
- Supabase配置问题

**解决方案**:

1. **检查登录状态**
   ```bash
   # 访问测试页面
   http://localhost:3000/test-auth
   ```

2. **重新登录**
   - 退出当前账户
   - 重新登录
   - 清除浏览器缓存和cookie

3. **检查环境变量**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **检查Supabase项目设置**
   - 确保项目URL和API密钥正确
   - 检查认证设置是否正确

### 2. 删除按钮跳转到详情页面

**症状**: 点击删除按钮时页面跳转到帖子详情页

**原因**: 事件冒泡导致卡片点击事件被触发

**解决方案**: ✅ 已修复
- 在菜单项的onClick事件中添加了`e.stopPropagation()`

### 3. 点赞功能完全不可用

**症状**: 点赞按钮被禁用，显示"点赞功能暂时不可用"

**可能原因**:
- likes表未创建
- 数据库连接问题
- RLS策略配置错误

**解决方案**:

1. **检查表是否存在**
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'likes'
   );
   ```

2. **创建表**
   ```bash
   ./scripts/deploy-likes-table.sh
   ```

3. **手动创建表**
   ```sql
   -- 在Supabase SQL Editor中运行
   CREATE TABLE IF NOT EXISTS likes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(post_id, user_id)
   );
   ```

### 4. 点赞数不更新

**症状**: 点击点赞后数字没有变化

**可能原因**:
- 前端状态更新问题
- API响应错误
- 数据库操作失败

**解决方案**:

1. **检查浏览器控制台**
   - 查看是否有JavaScript错误
   - 检查网络请求状态

2. **检查API响应**
   - 在Network标签页查看API请求
   - 确认响应状态码和内容

3. **刷新页面**
   - 手动刷新页面查看最新状态

## 调试步骤

### 1. 启用调试日志

前端组件已经添加了详细的console.log输出，可以在浏览器控制台查看：
- 用户认证状态
- API请求详情
- 错误信息

### 2. 检查API路由日志

服务器端API路由也添加了调试日志，可以在终端查看：
- 认证检查结果
- 请求处理过程
- 错误详情

### 3. 使用测试页面

访问 `/test-auth` 页面可以：
- 检查当前认证状态
- 测试API连接
- 验证用户信息

## 预防措施

1. **定期检查认证状态**
   - 确保用户登录状态有效
   - 处理token过期情况

2. **错误处理**
   - 前端显示友好的错误信息
   - 后端记录详细的错误日志

3. **数据一致性**
   - 使用数据库约束防止重复点赞
   - 实现乐观更新和回滚机制

## 联系支持

如果问题仍然存在，请提供以下信息：
1. 错误信息截图
2. 浏览器控制台日志
3. 服务器端日志
4. 复现步骤
5. 环境信息（浏览器、操作系统等） 