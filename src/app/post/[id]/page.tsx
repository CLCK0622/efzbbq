'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Post } from '@/types'
import PostCard from '@/components/PostCard'
import Layout from '@/components/Layout'
import { Button, Spin, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import CommentSection from '@/components/CommentSection'

export default function PostDetailPage() {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (!response.ok) {
        throw new Error('Post not found')
      }
      const data = await response.json()
      setPost(data)
    } catch (error) {
      console.error('Error fetching post:', error)
      message.error('帖子不存在或已被删除')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      </Layout>
    )
  }

  if (!post) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-500">帖子不存在或已被删除</div>
          <Button 
            type="primary" 
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 border-blue-500"
          >
            返回首页
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* 返回按钮 */}
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/')}
            size="middle"
          >
            返回首页
          </Button>
        </div>

        {/* 帖子详情 */}
        <div className="space-y-6">
          {/* 帖子卡片 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <PostCard post={post} onUpdate={fetchPost} />
          </div>
        </div>
      </div>
    </Layout>
  )
} 