import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // 获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // 获取会话信息
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    return NextResponse.json({
      user: user ? {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at
      } : null,
      session: session ? {
        access_token: session.access_token ? 'present' : 'missing',
        refresh_token: session.refresh_token ? 'present' : 'missing',
        expires_at: session.expires_at
      } : null,
      authError: authError?.message || null,
      sessionError: sessionError?.message || null,
      cookies: {
        authToken: cookieStore.get('sb-vedvbbspragifvspfwzf-auth-token') ? 'present' : 'missing',
        authToken0: cookieStore.get('sb-vedvbbspragifvspfwzf-auth-token.0') ? 'present' : 'missing'
      }
    })
  } catch (error) {
    console.error('认证状态检查错误:', error)
    return NextResponse.json({ 
      error: '认证状态检查失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 