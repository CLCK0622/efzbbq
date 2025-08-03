import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { sql } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authConfig) as { user: { id: string; is_admin?: boolean } } | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }



    // 检查评论是否存在
    const comments = await sql`
      SELECT user_id FROM comments WHERE id = ${id}
    `

    if (!comments || comments.length === 0) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 })
    }

    const comment = comments[0]

    // 检查权限：只有评论作者或管理员可以删除
    if (comment.user_id !== session.user.id && !session.user.is_admin) {
      return NextResponse.json({ error: '无权限删除此评论' }, { status: 403 })
    }

    // 删除评论
    await sql`
      DELETE FROM comments WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除评论失败:', error)
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 