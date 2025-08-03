'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function TestRegisterPage() {
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
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if (signUpError) {
        message.error(signUpError.message)
        return
      }

      if (user) {
        // 创建用户档案
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            student_id: values.student_id,
            real_name: values.real_name,
            email: values.email,
            is_verified: true // 测试用户直接设为已验证
          })

        if (profileError) {
          message.error('创建用户档案失败: ' + profileError.message)
          return
        }

        message.success('注册成功！用户已自动验证，可以立即使用。')
        form.resetFields()
      }
    } catch (error) {
      console.error('注册失败:', error)
      message.error('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <Title level={2} className="text-center mb-6">创建测试用户</Title>
        
        <Alert
          message="测试用户注册"
          description="此页面用于创建测试用户。注册的用户将自动设为已验证状态，可以立即使用所有功能。"
          type="info"
          showIcon
          className="mb-6"
        />

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
              placeholder="邮箱地址 (@hsefz.cn)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="student_id"
            rules={[
              { required: true, message: '请输入学号' },
              { pattern: /^\d{9}$/, message: '学号必须是9位数字' }
            ]}
          >
            <Input
              prefix={<IdcardOutlined className="text-gray-400" />}
              placeholder="学号 (9位数字)"
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
            name="confirm_password"
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
              创建测试用户
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text type="secondary">
            注册成功后，可以前往{' '}
            <a href="/test-auth" className="text-blue-500 hover:text-blue-600">
              测试页面
            </a>
            {' '}进行登录和点赞功能测试
          </Text>
        </div>
      </Card>
    </div>
  )
} 