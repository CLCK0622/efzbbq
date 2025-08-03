import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const type = searchParams.get('type')

    if (!token) {
      return NextResponse.redirect(new URL('/auth/error?message=Invalid verification link', request.url))
    }

    if (type === 'signup') {
      // 验证邮箱
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      })

      if (error) {
        console.error('邮箱验证失败:', error)
        return NextResponse.redirect(new URL('/auth/error?message=Verification failed', request.url))
      }

      if (data.user) {
        // 更新用户档案为已验证
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id)

        if (profileError) {
          console.error('更新用户档案失败:', profileError)
        }

        // 发送欢迎邮件
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('real_name')
            .eq('id', data.user.id)
            .single()

          if (profile) {
            await sendWelcomeEmail({
              email: data.user.email!,
              name: profile.real_name
            })
          }
        } catch (emailError) {
          console.error('发送欢迎邮件失败:', emailError)
          // 不阻止用户继续，邮件发送失败不影响验证流程
        }

        return NextResponse.redirect(new URL('/auth/success?message=Email verified successfully', request.url))
      }
    }

    return NextResponse.redirect(new URL('/auth/error?message=Invalid verification type', request.url))
  } catch (error) {
    console.error('验证处理错误:', error)
    return NextResponse.redirect(new URL('/auth/error?message=Verification error', request.url))
  }
} 