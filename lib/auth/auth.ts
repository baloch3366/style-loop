
// lib/auth.ts - SIMPLIFIED VERSION
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/database/mongoClient";
import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/models/user-model";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise) as any,
  
  session: {
    strategy: "jwt", 
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email })
            .select("+password +failedLoginAttempts +accountLockedUntil");
          
          if (!user) throw new Error("Invalid email or password");
          
          // Your authorize logic...
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error: any) {
          throw new Error(error.message);
        }
      },
    }),
  ],

  callbacks: {
    async jwt(params: any) {
      const { token, user } = params;
      
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      return token;
    },

    async session(params: any) {
      const { session, token } = params;
      
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});