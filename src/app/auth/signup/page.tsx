'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Title, Text } = Typography

// 禁用预渲染
export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()

  const onFinish = async (values: { 
    email: string; 
    password: string; 
    student_id: string; 
    real_name: string 
  }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (response.ok) {
        message.success('注册成功！请登录')
        router.push('/auth/signin')
      } else {
        message.error(data.error || '注册失败')
      }
    } catch (error) {
      message.error('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <Title level={2} className="text-center mb-6">注册</Title>

        <Form
          form={form}
          name="signup"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="邮箱地址"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="student_id"
            rules={[
              { required: true, message: '请输入学号' },
              { pattern: /^\d{9}$/, message: '请输入9位学号' }
            ]}
          >
            <Input
              prefix={<IdcardOutlined className="text-gray-400" />}
              placeholder="学号"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="real_name"
            rules={[
              { required: true, message: '请输入真实姓名' },
              { min: 2, message: '姓名至少2个字符' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="真实姓名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="确认密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="w-full bg-blue-500 hover:bg-blue-600 border-blue-500"
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text type="secondary">
            已有账户？{' '}
            <Link href="/auth/signin" className="text-blue-500 hover:text-blue-600">
              立即登录
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  )
} 