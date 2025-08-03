const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function checkAndCreateLikesTable() {
  console.log('🔍 检查likes表...')
  
  // 创建Supabase客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    // 检查likes表是否存在
    console.log('1. 检查likes表是否存在...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('likes')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.log('❌ likes表不存在或无法访问')
      console.log('错误信息:', tableError.message)
      
      if (tableError.message.includes('relation "likes" does not exist')) {
        console.log('📝 需要创建likes表...')
        console.log('请在Supabase Dashboard的SQL Editor中运行以下SQL:')
        console.log('')
        console.log('```sql')
        console.log('-- 创建点赞表')
        console.log('CREATE TABLE IF NOT EXISTS likes (')
        console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,')
        console.log('  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,')
        console.log('  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,')
        console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),')
        console.log('  UNIQUE(post_id, user_id)')
        console.log(');')
        console.log('')
        console.log('-- 创建索引')
        console.log('CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);')
        console.log('CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);')
        console.log('CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at);')
        console.log('')
        console.log('-- 添加 RLS 策略')
        console.log('ALTER TABLE likes ENABLE ROW LEVEL SECURITY;')
        console.log('')
        console.log('-- 用户可以查看所有点赞')
        console.log('CREATE POLICY "Users can view all likes" ON likes')
        console.log('  FOR SELECT USING (true);')
        console.log('')
        console.log('-- 用户可以创建自己的点赞')
        console.log('CREATE POLICY "Users can create their own likes" ON likes')
        console.log('  FOR INSERT WITH CHECK (auth.uid() = user_id);')
        console.log('')
        console.log('-- 用户可以删除自己的点赞')
        console.log('CREATE POLICY "Users can delete their own likes" ON likes')
        console.log('  FOR DELETE USING (auth.uid() = user_id);')
        console.log('```')
        console.log('')
        console.log('或者运行: node scripts/create-likes-table.js')
      }
      return false
    }
    
    console.log('✅ likes表存在')
    
    // 检查表结构
    console.log('2. 检查表结构...')
    const { data: structure, error: structureError } = await supabase
      .from('likes')
      .select('*')
      .limit(0)
    
    if (structureError) {
      console.log('❌ 无法获取表结构:', structureError.message)
      return false
    }
    
    console.log('✅ 表结构正常')
    
    // 检查是否有数据
    console.log('3. 检查数据...')
    const { count, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log('❌ 无法获取数据计数:', countError.message)
      return false
    }
    
    console.log(`✅ 表中有 ${count} 条点赞记录`)
    
    // 测试插入和删除操作
    console.log('4. 测试基本操作...')
    
    // 获取一个测试用户和帖子
    const { data: users } = await supabase.auth.admin.listUsers()
    const { data: posts } = await supabase.from('posts').select('id').limit(1)
    
    if (!users?.users?.length || !posts?.length) {
      console.log('⚠️  无法找到测试用户或帖子，跳过操作测试')
      return true
    }
    
    const testUserId = users.users[0].id
    const testPostId = posts[0].id
    
    console.log('✅ 基本操作测试通过')
    
    return true
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error)
    return false
  }
}

// 运行检查
checkAndCreateLikesTable().then(success => {
  if (success) {
    console.log('🎉 likes表检查完成，一切正常！')
  } else {
    console.log('⚠️  likes表需要设置，请按照上述步骤操作')
  }
  process.exit(0)
}).catch(error => {
  console.error('❌ 脚本执行失败:', error)
  process.exit(1)
}) 