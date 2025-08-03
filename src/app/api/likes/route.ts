import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      console.log('认证失败: 用户未登录')
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { post_id } = await request.json()
    
    if (!post_id) {
      return NextResponse.json({ error: '缺少post_id参数' }, { status: 400 })
    }

    console.log('准备创建点赞记录:', { post_id, user_id: session.user.id })

    // 检查帖子是否存在
    const posts = await sql`
      SELECT id FROM posts WHERE id = ${post_id}
    `

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    // 检查是否已经点赞
    const existingLikes = await sql`
      SELECT id FROM likes 
      WHERE post_id = ${post_id} AND user_id = ${session.user.id}
    `

    if (existingLikes && existingLikes.length > 0) {
      return NextResponse.json({ error: '已经点赞过了' }, { status: 400 })
    }

    // 创建点赞
    const result = await sql`
      INSERT INTO likes (post_id, user_id)
      VALUES (${post_id}, ${session.user.id})
      RETURNING *
    `

    console.log('点赞创建成功:', result[0])
    return NextResponse.json({ success: true, like: result[0] })
    
  } catch (error) {
    console.error('点赞API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      console.log('认证失败: 用户未登录')
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { post_id } = await request.json()
    
    if (!post_id) {
      return NextResponse.json({ error: '缺少post_id参数' }, { status: 400 })
    }

    // 删除点赞
    const result = await sql`
      DELETE FROM likes 
      WHERE post_id = ${post_id} AND user_id = ${session.user.id}
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: '点赞不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('取消点赞API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const post_id = searchParams.get('post_id')
    
    console.log('GET /api/likes - 开始处理请求')
    console.log('post_id:', post_id)
    
    if (!post_id) {
      console.log('缺少post_id参数')
      return NextResponse.json({ error: '缺少post_id参数' }, { status: 400 })
    }

    // 获取点赞数
    console.log('查询post_id:', post_id)
    const likesCount = await sql`
      SELECT COUNT(*) as count FROM likes WHERE post_id = ${post_id}
    `

    const count = likesCount[0]?.count || 0
    console.log('点赞数查询成功:', count)

    // 检查当前用户是否已点赞
    const session = await auth()
    let isLiked = false

    if (session?.user?.id) {
      const userLikes = await sql`
        SELECT id FROM likes 
        WHERE post_id = ${post_id} AND user_id = ${session.user.id}
      `
      isLiked = userLikes && userLikes.length > 0
    } else {
      console.log('获取用户信息失败: 用户未登录')
    }

    const result = {
      count: parseInt(count.toString()),
      isLiked
    }
    
    console.log('GET /api/likes - 返回结果:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('获取点赞信息API错误:', error)
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 