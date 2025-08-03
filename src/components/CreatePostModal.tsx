'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AnonymityLevel } from '@/types'
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Upload, 
  Button, 
  message, 
  Progress,
  Spin,
  UploadFile
} from 'antd'
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { Option } = Select

interface CreatePostModalProps {
  open: boolean
  onCancel: () => void
  onSuccess: () => void
}

export default function CreatePostModal({ open, onCancel, onSuccess }: CreatePostModalProps) {
  const { data: session } = useSession()
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 文件名清理函数
  const sanitizeFileName = (fileName: string) => {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }

  // 处理图片上传
  const handleImageChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList)
  }

  // 处理图片预览
  const handleImagePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj)
    }
  }

  // 获取base64用于预览
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })

  // 提交表单
  const handleSubmit = async (values: { content: string; anonymity_level: AnonymityLevel }) => {
    if (!session?.user?.id) {
      message.error('请先登录')
      return
    }

    try {
      setIsSubmitting(true)
      setIsUploading(true)
      setUploadProgress(0)

      let imageUrls: string[] = []

      // 处理图片上传
      if (fileList.length > 0) {
        const uploadPromises = fileList.map(async (file, index) => {
          if (file.originFileObj) {
            const timestamp = Date.now()
            const sanitizedName = sanitizeFileName(file.name)
            const fileName = `${timestamp}-${index}-${sanitizedName}`
            
            // 这里需要实现图片上传到存储服务
            // 暂时使用占位符
            const fakeUrl = `https://example.com/images/${fileName}`
            
            setUploadProgress((index + 1) / fileList.length * 100)
            return fakeUrl
          }
          return null
        })

        const results = await Promise.all(uploadPromises)
        imageUrls = results.filter(url => url !== null) as string[]
      }

      // 创建帖子
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: values.content,
          anonymity_level: values.anonymity_level,
          images: imageUrls,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '发布失败')
      }

      message.success('发布成功！')
      form.resetFields()
      setFileList([])
      setIsUploading(false)
      setUploadProgress(0)
      onSuccess()
      onCancel()
    } catch (error) {
      console.error('发布失败:', error)
      message.error(error instanceof Error ? error.message : '发布失败，请重试')
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Modal
      title="发布动态"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="relative">
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-4">
                <Progress percent={uploadProgress} />
                <div className="mt-2 text-gray-600">正在上传图片...</div>
              </div>
            </div>
          </div>
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            anonymity_level: 'partial'
          }}
        >
          <Form.Item
            name="content"
            label="动态内容"
            rules={[
              { required: true, message: '请输入动态内容' },
              { max: 1000, message: '内容不能超过1000字' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="分享你的想法..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="anonymity_level"
            label="匿名设置"
            rules={[{ required: true, message: '请选择匿名设置' }]}
          >
            <Select>
              <Option value="none">实名发布</Option>
              <Option value="partial">匿名不匿头</Option>
              <Option value="full">完全匿名</Option>
            </Select>
          </Form.Item>

          <Form.Item label="图片">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageChange}
              onPreview={handleImagePreview}
              beforeUpload={() => false}
              maxCount={9}
            >
              {fileList.length >= 9 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
            <div className="text-xs text-gray-500">
              最多上传9张图片，每张图片不超过5MB
            </div>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-3">
              <Button onClick={onCancel} disabled={isSubmitting}>
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 border-blue-500"
              >
                发布
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}
