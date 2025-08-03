'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button, Card, Typography, Input, message, Space, Divider } from 'antd'
import { HeartOutlined, HeartFilled, UserOutlined, LogoutOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [testPostId] = useState('9087d483-94d6-4711-94c7-ebeb6046ef4f') // 使用现有的帖子ID

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      fetchLikes()
    }
  }

  const fetchLikes = async () => {
    try {
      const response = await fetch(`/api/likes?post_id=${testPostId}`)
      if (response.ok) {
        const data = await response.json()
        setLikes(data.count || 0)
        setIsLiked(data.isLiked || false)
      }
    } catch (error) {
      console.error('获取点赞信息失败:', error)
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      message.error('请输入邮箱和密码')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        message.error(error.message)
      } else {
        message.success('登录成功！')
        checkAuth()
      }
    } catch (error) {
      message.error('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setLikes(0)
    setIsLiked(false)
    message.success('已退出登录')
  }

  const handleLike = async () => {
    if (!user) {
      message.error('请先登录')
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        message.error('登录状态已过期，请重新登录')
        return
      }

      if (isLiked) {
        // 取消点赞
        const response = await fetch('/api/likes', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ post_id: testPostId }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '取消点赞失败')
        }

        setLikes(prev => prev - 1)
        setIsLiked(false)
        message.success('取消点赞')
      } else {
        // 添加点赞
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ post_id: testPostId }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '点赞失败')
        }

        setLikes(prev => prev + 1)
        setIsLiked(true)
        message.success('点赞成功')
      }
    } catch (error: any) {
      console.error('点赞操作失败:', error)
      message.error(error.message || '操作失败，请稍后重试')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <Title level={2} className="text-center mb-6">认证和点赞测试</Title>
        
        {!user ? (
          <div className="space-y-4">
            <Text strong>请先登录测试点赞功能</Text>
            <Input
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="large"
            />
            <Input.Password
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="large"
            />
            <Button
              type="primary"
              onClick={handleLogin}
              loading={loading}
              size="large"
              className="w-full"
            >
              登录
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserOutlined />
                <Text strong>{user.email}</Text>
              </div>
              <Button
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                size="small"
              >
                退出
              </Button>
            </div>
            
            <Divider />
            
            <div className="text-center">
              <Text>测试帖子点赞功能</Text>
              <div className="mt-4">
                <Button
                  type="text"
                  icon={isLiked ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                  size="large"
                  onClick={handleLike}
                  className="text-gray-600 hover:text-red-500"
                >
                  {likes > 0 && <span className="ml-2">{likes}</span>}
                </Button>
              </div>
              <Text type="secondary" className="block mt-2">
                当前状态: {isLiked ? '已点赞' : '未点赞'}
              </Text>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
} 