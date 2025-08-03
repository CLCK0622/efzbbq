'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { MailOutlined, SendOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Title, Text } = Typography

export default function ResendVerificationClient() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()
  const searchParams = useSearchParams()

  // 从URL参数获取邮箱
  useEffect(() => {
    const email = searchParams.get('email')
    if (email) {
      form.setFieldsValue({ email })
    }
  }, [searchParams, form])

  const onFinish = async (values: { email: string }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (response.ok) {
        message.success('验证邮件已发送，请查收您的邮箱')
        form.resetFields()
      } else {
        message.error(data.error || '发送失败')
      }
    } catch (error) {
      message.error('发送失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <Title level={2} className="text-center mb-6">重新发送验证邮件</Title>
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Text className="text-blue-800">
            请输入您的邮箱地址，我们将重新发送验证邮件。
          </Text>
        </div>
        <Form
          form={form}
          name="resend-verification"
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
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={<SendOutlined />}
              className="w-full bg-blue-500 hover:bg-blue-600 border-blue-500"
            >
              发送验证邮件
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center mt-4">
          <Text type="secondary">
            想起密码了？{' '}
            <Link href="/auth/signin" className="text-blue-500 hover:text-blue-600">
              立即登录
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  )
}