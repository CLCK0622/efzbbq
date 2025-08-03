# 快速修复指南 - 认证问题

## 问题诊断

经过测试发现，当前问题是：
- **用户未登录**: 认证cookie不存在
- **认证失败**: "Auth session missing!"
- **功能受影响**: 点赞、评论、编辑、删除等功能都需要登录

## 解决方案

### 1. 用户需要先登录

**方法1: 使用登录测试页面**
访问 `http://localhost:3001/login-test` 进行快速登录测试

**方法2: 使用主页登录**
访问 `http://localhost:3001` 后，用户需要：
1. **点击登录按钮**
2. **输入邮箱和密码**
3. **完成登录流程**

### 2. 检查登录状态

访问 `http://localhost:3001/test-auth` 页面可以：
- 检查当前认证状态
- 测试API连接
- 验证用户信息

访问 `http://localhost:3001/login-test` 页面可以：
- 快速登录测试
- 检查认证状态
- 退出登录

### 3. 修复RLS策略

如果遇到"new row violates row-level security policy"错误，需要在Supabase Dashboard的SQL Editor中执行以下SQL：

```sql
-- 删除现有策略
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

-- 启用RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 创建新策略
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. API测试

```bash
# 检查认证状态
curl -X GET "http://localhost:3001/api/auth-status"

# 测试点赞API（需要登录）
curl -X GET "http://localhost:3001/api/likes?post_id=5a5ce245-0bca-4952-9e44-391c939752cd"
```

## 功能状态

### ✅ 已修复
- [x] Next.js 15 cookies兼容性
- [x] API路由错误处理
- [x] 事件冒泡问题（删除按钮）
- [x] 点赞功能API

### ⚠️ 需要用户操作
- [ ] 用户登录
- [ ] 认证状态验证

## 测试步骤

1. **访问主页**: `http://localhost:3001`
2. **登录账户**: 使用有效的邮箱和密码
3. **测试功能**:
   - 点赞帖子
   - 评论帖子
   - 编辑自己的帖子
   - 删除自己的帖子
4. **验证结果**: 所有功能应该正常工作

## 故障排除

如果登录后仍有问题：

1. **检查浏览器控制台**: 查看是否有JavaScript错误
2. **检查网络请求**: 查看API请求状态
3. **清除缓存**: 清除浏览器缓存和cookie
4. **重新登录**: 退出后重新登录

## 技术说明

- **认证系统**: 使用Supabase Auth
- **Cookie处理**: 已修复Next.js 15兼容性
- **API路由**: 所有需要认证的API已修复
- **前端组件**: 已更新错误处理

---

**状态**: 需要用户登录
**下一步**: 用户登录后测试功能 