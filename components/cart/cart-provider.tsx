'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useApolloClient } from '@apollo/client/react';
import { useCartStore } from '@/lib/store/cart-store';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const client = useApolloClient();

  useEffect(() => {
    useCartStore.setState({
      _apolloClient: client,
      _getSession: () => session,
    });
  }, [client, session]);

  // Sync server cart on login
  useEffect(() => {
    if (session?.user) {
      useCartStore.getState().syncFromServer();
    }
  }, [session]);

  return <>{children}</>;
}