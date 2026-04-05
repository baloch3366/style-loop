import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { createHttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getSession } from 'next-auth/react';

const httpLink = createHttpLink({
  uri: '/api/graphql',
  credentials: 'include',
});

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession();
  return {
    headers: {
      ...headers,
      ...(session?.user?.id && { 'x-user-id': session.user.id }),
      ...(session?.user?.role && { 'x-user-role': session.user.role }),
    },
  };
});

const errorLink = onError((error: any) => {
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach(({ message, locations, path }: any) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
      if (message.includes('Not authenticated') || message.includes('Not authorized')) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login?error=auth';
        }
      }
    });
  }
  if (error.networkError) {
    console.error(`[Network error]: ${error.networkError}`);
  }
});

const link = ApolloLink.from([errorLink, authLink, httpLink]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['filters', 'pagination'],
            merge(existing = { items: [], pagination: {} }, incoming) {
              return {
                ...incoming,
                items: [...(existing.items || []), ...incoming.items],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});