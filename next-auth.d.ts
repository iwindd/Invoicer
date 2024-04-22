import NextAuth from "next-auth"

export interface User{
  uid: number
  email: string,
  firstname: string,
  lastname: string,
  status: number
}

declare module "next-auth" {
  interface Session {
    user: User
  }
}