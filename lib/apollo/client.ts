// // lib/apollo/client.ts
import { ApolloClient, createHttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getSession } from 'next-auth/react';

// HTTP Link
const httpLink = createHttpLink({
  uri: '/api/graphql', // Your GraphQL endpoint
  credentials: 'include', // ⭐ CRITICAL: Include HTTP-only cookies
});

// Auth Link - injects auth token from NextAuth session
const authLink = setContext(async (_, { headers }) => {
  // Get session from NextAuth
  const session = await getSession();
  
  return {
    headers: {
      ...headers,
      // Pass user ID for backend authorization
      ...(session?.user?.id && {
        'x-user-id': session.user.id,
      }),
      // Pass user role for permission checks
      ...(session?.user?.role && {
        'x-user-role': session.user.role,
      }),
    },
  };
});

// Error Handling Link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle auth errors
      if (message.includes('Not authenticated') || message.includes('Not authorized')) {
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login?error=auth';
        }
      }
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Create Apollo Client
export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
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


// // lib/apollo/client.ts
// import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
// import { createHttpLink } from '@apollo/client/link/http';
// import { setContext } from '@apollo/client/link/context';
// import { onError } from '@apollo/client/link/error';
// import { getSession } from 'next-auth/react';

// // HTTP Link
// const httpLink = createHttpLink({
//   uri: '/api/graphql',
//   credentials: 'include', // include HTTP-only cookies
// });

// // Auth Link – inject user ID and role from NextAuth session
// const authLink = setContext(async (_, { headers }) => {
//   const session = await getSession();
//   return {
//     headers: {
//       ...headers,
//       ...(session?.user?.id && { 'x-user-id': session.user.id }),
//       ...(session?.user?.role && { 'x-user-role': session.user.role }),
//     },
//   };
// });

// // Error Handling Link
// const errorLink = onError(({ graphQLErrors, networkError }) => {
//   if (graphQLErrors) {
//     graphQLErrors.forEach(({ message, locations, path }) => {
//       console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
//       // Handle authentication errors
//       if (message.includes('Not authenticated') || message.includes('Not authorized')) {
//         if (typeof window !== 'undefined') {
//           window.location.href = '/login?error=auth';
//         }
//       }
//     });
//   }
//   if (networkError) {
//     console.error(`[Network error]: ${networkError}`);
//   }
// });

// // Combine links using ApolloLink.from (no need for separate '@apollo/client/link/core')
// const link = ApolloLink.from([errorLink, authLink, httpLink]);

// // Create Apollo Client
// export const client = new ApolloClient({
//   link,
//   cache: new InMemoryCache({
//     typePolicies: {
//       Query: {
//         fields: {
//           products: {
//             keyArgs: ['filters', 'pagination'],
//             merge(existing = { items: [], pagination: {} }, incoming) {
//               return {
//                 ...incoming,
//                 items: [...(existing.items || []), ...incoming.items],
//               };
//             },
//           },
//         },
//       },
//     },
//   }),
//   defaultOptions: {
//     watchQuery: {
//       fetchPolicy: 'cache-and-network',
//       errorPolicy: 'all',
//     },
//     query: {
//       fetchPolicy: 'network-only',
//       errorPolicy: 'all',
//     },
//     mutate: {
//       errorPolicy: 'all',
//     },
//   },
// });