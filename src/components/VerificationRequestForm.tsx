'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Send, CheckCircle, XCircle } from 'lucide-react'

interface VerificationRequestFormProps {
  user: {
    id: string
    student_id: string
    real_name: string
    email: string
  }
  onRequestSubmitted: () => void
}

export default function VerificationRequestForm({ user, onRequestSubmitted }: VerificationRequestFormProps) {
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handlePhotoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('verification-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('verification-photos')
        .getPublicUrl(filePath)

      setPhotoUrl(publicUrl)
      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let finalPhotoUrl = photoUrl

      if (photoFile && !photoUrl) {
        finalPhotoUrl = await handlePhotoUpload(photoFile)
      }

      const { error: requestError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          student_id: user.student_id,
          real_name: user.real_name,
          email: user.email,
          photo_url: finalPhotoUrl,
          description: description.trim() || null,
          status: 'pending'
        })

      if (requestError) throw requestError

      setSuccess(true)
      onRequestSubmitted()
    } catch (error: unknown) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-green-800">验证请求已提交</h3>
            <p className="text-green-700 mt-1">
              您的验证请求已成功提交，管理员将在24小时内审核。请耐心等待。
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">申请账号验证</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            学生证照片
          </label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md border border-blue-200 transition-colors">
              <Upload className="h-4 w-4 inline mr-2" />
              选择照片
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setPhotoFile(file)
                    setPhotoUrl('')
                  }
                }}
              />
            </label>
            {photoFile && (
              <span className="text-sm text-gray-600">
                已选择: {photoFile.name}
              </span>
            )}
          </div>
          {photoUrl && (
            <div className="mt-2">
              <img src={photoUrl} alt="预览" className="w-32 h-32 object-cover rounded border" />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            说明（可选）
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请简要说明您的身份信息，或提供其他证明材料..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              提交中...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              提交验证请求
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p>💡 提示：</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>请上传清晰的学生证照片</li>
          <li>照片将仅用于身份验证，不会公开显示</li>
          <li>管理员将在24小时内审核您的请求</li>
          <li>验证通过后即可使用校园墙功能</li>
        </ul>
      </div>
    </div>
  )
} 