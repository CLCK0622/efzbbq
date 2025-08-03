'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button, Card, Typography, Space, Input, message } from 'antd'

const { Title, Text } = Typography

export default function LoginTestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleLogin = async () => {
    if (!email || !password) {
      message.error('请输入邮箱和密码')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        message.error(`登录失败: ${error.message}`)
      } else {
        message.success('登录成功！')
        setUser(data.user)
        // 刷新页面以更新认证状态
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      message.error('登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    message.success('已退出登录')
    setUser(null)
    window.location.reload()
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Title level={2}>登录测试</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="当前状态">
          <div>
            <Text strong>用户: </Text>
            <Text>{user ? user.email : '未登录'}</Text>
            <br />
            <Text strong>用户ID: </Text>
            <Text>{user?.id || '无'}</Text>
          </div>
        </Card>

        {!user ? (
          <Card title="登录">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
              <Input.Password
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button 
                type="primary" 
                onClick={handleLogin} 
                loading={loading}
                block
              >
                登录
              </Button>
            </Space>
          </Card>
        ) : (
          <Card title="操作">
            <Space>
              <Button onClick={checkAuth}>检查认证状态</Button>
              <Button danger onClick={handleLogout}>退出登录</Button>
            </Space>
          </Card>
        )}

        <Card title="测试说明">
          <Text>
            1. 输入有效的邮箱和密码登录
            <br />
            2. 登录成功后会自动刷新页面
            <br />
            3. 然后可以测试点赞、评论等功能
            <br />
            4. 如果登录失败，请检查邮箱和密码是否正确
          </Text>
        </Card>
      </Space>
    </div>
  )
} 