import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

// 加载环境变量
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function runMigration() {
  console.log('🚀 开始手动数据库迁移...')

  try {
    // 创建用户表
    console.log('🔨 创建用户表...')
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        name VARCHAR(255),
        image VARCHAR(255),
        password_hash VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ 用户表创建成功')

    // 创建账户表
    console.log('🔨 创建账户表...')
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        token_type VARCHAR(255),
        scope VARCHAR(255),
        id_token TEXT,
        session_state VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(provider, provider_account_id)
      )
    `
    console.log('✅ 账户表创建成功')

    // 创建会话表
    console.log('🔨 创建会话表...')
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_token VARCHAR(255) UNIQUE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ 会话表创建成功')

    // 创建验证令牌表
    console.log('🔨 创建验证令牌表...')
    await sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY(identifier, token)
      )
    `
    console.log('✅ 验证令牌表创建成功')

    // 创建用户档案表
    console.log('🔨 创建用户档案表...')
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        student_id VARCHAR(9) UNIQUE NOT NULL,
        real_name VARCHAR(50) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ 用户档案表创建成功')

    // 创建帖子表
    console.log('🔨 创建帖子表...')
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        images TEXT[],
        anonymity_level VARCHAR(10) CHECK (anonymity_level IN ('full', 'partial', 'none')) DEFAULT 'full',
        is_announcement BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ 帖子表创建成功')

    // 创建评论表
    console.log('🔨 创建评论表...')
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        anonymity_level VARCHAR(10) CHECK (anonymity_level IN ('full', 'partial', 'none')) DEFAULT 'full',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ 评论表创建成功')

    // 创建点赞表
    console.log('🔨 创建点赞表...')
    await sql`
      CREATE TABLE IF NOT EXISTS likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      )
    `
    console.log('✅ 点赞表创建成功')

    // 创建举报表
    console.log('🔨 创建举报表...')
    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        report_type VARCHAR(10) CHECK (report_type IN ('post', 'comment')) NOT NULL,
        status VARCHAR(10) CHECK (status IN ('pending', 'resolved', 'rejected')) DEFAULT 'pending',
        reason TEXT,
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ 举报表创建成功')

    // 创建索引
    console.log('🔨 创建索引...')
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token)`
    await sql`CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token)`
    await sql`CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)`
    console.log('✅ 索引创建成功')

    // 插入测试数据
    console.log('🔨 插入测试数据...')
    await sql`
      INSERT INTO users (email, password_hash, email_verified)
      VALUES ('test@hsefz.cn', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O', true)
      ON CONFLICT (email) DO NOTHING
    `

    const testUser = await sql`
      SELECT id FROM users WHERE email = 'test@hsefz.cn'
    `

    if (testUser && testUser.length > 0) {
      await sql`
        INSERT INTO profiles (id, student_id, real_name, is_verified, is_admin)
        VALUES (${testUser[0].id}, '12345678', '测试用户', true, true)
        ON CONFLICT (id) DO NOTHING
      `

      await sql`
        INSERT INTO posts (user_id, content, anonymity_level, is_announcement)
        VALUES (${testUser[0].id}, '欢迎来到张江墙！这是一个测试帖子。', 'none', true)
        ON CONFLICT DO NOTHING
      `
    }

    console.log('✅ 测试数据插入成功')

    console.log('🎉 数据库迁移完成！')

    // 验证迁移结果
    console.log('\n🔍 验证迁移结果...')

    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    console.log('✅ 创建的表:')
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })

    // 检查测试数据
    const users = await sql`SELECT COUNT(*) as count FROM users`
    const posts = await sql`SELECT COUNT(*) as count FROM posts`
    const profiles = await sql`SELECT COUNT(*) as count FROM profiles`

    console.log('\n📊 数据统计:')
    console.log(`  - 用户数: ${users[0].count}`)
    console.log(`  - 帖子数: ${posts[0].count}`)
    console.log(`  - 档案数: ${profiles[0].count}`)

  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error)
    process.exit(1)
  }
}

// If directly run this script
if (require.main === module) {
  runMigration()
}

export { runMigration } 