import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, password, student_id, real_name } = await request.json()

    // 验证输入
    if (!email || !password || !student_id || !real_name) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
    }

    // 验证学号格式
    if (!/^\d{9}$/.test(student_id)) {
      return NextResponse.json({ error: '学号格式不正确，请输入9位数字' }, { status: 400 })
    }

    // 检查邮箱是否已存在
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ error: '邮箱已被注册' }, { status: 400 })
    }

    // 检查学号是否已存在
    const existingProfiles = await sql`
      SELECT id FROM profiles WHERE student_id = ${student_id}
    `

    if (existingProfiles && existingProfiles.length > 0) {
      return NextResponse.json({ error: '学号已被注册' }, { status: 400 })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建用户
    const userResult = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${hashedPassword})
      RETURNING id
    `

    const userId = userResult[0].id

    // 创建用户档案
    await sql`
      INSERT INTO profiles (id, student_id, real_name, is_verified, is_admin)
      VALUES (${userId}, ${student_id}, ${real_name}, false, false)
    `

    // 生成验证令牌
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    // 插入验证令牌
    await sql`
      INSERT INTO verification_tokens (identifier, token, expires)
      VALUES (${email}, ${token}, ${expires.toISOString()})
    `

    // 发送验证邮件
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
    await sendVerificationEmail({
      email,
      name: real_name,
      verificationUrl
    })

    console.log('用户注册成功:', { userId, email, student_id, real_name })
    
    return NextResponse.json({ 
      success: true, 
      message: '注册成功！请查收验证邮件完成邮箱验证。' 
    })

  } catch (error) {
    console.error('注册失败:', error)
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 