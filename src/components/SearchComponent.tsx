'use client'

import { useEffect, useState } from 'react'
import { Input, List, Typography, Card } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { Search } = Input
const { Text } = Typography

interface SearchResult {
  url: string
  title: string
  excerpt: string
  meta: any
}

export default function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 动态加载 Pagefind
    const loadPagefind = async () => {
      if (typeof window !== 'undefined') {
        try {
          // 这里需要根据实际部署情况调整路径
          const pagefind = await import('pagefind')
          // 初始化搜索
        } catch (error) {
          console.error('Failed to load Pagefind:', error)
        }
      }
    }

    loadPagefind()
  }, [])

  const handleSearch = async (value: string) => {
    setSearchQuery(value)
    if (!value.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      // 这里将集成 Pagefind 搜索
      // 暂时使用模拟数据
      setResults([])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Search
        placeholder="搜索动态内容..."
        allowClear
        enterButton={<SearchOutlined />}
        size="large"
        onSearch={handleSearch}
        onChange={(e) => setSearchQuery(e.target.value)}
        loading={loading}
        className="max-w-md"
      />

      {searchQuery && (
        <div className="mt-4">
          <Text type="secondary" className="text-sm">
            找到 {results.length} 条相关结果
          </Text>
          
          {results.length > 0 && (
            <List
              className="mt-2"
              dataSource={results}
              renderItem={(item) => (
                <List.Item>
                  <Card className="w-full">
                    <div>
                      <Text strong className="text-base">
                        {item.title}
                      </Text>
                      <div className="mt-1">
                        <Text type="secondary" className="text-sm">
                          {item.excerpt}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </div>
      )}
    </div>
  )
} 