'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Post } from '@/types'
import PostCard from '@/components/PostCard'
import CreatePostButton from '@/components/CreatePostButton'
import Layout from '@/components/Layout'
import { Card, Typography, Alert, Result, Button, Space } from 'antd'
import { ExclamationCircleOutlined, MailOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Title, Text } = Typography

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession()

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.is_verified) {
      fetchPosts()
    } else {
      setLoading(false)
    }
  }, [session])

  // 未登录用户显示登录提示
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <Text className="mt-4 text-gray-600 block">加载中...</Text>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <Result
            icon={<ExclamationCircleOutlined className="text-blue-500" />}
            status="info"
            title="请先登录"
            subTitle="登录后才能查看和发布动态"
            extra={
              <a 
                href="/auth/signin" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg inline-block"
              >
                立即登录
              </a>
            }
          />
        </Card>
      </div>
    )
  }

  // 未验证用户显示验证提示
  if (!session.user.is_verified) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <Result
            icon={<ExclamationCircleOutlined className="text-yellow-500" />}
            status="warning"
            title="请先验证邮箱"
            subTitle="验证邮箱后才能查看和发布动态"
            extra={
              <div className="space-y-4">
                <Alert
                  message="验证步骤"
                  description={
                    <ul className="list-decimal list-inside space-y-1">
                      <li>检查您的邮箱（包括垃圾邮件文件夹）</li>
                      <li>点击邮件中的"验证邮箱地址"按钮</li>
                      <li>验证成功后即可登录使用</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                />
                <Space direction="vertical" className="w-full">
                  <Button 
                    type="primary" 
                    icon={<MailOutlined />}
                    className="w-full bg-blue-500 hover:bg-blue-600 border-blue-500"
                    onClick={() => window.location.href = `/auth/resend-verification?email=${session.user.email}`}
                  >
                    重新发送验证邮件
                  </Button>
                  <Button 
                    type="link" 
                    className="w-full"
                    onClick={() => window.location.href = '/auth/signin'}
                  >
                    返回登录页面
                  </Button>
                </Space>
              </div>
            }
          />
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <Text className="mt-4 text-gray-600 block">加载动态中...</Text>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* 发布按钮 */}
        <div className="flex justify-between items-center">
          <Title level={2} className="mb-0 text-gray-900">校园动态</Title>
          <CreatePostButton onPostCreated={fetchPosts} />
        </div>
        
        {posts.length === 0 ? (
          <Card className="shadow-sm border-0 bg-gray-50">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <Title level={3} className="mb-2 text-gray-900">
                还没有任何动态
              </Title>
              <Text type="secondary">
                发布你的第一条动态，与同学们分享你的想法吧！
              </Text>
            </div>
          </Card>
        ) : (
          /* 小红书风格的瀑布流布局 */
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="break-inside-avoid mb-4">
                <PostCard post={post} onUpdate={fetchPosts} clickable={true} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
