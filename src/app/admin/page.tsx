'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { VerificationRequest, Report } from '@/types'
import Layout from '@/components/Layout'
import { Card, Button, Tag, Typography, Avatar, Space, Divider, message, Tabs, Modal, Form, Input, Select } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

export default function AdminPage() {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [reportForm] = Form.useForm()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)

      // 检查是否为管理员
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        message.error('您没有管理员权限')
        router.push('/')
        return
      }

      setIsAdmin(true)
      fetchData()
    }

    checkAuth()
  }, [router])

  const fetchData = async () => {
    try {
      // 获取待验证的用户
      const { data: requests } = await supabase
        .from('verification_requests')
        .select(`
          *,
          user:profiles(email, student_id, real_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      // 获取待处理的举报
      const { data: reportsData } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles(email, student_id, real_name),
          post:posts(content, user:profiles(real_name)),
          comment:comments(content, user:profiles(real_name))
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      setVerificationRequests(requests || [])
      setReports(reportsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const request = verificationRequests.find(r => r.id === requestId)
      if (!request) return

      if (status === 'approved') {
        // 更新用户验证状态
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', request.user_id)

        if (profileError) throw profileError
      }

      // 更新验证请求状态
      const { error } = await supabase
        .from('verification_requests')
        .update({ status })
        .eq('id', requestId)

      if (error) throw error

      message.success(status === 'approved' ? '用户验证成功' : '已拒绝用户验证')
      fetchData()
    } catch (error) {
      console.error('Error handling verification:', error)
      message.error('操作失败')
    }
  }

  const handleReport = (report: Report) => {
    setSelectedReport(report)
    reportForm.setFieldsValue({
      status: report.status,
      admin_notes: report.admin_notes
    })
    setReportModalVisible(true)
  }

  const handleReportSubmit = async (values: { status: string; admin_notes?: string }) => {
    if (!selectedReport) return

    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status: values.status,
          admin_notes: values.admin_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedReport.id)

      if (error) throw error

      message.success('举报处理成功')
      setReportModalVisible(false)
      setSelectedReport(null)
      fetchData()
    } catch (error) {
      console.error('Error handling report:', error)
      message.error('处理失败')
    }
  }

  const getReportContent = (report: Report) => {
    if (report.report_type === 'post' && report.post) {
      return report.post.content
    } else if (report.report_type === 'comment' && report.comment) {
      return report.comment.content
    }
    return '内容已删除'
  }

  const getReportAuthor = (report: Report) => {
    if (report.report_type === 'post' && report.post?.user) {
      return report.post.user.real_name
    } else if (report.report_type === 'comment' && report.comment?.user) {
      return report.comment.user.real_name
    }
    return '未知用户'
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Title level={2} className="text-gray-900">管理员面板</Title>

        <Tabs
          defaultActiveKey="verification"
          items={[
            {
              key: 'verification',
              label: `用户验证 (${verificationRequests.length})`,
              children: (
                <div className="space-y-4">
                  {verificationRequests.length === 0 ? (
                    <Card>
                      <div className="text-center py-8">
                        <Text type="secondary">暂无待验证的用户</Text>
                      </div>
                    </Card>
                  ) : (
                    verificationRequests.map((request) => (
                      <Card key={request.id} className="shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar size="large" className="bg-blue-500">
                              {request.real_name?.charAt(0) || 'U'}
                            </Avatar>
                            <div>
                              <Text strong className="text-lg">
                                {request.real_name}
                              </Text>
                              <div className="space-y-1">
                                <Text type="secondary">邮箱: {request.email}</Text>
                                <Text type="secondary">学号: {request.student_id}</Text>
                                <Text type="secondary">
                                  申请时间: {new Date(request.created_at).toLocaleString()}
                                </Text>
                              </div>
                            </div>
                          </div>
                          <Space>
                            <Button
                              type="primary"
                              icon={<CheckCircleOutlined />}
                              onClick={() => handleVerification(request.id, 'approved')}
                              className="bg-green-500 hover:bg-green-600 border-green-500"
                            >
                              通过
                            </Button>
                            <Button
                              danger
                              icon={<CloseCircleOutlined />}
                              onClick={() => handleVerification(request.id, 'rejected')}
                            >
                              拒绝
                            </Button>
                          </Space>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )
            },
            {
              key: 'reports',
              label: `举报处理 (${reports.length})`,
              children: (
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <Card>
                      <div className="text-center py-8">
                        <Text type="secondary">暂无待处理的举报</Text>
                      </div>
                    </Card>
                  ) : (
                    reports.map((report) => (
                      <Card key={report.id} className="shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Tag color="red" icon={<ExclamationCircleOutlined />}>
                                {report.report_type === 'post' ? '动态举报' : '评论举报'}
                              </Tag>
                              <Text type="secondary">
                                举报人: {report.reporter?.real_name || '匿名'}
                              </Text>
                            </div>
                            <Button
                              type="primary"
                              icon={<EyeOutlined />}
                              onClick={() => handleReport(report)}
                              size="small"
                            >
                              处理
                            </Button>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded">
                            <Text strong>被举报内容:</Text>
                            <Paragraph className="mt-2 mb-0">
                              {getReportContent(report)}
                            </Paragraph>
                            <Text type="secondary" className="text-sm">
                              作者: {getReportAuthor(report)}
                            </Text>
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            举报时间: {new Date(report.created_at).toLocaleString()}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )
            }
          ]}
        />
      </div>

      {/* 举报处理模态框 */}
      <Modal
        title="处理举报"
        open={reportModalVisible}
        onCancel={() => {
          setReportModalVisible(false)
          setSelectedReport(null)
        }}
        footer={null}
        width={600}
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded">
              <Text strong>举报详情:</Text>
              <div className="mt-2 space-y-2">
                <Text>举报类型: {selectedReport.report_type === 'post' ? '动态' : '评论'}</Text>
                <Text>举报人: {selectedReport.reporter?.real_name || '匿名'}</Text>
                <Text>举报时间: {new Date(selectedReport.created_at).toLocaleString()}</Text>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded">
              <Text strong>被举报内容:</Text>
              <Paragraph className="mt-2 mb-0">
                {getReportContent(selectedReport)}
              </Paragraph>
            </div>

            <Form
              form={reportForm}
              onFinish={handleReportSubmit}
              layout="vertical"
            >
              <Form.Item
                name="status"
                label="处理结果"
                rules={[{ required: true, message: '请选择处理结果' }]}
              >
                <Select>
                  <Option value="resolved">已处理</Option>
                  <Option value="rejected">驳回举报</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="admin_notes"
                label="处理备注"
              >
                <TextArea
                  rows={3}
                  placeholder="可选的处理备注..."
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Space>
                  <Button
                    onClick={() => {
                      setReportModalVisible(false)
                      setSelectedReport(null)
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="bg-blue-500 hover:bg-blue-600 border-blue-500"
                  >
                    确认处理
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
