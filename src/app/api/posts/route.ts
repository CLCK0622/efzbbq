import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = `
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
      WHERE 1=1
    `

    const params: string[] = []

    if (search) {
      query += ` AND p.content ILIKE $${params.length + 1}`
      params.push(`%${search}%`)
    }

    query += ` ORDER BY p.is_announcement DESC, p.created_at DESC`

    const posts = await sql(query, ...params)

    // 格式化返回数据
    const formattedPosts = posts.map((post: Record<string, unknown>) => ({
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
    }))

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error('获取帖子失败:', error)
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { content, anonymity_level, images } = await request.json()

    if (!content || !anonymity_level) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO posts (user_id, content, images, anonymity_level)
      VALUES (${session.user.id}, ${content}, ${images || []}, ${anonymity_level})
      RETURNING *
    `

    console.log('帖子创建成功:', result[0])
    return NextResponse.json({ success: true, post: result[0] })

  } catch (error) {
    console.error('创建帖子失败:', error)
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 