import Prisma from '@/libs/prisma'
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  pages: {
    signIn: '/auth/signin'
  },
  session: {
    strategy: 'jwt',
    maxAge: 100 * 12 * 30 * 24 * 60 * 60, // 100 year
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ trigger, token, user, session }: any) {
      if (trigger === 'update') {
        return { ...token, ...session.user }
      }

      return {
        ...{
          uid: token.uid,
          email: token.email,
          firstname: token.firstname,
          lastname: token.lastname,
          status: token.status
        }, ...user
      }
    },
    async session({ session, token }: any) {
      session.user = token as any

      return session
    }
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const data = await Prisma.user.findFirst({
            where: { email: credentials.email, password: credentials.password, isDeleted: false }
          })

          if (!data) return null

          return {
            ...data,
            id: String(data.id),
            uid: data.id,
            firstname: data.firstname,
            lastname: data.lastname,
            status: data.permission
          }
        } catch (error) {
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthOptions
