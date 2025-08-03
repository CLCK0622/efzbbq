'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Title, Text } = Typography

export default function SignInClient() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        message.error('登录失败：' + result.error)
      } else {
        message.success('登录成功！')
        router.push('/')
      }
    } catch (error) {
      message.error('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <Title level={2} className="text-center mb-6">登录</Title>
        <Form
          form={form}
          name="signin"
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

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="w-full bg-blue-500 hover:bg-blue-600 border-blue-500"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center mt-4">
          <Text type="secondary">
            测试账户：test@hsefz.cn / password
          </Text>
          <div className="mt-2">
            <Text type="secondary">
              还没有账户？{' '}
              <Link href="/auth/signup" className="text-blue-500 hover:text-blue-600">
                立即注册
              </Link>
            </Text>
          </div>
        </div>
      </Card>
    </div>
  )
}