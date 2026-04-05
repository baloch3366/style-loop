import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from './resolvers/index';
import { createGraphQLContext, GraphQLContext } from './context';
import { NextRequest } from 'next/server';

const apolloServer = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
});

// Use the handler
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: createGraphQLContext,
});

export async function GET(request: NextRequest) {
  const response = await handler(request);
  
  // Add CORS headers for development
  if (process.env.NODE_ENV === 'development') {
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  }
  
  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}

export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, { status: 204 });
  
  if (process.env.NODE_ENV === 'development') {
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  }
  
  return response;
}