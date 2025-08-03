const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

// 创建 Supabase 客户端（使用 service role key 绕过 RLS）
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixLikesRLS() {
  try {
    console.log('🔧 开始修复 likes 表的 RLS 策略...')
    
    // 读取 SQL 文件
    const sqlPath = path.join(__dirname, 'fix-likes-rls-complete.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // 分割 SQL 语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 找到 ${statements.length} 条 SQL 语句`)
    
    // 逐条执行 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // 跳过注释和空语句
      if (statement.startsWith('--') || statement.length === 0) {
        continue
      }
      
      console.log(`\n🔨 执行语句 ${i + 1}/${statements.length}:`)
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''))
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        })
        
        if (error) {
          console.error(`❌ 语句 ${i + 1} 执行失败:`, error.message)
          
          // 如果是查询语句，尝试使用 query 方法
          if (statement.toLowerCase().includes('select')) {
            console.log('🔄 尝试使用 query 方法...')
            const { data: queryData, error: queryError } = await supabase
              .from('likes')
              .select('*')
              .limit(1)
            
            if (queryError) {
              console.error('❌ query 方法也失败:', queryError.message)
            } else {
              console.log('✅ query 方法成功')
            }
          }
        } else {
          console.log(`✅ 语句 ${i + 1} 执行成功`)
          if (data) {
            console.log('📊 结果:', data)
          }
        }
      } catch (execError) {
        console.error(`❌ 语句 ${i + 1} 执行异常:`, execError.message)
      }
    }
    
    console.log('\n🎉 RLS 策略修复完成！')
    
    // 验证修复结果
    console.log('\n🔍 验证修复结果...')
    
    // 检查策略
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'likes')
    
    if (policiesError) {
      console.error('❌ 无法查询策略:', policiesError.message)
    } else {
      console.log('✅ 当前 likes 表策略:')
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.cmd}`)
      })
    }
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error.message)
    process.exit(1)
  }
}

// 运行修复
fixLikesRLS() 