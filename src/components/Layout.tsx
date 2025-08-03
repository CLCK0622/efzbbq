'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Layout as AntLayout, Menu, Dropdown, Button, Typography, Space, Divider, Tag, Input, AutoComplete } from 'antd'
import { UserOutlined, LogoutOutlined, FileTextOutlined, DownOutlined, SearchOutlined, SettingOutlined, WechatOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { Post } from '@/types'

const { Header, Content } = AntLayout
const { Title } = Typography

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchPosts, setSearchPosts] = useState<Post[]>([])
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setSearchPosts([])
      return
    }

    try {
      const response = await fetch(`/api/posts?search=${encodeURIComponent(value)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchPosts(data.posts || [])
      }
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => router.push('/profile')
    },
    {
      key: 'admin',
      icon: <SettingOutlined />,
      label: '管理后台',
      onClick: () => router.push('/admin'),
      hidden: !session?.user?.is_admin
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ].filter(item => !('hidden' in item) || !item.hidden)

  const searchOptions = searchPosts.map(post => ({
    value: post.id,
    label: (
      <div 
        className="cursor-pointer p-2 hover:bg-gray-50 rounded"
        onClick={() => {
          router.push(`/post/${post.id}`)
          setSearchValue('')
          setSearchPosts([])
        }}
      >
        <div className="font-medium text-gray-900 truncate">
          {post.content.substring(0, 50)}
        </div>
        <div className="text-sm text-gray-500">
          {post.user?.real_name || post.user?.student_id || '匿名用户'}
        </div>
      </div>
    )
  }))

  return (
    <AntLayout className="min-h-screen bg-gray-50">
      <Header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <FileTextOutlined className="text-2xl text-blue-500" />
            <Title level={4} className="mb-0 text-gray-900">张江墙</Title>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="flex-1 max-w-md mx-4">
          <AutoComplete
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            options={searchOptions}
            placeholder="搜索动态..."
            className="w-full"
          >
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              size="large"
              className="rounded-full"
            />
          </AutoComplete>
        </div>

        {/* 用户菜单 */}
        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          ) : session ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button 
                type="text" 
                className="flex items-center space-x-2 h-auto px-3 py-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <UserOutlined className="text-white text-sm" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {session.user.name || session.user.email}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      {session.user.is_verified ? (
                        <>
                          <CheckCircleOutlined className="text-green-500" />
                          <span>已验证</span>
                        </>
                      ) : (
                        <span className="text-yellow-600">未验证</span>
                      )}
                                              {session.user.is_admin && (
                          <>
                            <Tag color="red">管理员</Tag>
                          </>
                        )}
                    </div>
                  </div>
                  <DownOutlined className="text-gray-400" />
                </div>
              </Button>
            </Dropdown>
          ) : (
            <Button 
              type="primary" 
              onClick={() => router.push('/auth/signin')}
              className="bg-blue-500 hover:bg-blue-600 border-blue-500"
            >
              登录
            </Button>
          )}
        </div>
      </Header>

      <Content className="p-4 lg:p-6">
        {children}
      </Content>
    </AntLayout>
  )
} 