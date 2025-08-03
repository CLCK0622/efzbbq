'use client'

import { useSearchParams } from 'next/navigation'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const getErrorMessage = (message: string | null) => {
    switch (message) {
      case 'Invalid verification link':
        return '验证链接无效或已过期'
      case 'Verification failed':
        return '邮箱验证失败，请重试'
      case 'Verification error':
        return '验证过程中发生错误'
      default:
        return message || '发生未知错误'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            验证失败
          </h1>
          
          <p className="text-gray-600 mb-6">
            {getErrorMessage(message)}
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              <strong>可能的原因：</strong>
            </p>
            <ul className="text-red-700 text-sm mt-2 space-y-1">
              <li>• 验证链接已过期</li>
              <li>• 链接被重复使用</li>
              <li>• 网络连接问题</li>
              <li>• 服务器暂时不可用</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重新尝试
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              如果问题持续存在，请联系管理员获取帮助
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 