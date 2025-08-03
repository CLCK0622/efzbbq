import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const posts = await sql`
      SELECT 
        p.*,
        u.email,
        u.created_at as user_created_at,
        pr.student_id,
        pr.real_name,
        pr.is_verified,
        pr.is_admin
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN profiles pr ON p.user_id = pr.id
      WHERE p.id = ${id}
    `

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    const post = posts[0]

    // 格式化返回数据
    const formattedPost = {
      id: post.id,
      user_id: post.user_id,
      content: post.content,
      images: post.images || [],
      anonymity_level: post.anonymity_level,
      is_announcement: post.is_announcement || false,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user_id,
        email: post.email,
        student_id: post.student_id,
        real_name: post.real_name,
        is_verified: post.is_verified,
        is_admin: post.is_admin,
        created_at: post.user_created_at
      }
    }

    return NextResponse.json({ post: formattedPost })
  } catch (error) {
    console.error('获取帖子失败:', error)
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params

    // 检查帖子是否存在
    const posts = await sql`
      SELECT user_id FROM posts WHERE id = ${id}
    `

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    const post = posts[0]

    // 检查权限：只有帖子作者或管理员可以删除
    if (post.user_id !== session.user.id && !session.user.is_admin) {
      return NextResponse.json({ error: '无权限删除此帖子' }, { status: 403 })
    }

    // 删除帖子
    await sql`
      DELETE FROM posts WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除帖子失败:', error)
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 