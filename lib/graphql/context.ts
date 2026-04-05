import { NextRequest } from "next/server";

export interface GraphQLContext {
  userId?: string | null;
  role?: string | null;
  email?: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  req: NextRequest;
}

// Optional: Helper function to create context
export async function createGraphQLContext(request: NextRequest): Promise<GraphQLContext> {
  try {
    const { getToken } = await import("next-auth/jwt");
    
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET! 
    });
    
    if (!token) {
      return { 
        userId: null, 
        role: null, 
        email: null,
        isAuthenticated: false,
        isAdmin: false,
        req: request,
      };
    }

    return {
      userId: token.id as string,
      role: token.role as string,
      email: token.email as string,
      isAuthenticated: true,
      isAdmin: token.role === 'ADMIN',
      req: request,
    };
  } catch (error) {
    console.error("Context creation error:", error);
    return { 
      userId: null, 
      role: null, 
      email: null,
      isAuthenticated: false,
      isAdmin: false,
      req: request,
    };
  }
}