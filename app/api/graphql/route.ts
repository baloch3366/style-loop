import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from "@/lib/graphql/resolvers";

export interface GraphQLContext {
  userId?: string | null;
  role?: string | null;
  email?: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  req: NextRequest;
}

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error("GraphQL Error:", error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
    };
  },
});

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: async (req) => {
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET! 
      });
      
      if (!token) {
        return { 
          userId: null, 
          role: null, 
          email: null,
          isAuthenticated: false,
          isAdmin: false,
          req,
        };
      }

      return {
        userId: token.id as string,
        role: token.role as string,
        email: token.email as string,
        isAuthenticated: true,
        isAdmin: token.role === 'ADMIN',
        req,
      };
    } catch (error) {
      console.error("Context error:", error);
      return { 
        userId: null, 
        role: null, 
        email: null,
        isAuthenticated: false,
        isAdmin: false,
        req,
      };
    }
  },
});


// context: async (req) => {
//   try {
//     // For development, allow skipping auth
//     if (process.env.SKIP_AUTH === 'true') {
//       return {
//         userId: '65d4f8a9b8d4f8a9b8d4f8a9', // Mock admin ID
//         role: 'ADMIN',
//         email: 'admin@example.com',
//         isAuthenticated: true,
//         isAdmin: true,
//         req,
//       };
//     }

//     const token = await getToken({ 
//       req, 
//       secret: process.env.NEXTAUTH_SECRET! 
//     });
    
//     if (!token) {
//       return { 
//         userId: null, 
//         role: null, 
//         email: null,
//         isAuthenticated: false,
//         isAdmin: false,
//         req,
//       };
//     }

//     return {
//       userId: token.id as string,
//       role: token.role as string,
//       email: token.email as string,
//       isAuthenticated: true,
//       isAdmin: token.role === 'ADMIN',
//       req,
//     };
//   } catch (error) {
//     console.error("Context error:", error);
//     return { 
//       userId: null, 
//       role: null, 
//       email: null,
//       isAuthenticated: false,
//       isAdmin: false,
//       req,
//     };
//   }
// },})

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}



