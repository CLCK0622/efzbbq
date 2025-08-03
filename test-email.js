import { Resend } from 'resend'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })

console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '已设置' : '未设置')

const resend = new Resend(process.env.RESEND_API_KEY)

async function testEmail() {
  try {
    console.log('开始发送测试邮件...')
    
    const { data, error } = await resend.emails.send({
      from: '张江墙 <zhongyi070622@163.com>',
      to: 'zhongyi070622@163.com',
      subject: '测试邮件',
      html: '<p>这是一封测试邮件</p>',
    })

    if (error) {
      console.error('邮件发送失败:', error)
      return
    }

    console.log('邮件发送成功:', data)
  } catch (error) {
    console.error('邮件服务错误:', error)
  }
}

testEmail() 