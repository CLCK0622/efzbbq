import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 开始测试likes表...')
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // 1. 测试基本连接
    console.log('1. 测试Supabase连接...')
    const { data: testData, error: testError } = await supabase
      .from('posts')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Supabase连接失败:', testError)
      return NextResponse.json({ 
        error: '数据库连接失败',
        details: testError.message 
      }, { status: 500 })
    }
    
    console.log('✅ Supabase连接正常')
    
    // 2. 测试likes表访问
    console.log('2. 测试likes表访问...')
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('*')
      .limit(1)
    
    if (likesError) {
      console.error('❌ likes表访问失败:', likesError)
      return NextResponse.json({ 
        error: 'likes表访问失败',
        details: likesError.message 
      }, { status: 500 })
    }
    
    console.log('✅ likes表访问正常')
    console.log('likes数据:', likesData)
    
    // 3. 测试点赞计数
    console.log('3. 测试点赞计数...')
    const { count, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ 点赞计数失败:', countError)
      return NextResponse.json({ 
        error: '点赞计数失败',
        details: countError.message 
      }, { status: 500 })
    }
    
    console.log('✅ 点赞计数正常:', count)
    
    // 4. 测试用户认证
    console.log('4. 测试用户认证...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('⚠️ 用户认证失败:', authError.message)
    } else {
      console.log('✅ 用户认证正常:', user?.id)
    }
    
    return NextResponse.json({
      success: true,
      message: '所有测试通过',
      data: {
        postsCount: testData?.length || 0,
        likesCount: count || 0,
        userAuthenticated: !!user,
        userId: user?.id || null
      }
    })
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
    return NextResponse.json({ 
      error: '测试失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 