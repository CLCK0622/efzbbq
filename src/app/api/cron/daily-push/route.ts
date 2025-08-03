import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 验证请求来源（可以添加更严格的验证）
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 调用微信推送API
    const pushResponse = await fetch(`${request.nextUrl.origin}/api/wechat/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'daily'
      }),
    })

    const pushResult = await pushResponse.json()

    if (!pushResponse.ok) {
      throw new Error(pushResult.error || '推送失败')
    }

    return NextResponse.json({
      success: true,
      message: '每日推送完成',
      timestamp: new Date().toISOString(),
      stats: pushResult.stats
    })
  } catch (error) {
    console.error('每日推送错误:', error)
    return NextResponse.json(
      { error: '推送失败' },
      { status: 500 }
    )
  }
} 