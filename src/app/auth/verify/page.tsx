'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, Typography, Button, Result, message } from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined, MailOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Title, Text } = Typography

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('缺少验证令牌')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('邮箱验证成功！')
      } else {
        setStatus('error')
        setMessage(data.error || '验证失败')
      }
    } catch (error) {
      setStatus('error')
      setMessage('验证过程中发生错误')
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Result
            icon={<MailOutlined style={{ color: '#1890ff' }} />}
            title="正在验证邮箱..."
            subTitle="请稍候，我们正在验证您的邮箱地址"
          />
        )

      case 'success':
        return (
          <Result
            status="success"
            icon={<CheckCircleOutlined />}
            title="邮箱验证成功！"
            subTitle="您的邮箱已经验证通过，现在可以正常使用所有功能了"
            extra={[
              <Button type="primary" key="login" onClick={() => router.push('/auth/signin')}>
                立即登录
              </Button>,
              <Button key="home" onClick={() => router.push('/')}>
                返回首页
              </Button>
            ]}
          />
        )

      case 'error':
        return (
          <Result
            status="error"
            icon={<ExclamationCircleOutlined />}
            title="验证失败"
            subTitle={message}
            extra={[
              <Button type="primary" key="login" onClick={() => router.push('/auth/signin')}>
                返回登录
              </Button>,
              <Button key="home" onClick={() => router.push('/')}>
                返回首页
              </Button>
            ]}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        {renderContent()}
      </Card>
    </div>
  )
} 