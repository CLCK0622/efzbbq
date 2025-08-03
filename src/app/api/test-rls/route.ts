import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    console.log('🔍 开始测试 RLS 策略...')
    
    // 1. 检查用户认证
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('用户认证状态:', { user: user?.id, error: authError?.message })
    
    if (authError || !user) {
      return NextResponse.json({
        error: '用户未认证',
        details: authError?.message
      }, { status: 401 })
    }
    
    // 2. 检查 likes 表状态
    const { data: tableInfo, error: tableError } = await supabase
      .from('likes')
      .select('count')
      .limit(1)
    
    console.log('likes 表访问状态:', { success: !tableError, error: tableError?.message })
    
    // 3. 尝试插入测试数据
    const testPostId = '9087d483-94d6-4711-94c7-ebeb6046ef4f'
    const testData = {
      post_id: testPostId,
      user_id: user.id
    }
    
    console.log('尝试插入测试数据:', testData)
    
    const { data: insertResult, error: insertError } = await supabase
      .from('likes')
      .insert(testData)
      .select()
      .single()
    
    console.log('插入结果:', { success: !insertError, error: insertError })
    
    // 4. 如果插入成功，立即删除测试数据
    if (insertResult && !insertError) {
      console.log('删除测试数据...')
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', insertResult.id)
      
      console.log('删除结果:', { success: !deleteError, error: deleteError?.message })
    }
    
    // 5. 检查 RLS 策略
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'likes' })
      .catch(() => ({ data: null, error: { message: '无法查询策略' } }))
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      tableAccess: {
        success: !tableError,
        error: tableError?.message
      },
      insertTest: {
        success: !insertError,
        error: insertError?.message,
        code: insertError?.code,
        details: insertError?.details
      },
      policies: policies || '无法获取策略信息',
      policiesError: policiesError?.message
    })
    
  } catch (error) {
    console.error('RLS 测试错误:', error)
    return NextResponse.json({
      error: '测试过程中发生错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 