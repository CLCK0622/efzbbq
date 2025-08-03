'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, Button, Space, Typography, Dropdown, Modal, message, Tag, Avatar, Image } from 'antd'
import { MoreOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, HeartOutlined, HeartFilled, MessageOutlined, SoundOutlined, UploadOutlined, DeleteOutlined as DeleteIcon } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { Post, AnonymityLevel } from '@/types'
import CommentSection from './CommentSection'

const { Text, Paragraph } = Typography

interface PostCardProps {
  post: Post
  onUpdate?: () => void
  clickable?: boolean
}

export default function PostCard({ post, onUpdate, clickable = false }: PostCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [loading, setLoading] = useState(false)

  // 获取点赞信息
  const fetchLikes = async () => {
    try {
      const response = await fetch(`/api/likes?post_id=${post.id}`)
      if (response.ok) {
        const data = await response.json()
        setLikes(data.count || 0)
        setIsLiked(data.isLiked || false)
      }
    } catch (error) {
      console.error('获取点赞信息失败:', error)
    }
  }

  useEffect(() => {
    fetchLikes()
  }, [post.id])

  const handleLike = async () => {
    if (!session?.user?.id) {
      message.error('请先登录')
      return
    }

    setLoading(true)
    try {
      const method = isLiked ? 'DELETE' : 'POST'
      const response = await fetch('/api/likes', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: post.id }),
      })

      if (response.ok) {
        if (isLiked) {
          setLikes(prev => prev - 1)
          setIsLiked(false)
          message.success('取消点赞成功')
        } else {
          setLikes(prev => prev + 1)
          setIsLiked(true)
          message.success('点赞成功')
        }
      } else {
        const error = await response.json()
        message.error(error.error || '操作失败')
      }
    } catch (error) {
      console.error('点赞操作失败:', error)
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条动态吗？删除后无法恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`/api/posts/${post.id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            message.success('删除成功')
            onUpdate?.()
          } else {
            const error = await response.json()
            message.error(error.error || '删除失败')
          }
        } catch (error) {
          console.error('删除失败:', error)
          message.error('删除失败，请重试')
        }
      },
    })
  }

  const handleEdit = () => {
    router.push(`/post/${post.id}/edit`)
  }

  const handleCardClick = () => {
    if (clickable) {
      router.push(`/post/${post.id}`)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}分钟前`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  const getAnonymityText = (level: AnonymityLevel) => {
    switch (level) {
      case 'full':
        return '匿名'
      case 'partial':
        return post.user?.real_name || '匿名用户'
      case 'none':
        return `${post.user?.real_name || '匿名用户'} (${post.user?.student_id || '未知学号'})`
      default:
        return '匿名用户'
    }
  }

  const canEdit = session?.user?.id === post.user_id || session?.user?.is_admin

  return (
    <Card
      className={`mb-4 shadow-sm hover:shadow-md transition-shadow ${
        clickable ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
      bodyStyle={{ padding: '16px' }}
    >
      {/* 头部信息 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            className="bg-blue-500"
          >
            {getAnonymityText(post.anonymity_level).charAt(0)}
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">
              {getAnonymityText(post.anonymity_level)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(post.created_at)}
            </div>
          </div>
        </div>

        {/* 操作菜单 */}
        {canEdit && (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: '编辑',
                  onClick: handleEdit,
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除',
                  onClick: handleDelete,
                  danger: true,
                },
              ],
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              className="text-gray-400 hover:text-gray-600"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        )}
      </div>

      {/* 内容 */}
      <div className="mb-4">
        <Paragraph className="text-gray-800 leading-relaxed mb-3">
          {post.content}
        </Paragraph>

        {/* 图片 */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <Image.PreviewGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {post.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`图片 ${index + 1}`}
                    className="rounded-lg object-cover"
                    style={{ height: '200px' }}
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          </div>
        )}

        
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Space size="large">
          <Button
            type="text"
            icon={isLiked ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              handleLike()
            }}
            loading={loading}
            className="flex items-center space-x-1"
          >
            <span className={isLiked ? 'text-red-500' : 'text-gray-500'}>
              {likes}
            </span>
          </Button>

          <Button
            type="text"
            icon={<MessageOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              setShowComments(!showComments)
            }}
            className="flex items-center space-x-1"
          >
                         <span className="text-gray-500">
               0
             </span>
          </Button>
        </Space>

        {/* 公告标识 */}
        {post.is_announcement && (
          <Tag color="red" className="text-xs">
            公告
          </Tag>
        )}
      </div>

             {/* 评论区 */}
       {showComments && (
         <div className="mt-4 pt-4 border-t border-gray-100">
           <CommentSection postId={post.id} onUpdate={() => {}} />
         </div>
       )}
    </Card>
  )
}
