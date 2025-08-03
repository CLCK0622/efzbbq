import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')

    if (!postId) {
      return NextResponse.json({ error: '缺少post_id参数' }, { status: 400 })
    }

    const comments = await sql`
      SELECT 
        c.*,
        u.email,
        u.created_at as user_created_at,
        pr.student_id,
        pr.real_name,
        pr.is_verified,
        pr.is_admin
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN profiles pr ON c.user_id = pr.id
      WHERE c.post_id = ${postId}
      ORDER BY c.created_at ASC
    `

    // 格式化返回数据
    const formattedComments = comments.map((comment: Record<string, unknown>) => ({
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      anonymity_level: comment.anonymity_level,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: {
        id: comment.user_id,
        email: comment.email,
        student_id: comment.student_id,
        real_name: comment.real_name,
        is_verified: comment.is_verified,
        is_admin: comment.is_admin,
        created_at: comment.user_created_at
      }
    }))

    return NextResponse.json({ comments: formattedComments })
  } catch (error) {
    console.error('获取评论失败:', error)
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig) as { user: { id: string; is_admin?: boolean } } | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { post_id, content, anonymity_level } = await request.json()

    if (!post_id || !content || !anonymity_level) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 检查帖子是否存在
    const posts = await sql`
      SELECT id FROM posts WHERE id = ${post_id}
    `

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    const result = await sql`
      INSERT INTO comments (post_id, user_id, content, anonymity_level)
      VALUES (${post_id}, ${session.user.id}, ${content}, ${anonymity_level})
      RETURNING *
    `

    console.log('评论创建成功:', result[0])
    return NextResponse.json({ success: true, comment: result[0] })

  } catch (error) {
    console.error('创建评论失败:', error)
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 