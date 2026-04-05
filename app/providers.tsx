'use client';

import { ApolloProvider } from '@apollo/client/react';
import { SessionProvider } from 'next-auth/react';
import { client } from '@/lib/apollo/client';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </SessionProvider>
  );
}