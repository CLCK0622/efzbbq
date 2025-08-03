import { Resend } from 'resend'

// 获取 API Key，添加错误处理
const getResendApiKey = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }
  return apiKey
}

// 创建 Resend 实例
const createResendClient = () => {
  try {
    const apiKey = getResendApiKey()
    return new Resend(apiKey)
  } catch (error) {
    console.error('Failed to create Resend client:', error)
    throw error
  }
}

export interface EmailVerificationData {
  email: string
  name: string
  verificationUrl: string
}

export interface WelcomeEmailData {
  email: string
  name: string
}

export async function sendVerificationEmail(data: EmailVerificationData) {
  try {
    const resend = createResendClient()
    
    console.log('Sending verification email to:', data.email)
    
    const { data: result, error } = await resend.emails.send({
      from: '张江多功能墙 <onboarding@resend.dev>',
      to: data.email,
      subject: '验证您的张江多功能墙账号',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">张江多功能墙</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">账号验证</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">您好，${data.name}！</h2>
            
            <p style="color: #666; line-height: 1.6;">
              感谢您注册张江多功能墙！为了确保您的账号安全，请点击下面的按钮验证您的邮箱地址。
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                验证邮箱地址
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              如果按钮无法点击，请复制以下链接到浏览器地址栏：
            </p>
            
            <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #666;">
              ${data.verificationUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                <strong>注意事项：</strong><br>
                • 此链接将在24小时后失效<br>
                • 如果您没有注册张江多功能墙，请忽略此邮件<br>
                • 如有问题，请联系管理员
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 张江多功能墙. 保留所有权利.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('发送验证邮件失败:', error)
      throw error
    }

    console.log('验证邮件发送成功:', result)
    return result
  } catch (error) {
    console.error('邮件服务错误:', error)
    throw error
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    const resend = createResendClient()
    
    console.log('Sending welcome email to:', data.email)
    
    const { data: result, error } = await resend.emails.send({
      from: '张江多功能墙 <onboarding@resend.dev>',
      to: data.email,
      subject: '欢迎加入张江多功能墙！',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">张江多功能墙</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">欢迎加入！</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">欢迎，${data.name}！</h2>
            
            <p style="color: #666; line-height: 1.6;">
              恭喜您成功加入张江多功能墙！您的账号已经验证通过，现在可以享受所有功能了。
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">您可以：</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>发布匿名或实名动态</li>
                <li>与其他同学互动交流</li>
                <li>参与校园话题讨论</li>
                <li>分享学习生活点滴</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                开始使用
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                <strong>温馨提示：</strong><br>
                • 请遵守社区规则，文明发言<br>
                • 保护个人隐私，谨慎分享敏感信息<br>
                • 如有问题或建议，请联系管理员
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 张江多功能墙. 保留所有权利.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('发送欢迎邮件失败:', error)
      throw error
    }

    console.log('欢迎邮件发送成功:', result)
    return result
  } catch (error) {
    console.error('邮件服务错误:', error)
    throw error
  }
} 