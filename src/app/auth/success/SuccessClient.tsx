'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SuccessClient() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = '/'
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">验证成功！</h1>
          <p className="text-gray-600 mb-6">
            {message === 'Email verified successfully'
              ? '您的邮箱已成功验证，现在可以正常使用张江多功能墙的所有功能了！'
              : message || '操作成功完成！'}
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm"><strong>接下来您可以：</strong></p>
            <ul className="text-green-700 text-sm mt-2 space-y-1">
              <li>• 发布动态和评论</li>
              <li>• 与其他同学互动</li>
              <li>• 参与校园话题讨论</li>
              <li>• 享受完整的社区功能</li>
            </ul>
          </div>
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              立即开始使用
            </Link>
            <p className="text-gray-500 text-sm">{countdown} 秒后自动跳转到首页</p>
          </div>
        </div>
      </div>
    </div>
  )
}