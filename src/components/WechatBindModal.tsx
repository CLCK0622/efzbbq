'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Smartphone, CheckCircle } from 'lucide-react'
import { 
  Modal, 
  Button, 
  Card, 
  Typography,
  Alert,
  Result
} from 'antd'
import { WechatOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface WechatBindModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export default function WechatBindModal({ isOpen, onClose, userId }: WechatBindModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleBindWechat = async () => {
    setLoading(true)
    setError('')

    try {
      // 模拟微信绑定API调用
      const response = await fetch('/api/wechat/bind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('绑定失败，请重试')
      }

      const data = await response.json()
      
      // 更新用户档案
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          wechat_openid: data.openid,
          wechat_avatar: data.avatar 
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setSuccess(true)
    } catch (error: unknown) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSuccess(false)
    setError('')
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <WechatOutlined className="text-green-500" />
          <Title level={4} className="mb-0">绑定微信公众号</Title>
        </div>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={500}
      destroyOnHidden
    >
      {success ? (
        <Result
          icon={<CheckCircleOutlined className="text-green-500" />}
          status="success"
          title="绑定成功！"
          subTitle="您的账号已成功绑定微信公众号"
          extra={
            <Button type="primary" onClick={handleClose}>
              确定
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <Alert
            message="绑定说明"
            description="绑定微信公众号后，您可以接收每日更新推送，并自动获取微信头像。"
            type="info"
            showIcon
          />

          <Card className="bg-gray-50">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <WechatOutlined className="text-green-600 text-2xl" />
              </div>
              <div>
                <Title level={5} className="mb-2">绑定微信公众号</Title>
                <Text type="secondary">
                  点击下方按钮开始绑定流程
                </Text>
              </div>
            </div>
          </Card>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
            />
          )}

          <div className="flex justify-end space-x-3">
            <Button onClick={handleClose}>
              取消
            </Button>
            <Button
              type="primary"
              icon={<WechatOutlined />}
              loading={loading}
              onClick={handleBindWechat}
            >
              {loading ? '绑定中...' : '开始绑定'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
} 