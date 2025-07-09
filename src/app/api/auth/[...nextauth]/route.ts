import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        // For demo purposes, allow any valid email to sign in
        // In production, you would verify with your Django backend
        try {
          // Simulate API call to Django backend
          const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)

          if (isValidEmail) {
            return {
              id: credentials.email,
              email: credentials.email,
              name: credentials.email.split('@')[0],
            }
          }
        } catch (error) {
          console.error('Error during authentication:', error)
        }

        return null
      }
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.email = token.email
        session.user.name = token.name
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
