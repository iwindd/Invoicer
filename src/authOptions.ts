import Prisma from '@/libs/prisma'
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

const loginWithToken = async (token: string) => {
  try {
    const data = await Prisma.user.findFirst({
      where: { loginToken: token }
    })

    if (!data) return null
    if (data.loginToken.length <= 5) return null
    let lineToken = await getApplicationLineToken(data.id);

    await Prisma.user.update({
      where: {
        id: data.id
      },
      data: {
        loginToken: ""
      }
    })

    return {
      ...data,
      id: String(data.id),
      uid: data.id,
      firstname: data.firstname,
      lastname: data.lastname,
      status: data.permission,
      root: data.root,
      application: data.application,
      lineToken: lineToken
    }
  } catch (error) {
    return null;
  }
}

export const getApplicationLineToken = async(application : number) => {
  try {
    const customer = await Prisma.customers.findFirst({
      where: {
        loginId: +application
      },
      select: {
        applicationlineToken: true
      }
    })

    if (customer) {
      return customer.applicationlineToken
    }else{
      return process.env.LINE_TOKEN!
    }
  } catch (error) {
    console.log('error to find token', error);
    
    return ""
  }
}

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
          status: token.status,
          root: token.root,
          application: token.application,
          lineToken: token.lineToken
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
        password: {},
        token: {}
      },
      async authorize(credentials) {
        if (credentials?.token != "--") return loginWithToken(credentials?.token as string);
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const data = await Prisma.user.findUnique({
            where: { email: credentials.email, isDeleted: false }
          })

          if (!data) return null
          if (!await bcrypt.compare(credentials.password, data.password)) return null
          let token = await getApplicationLineToken(data.application)

          return {
            ...data,
            id: String(data.id),
            uid: data.id,
            firstname: data.firstname,
            lastname: data.lastname,
            status: data.permission,
            root: data.root,
            application: data.application,
            lineToken: token
          }
        } catch (error) {
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthOptions
