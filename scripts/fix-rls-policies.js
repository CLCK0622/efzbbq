const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function fixRLSPolicies() {
  console.log('🔧 修复likes表的RLS策略...')
  
  // 创建Supabase客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    // 读取SQL文件
    const fs = require('fs')
    const sql = fs.readFileSync('./scripts/fix-rls-policies.sql', 'utf8')
    
    console.log('执行SQL脚本...')
    console.log(sql)
    
    // 执行SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ 执行SQL失败:', error)
      
      // 如果exec_sql不存在，尝试直接执行
      console.log('尝试直接执行SQL...')
      
      // 分别执行每个语句
      const statements = sql.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('执行:', statement.trim())
          try {
            // 这里需要管理员权限，可能需要使用service_role key
            console.log('⚠️ 需要管理员权限执行SQL')
            console.log('请在Supabase Dashboard的SQL Editor中手动执行以下SQL:')
            console.log('')
            console.log(statement.trim() + ';')
            console.log('')
          } catch (stmtError) {
            console.error('语句执行失败:', stmtError)
          }
        }
      }
    } else {
      console.log('✅ RLS策略修复成功')
      console.log('结果:', data)
    }
    
  } catch (error) {
    console.error('❌ 修复RLS策略失败:', error)
    console.log('')
    console.log('请在Supabase Dashboard的SQL Editor中手动执行以下SQL:')
    console.log('')
    console.log('-- 删除现有策略')
    console.log('DROP POLICY IF EXISTS "Users can view all likes" ON likes;')
    console.log('DROP POLICY IF EXISTS "Users can create their own likes" ON likes;')
    console.log('DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;')
    console.log('')
    console.log('-- 启用RLS')
    console.log('ALTER TABLE likes ENABLE ROW LEVEL SECURITY;')
    console.log('')
    console.log('-- 创建新策略')
    console.log('CREATE POLICY "Users can view all likes" ON likes')
    console.log('  FOR SELECT USING (true);')
    console.log('')
    console.log('CREATE POLICY "Users can create their own likes" ON likes')
    console.log('  FOR INSERT WITH CHECK (auth.uid() = user_id);')
    console.log('')
    console.log('CREATE POLICY "Users can delete their own likes" ON likes')
    console.log('  FOR DELETE USING (auth.uid() = user_id);')
  }
}

// 运行修复
fixRLSPolicies().then(() => {
  console.log('🎉 RLS策略修复完成')
  process.exit(0)
}).catch(error => {
  console.error('❌ 脚本执行失败:', error)
  process.exit(1)
}) 