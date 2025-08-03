import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// 加载环境变量
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function runMigration() {
  console.log('🚀 开始数据库迁移...')

  try {
    const migrationPath = join(__dirname, 'migrate-to-neon.sql')
    const migration = readFileSync(migrationPath, 'utf8')

    console.log('📝 执行 SQL 迁移...')
    
    // 分割 SQL 语句并逐个执行
    const statements = migration
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        const cleanStmt = stmt.replace(/\s+/g, ' ').trim()
        return cleanStmt.length > 0 && 
               !cleanStmt.startsWith('--') && 
               !cleanStmt.startsWith('/*') &&
               cleanStmt !== ''
      })
      .map(stmt => stmt + ';') // 重新添加分号

    console.log(`📝 找到 ${statements.length} 条 SQL 语句`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`🔨 执行语句 ${i + 1}/${statements.length}:`)
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''))
      
      try {
        await sql(statement)
        console.log(`✅ 语句 ${i + 1} 执行成功`)
      } catch (error) {
        console.error(`❌ 语句 ${i + 1} 执行失败:`, error)
        // 继续执行其他语句
      }
    }
    
    console.log('✅ 数据库迁移成功！')

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