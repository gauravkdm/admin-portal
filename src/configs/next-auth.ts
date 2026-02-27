import type { NextAuthOptions } from "next-auth"

import { db } from "@/lib/prisma"
import { verifyOtp } from "@/lib/twilio"

import CredentialsProvider from "next-auth/providers/credentials"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      phone: string
      firstName: string | null
      lastName: string | null
      avatar: string | null
      isAdmin: boolean
    }
  }

  interface User {
    id: string
    phone: string
    firstName: string | null
    lastName: string | null
    avatar: string | null
    isAdmin: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    phone: string
    firstName: string | null
    lastName: string | null
    avatar: string | null
    isAdmin: boolean
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "otp-verify",
      name: "OTP",
      credentials: {
        phone: { type: "text" },
        otp: { type: "text" },
        countryCode: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null

        try {
          await verifyOtp(
            credentials.countryCode || "91",
            credentials.phone,
            credentials.otp
          )

          const user = await db.users.findFirst({
            where: { PhoneNo: credentials.phone },
          })

          if (!user) {
            throw new Error("User not found")
          }

          if (!user.IsAdmin) {
            throw new Error("Access denied. Admin privileges required.")
          }

          return {
            id: user.Id,
            phone: user.PhoneNo || credentials.phone,
            firstName: user.FirstName,
            lastName: user.LastName,
            avatar: user.ProfilePhotoCdnUrl1,
            isAdmin: user.IsAdmin,
          }
        } catch (e: unknown) {
          throw new Error(
            e instanceof Error ? e.message : "Authentication failed"
          )
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = user.phone
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.avatar = user.avatar
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.phone = token.phone
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.avatar = token.avatar
        session.user.isAdmin = token.isAdmin
      }
      return session
    },
  },
}
