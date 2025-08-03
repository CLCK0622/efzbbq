export type AnonymityLevel = 'full' | 'partial' | 'none'

export interface User {
  id: string
  email: string
  student_id: string
  real_name: string
  is_verified: boolean
  is_admin?: boolean
  wechat_openid?: string
  wechat_nickname?: string
  wechat_avatar?: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  images?: string[]
  anonymity_level: AnonymityLevel
  is_announcement?: boolean
  created_at: string
  updated_at?: string
  user?: User
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  anonymity_level: AnonymityLevel
  created_at: string
  updated_at?: string
  user?: User
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
  user?: User
}

export interface Report {
  id: string
  post_id?: string
  comment_id?: string
  reporter_id: string
  report_type: 'post' | 'comment'
  status: 'pending' | 'resolved' | 'rejected'
  reason?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  reporter?: User
  post?: Post
  comment?: Comment
}

export interface AuthFormData {
  email: string
  password: string
  student_id: string
  real_name: string
}

export interface VerificationRequest {
  id: string
  user_id: string
  email: string
  student_id: string
  real_name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  user?: User
}
