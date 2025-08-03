'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Comment, AnonymityLevel } from '@/types'
import { Form, Input, Button, Select, Typography, Space, Avatar, message, Dropdown, Modal } from 'antd'
import { SendOutlined, UserOutlined, MoreOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { Option } = Select
const { Text } = Typography

interface CommentSectionProps {
  postId: string
  onUpdate?: () => void
}

export default function CommentSection({ postId, onUpdate }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  // 获取评论列表
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?post_id=${postId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('获取评论失败:', error)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postId])

  const handleSubmit = async (values: { content: string; anonymity_level: AnonymityLevel }) => {
    if (!session?.user?.id) {
      message.error('请先登录')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          content: values.content,
          anonymity_level: values.anonymity_level,
        }),
      })

      if (response.ok) {
        message.success('评论发布成功')
        form.resetFields()
        fetchComments()
        onUpdate?.()
      } else {
        const error = await response.json()
        message.error(error.error || '发布失败')
      }
    } catch (error) {
      console.error('发布评论失败:', error)
      message.error('发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条评论吗？删除后无法恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            message.success('删除成功')
            fetchComments()
            onUpdate?.()
          } else {
            const error = await response.json()
            message.error(error.error || '删除失败')
          }
        } catch (error) {
          console.error('删除评论失败:', error)
          message.error('删除失败，请重试')
        }
      },
    })
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

  const getAnonymityText = (level: AnonymityLevel, user: { real_name?: string; student_id?: string } | undefined) => {
    switch (level) {
      case 'full':
        return '匿名'
      case 'partial':
        return user?.real_name || '匿名用户'
      case 'none':
        return `${user?.real_name || '匿名用户'} (${user?.student_id || '未知学号'})`
      default:
        return '匿名用户'
    }
  }

  const canEdit = (comment: Comment) => {
    return session?.user?.id === comment.user_id || session?.user?.is_admin
  }

  return (
    <div className="space-y-4">
      {/* 评论表单 */}
      {session?.user?.is_verified && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            initialValues={{
              anonymity_level: 'partial'
            }}
          >
            <Form.Item
              name="content"
              rules={[
                { required: true, message: '请输入评论内容' },
                { max: 500, message: '评论不能超过500字' }
              ]}
            >
              <TextArea
                rows={3}
                placeholder="写下你的评论..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <div className="flex items-center justify-between">
              <Form.Item
                name="anonymity_level"
                rules={[{ required: true, message: '请选择匿名设置' }]}
                className="mb-0"
              >
                <Select style={{ width: 120 }}>
                  <Option value="none">实名</Option>
                  <Option value="partial">匿名不匿头</Option>
                  <Option value="full">完全匿名</Option>
                </Select>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<SendOutlined />}
                className="bg-blue-500 hover:bg-blue-600 border-blue-500"
              >
                发布评论
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* 评论列表 */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserOutlined className="text-2xl mb-2" />
            <div>还没有评论，快来发表第一条评论吧！</div>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar 
                    size={32} 
                    className="bg-blue-500"
                  >
                    {getAnonymityText(comment.anonymity_level, comment.user).charAt(0)}
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">
                      {getAnonymityText(comment.anonymity_level, comment.user)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </div>
                  </div>
                </div>

                {/* 操作菜单 */}
                {canEdit(comment) && (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'delete',
                          icon: <DeleteOutlined />,
                          label: '删除',
                          onClick: () => handleDelete(comment.id),
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
                      size="small"
                      className="text-gray-400 hover:text-gray-600"
                    />
                  </Dropdown>
                )}
              </div>

              <div className="mt-3">
                <Text className="text-gray-800 leading-relaxed">
                  {comment.content}
                </Text>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
