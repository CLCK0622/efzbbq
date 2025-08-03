import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      student_id?: string
      is_verified?: boolean
      is_admin?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    student_id?: string
    is_verified?: boolean
    is_admin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    student_id?: string
    is_verified?: boolean
    is_admin?: boolean
  }
} 