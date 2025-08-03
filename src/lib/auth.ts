import { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { sql } from './db'
import bcrypt from 'bcryptjs'

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const users = await sql`
            SELECT u.*, p.student_id, p.real_name, p.is_verified, p.is_admin
            FROM users u
            LEFT JOIN profiles p ON u.id = p.id
            WHERE u.email = ${credentials.email}
          `

          if (!users || users.length === 0) {
            return null
          }

          const userData = users[0]
          
          // 检查密码 (假设使用 bcrypt)
          const isValidPassword = await bcrypt.compare(credentials.password, userData.password_hash)
          
          if (!isValidPassword) {
            return null
          }

          return {
            id: userData.id,
            email: userData.email,
            name: userData.real_name,
            student_id: userData.student_id,
            is_verified: userData.is_verified,
            is_admin: userData.is_admin,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.student_id = user.student_id
        token.is_verified = user.is_verified
        token.is_admin = user.is_admin
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.student_id = token.student_id
        session.user.is_verified = token.is_verified
        session.user.is_admin = token.is_admin
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  session: {
    strategy: "jwt"
  }
} 