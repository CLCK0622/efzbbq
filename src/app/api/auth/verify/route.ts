import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

// 验证邮箱
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: '缺少验证令牌' }, { status: 400 })
    }

    // 查找验证令牌
    const verificationTokens = await sql`
      SELECT * FROM verification_tokens 
      WHERE token = ${token} AND expires > NOW()
    `

    if (!verificationTokens || verificationTokens.length === 0) {
      return NextResponse.json({ error: '验证令牌无效或已过期' }, { status: 400 })
    }

    const verificationToken = verificationTokens[0]

    // 更新用户邮箱验证状态
    await sql`
      UPDATE users 
      SET email_verified = true 
      WHERE email = ${verificationToken.identifier}
    `

    // 删除已使用的验证令牌
    await sql`
      DELETE FROM verification_tokens 
      WHERE token = ${token}
    `

    console.log('邮箱验证成功:', verificationToken.identifier)
    return NextResponse.json({ success: true, message: '邮箱验证成功' })

  } catch (error) {
    console.error('邮箱验证失败:', error)
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 重新发送验证邮件
export async function PUT(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: '缺少邮箱地址' }, { status: 400 })
    }

    // 检查用户是否存在且未验证
    const users = await sql`
      SELECT u.id, u.email_verified, p.real_name 
      FROM users u 
      LEFT JOIN profiles p ON u.id = p.id 
      WHERE u.email = ${email}
    `

    if (!users || users.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const user = users[0]

    if (user.email_verified) {
      return NextResponse.json({ error: '邮箱已经验证' }, { status: 400 })
    }

    // 生成新的验证令牌
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    // 删除旧的验证令牌
    await sql`
      DELETE FROM verification_tokens 
      WHERE identifier = ${email}
    `

    // 插入新的验证令牌
    await sql`
      INSERT INTO verification_tokens (identifier, token, expires)
      VALUES (${email}, ${token}, ${expires.toISOString()})
    `

    // 发送验证邮件
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
    const emailSent = await sendVerificationEmail({
      email,
      name: user.real_name || '用户',
      verificationUrl
    })

    if (emailSent) {
      console.log('重新发送验证邮件成功:', email)
      return NextResponse.json({ success: true, message: '验证邮件已发送' })
    } else {
      return NextResponse.json({ error: '邮件发送失败' }, { status: 500 })
    }

  } catch (error) {
    console.error('重新发送验证邮件失败:', error)
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 