'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const onFinish = async (values: {
    email: string
    password: string
    student_id: string
    real_name: string
  }) => {
    setLoading(true)
    try {
      // 注册用户
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if (error) {
        message.error(error.message)
        return
      }

      if (data.user) {
        // 创建用户档案
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: values.email,
              student_id: values.student_id,
              real_name: values.real_name,
              is_verified: false,
            },
          ])

        if (profileError) {
          message.error('创建用户档案失败')
          return
        }

        message.success('注册成功！请检查邮箱并验证您的账户。')
        onSwitchToLogin()
      }
    } catch (error) {
      message.error('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card 
        className="w-full max-w-md shadow-lg border-0"
        styles={{ body: { padding: '40px' } }}
      >
        <div className="text-center mb-8">
          <Title level={2} className="mb-2 text-gray-900">创建账户</Title>
          <Text type="secondary">加入张江多功能墙</Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
              { pattern: /@hsefz\.cn$/, message: '请使用 @hsefz.cn 邮箱' }
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

          <Form.Item
            name="student_id"
            rules={[
              { required: true, message: '请输入学号' },
              { len: 8, message: '学号必须是8位数字' },
              { pattern: /^\d{8}$/, message: '学号必须是8位数字' }
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

        <Divider>或</Divider>

        <div className="text-center">
          <Text type="secondary">已有账户？</Text>
          <Button 
            type="link" 
            onClick={onSwitchToLogin}
            className="text-blue-500 hover:text-blue-600 p-0 ml-1"
          >
            立即登录
          </Button>
        </div>
      </Card>
    </div>
  )
}
