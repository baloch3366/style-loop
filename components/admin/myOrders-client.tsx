// components/orders/MyOrdersClient.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Package, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GET_USER_ORDERS } from '@/lib/graphql/queries/order';
import type { GetUserOrdersQuery } from '@/lib/graphql/generated/graphql';

export default function MyOrdersClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data, loading, error } = useQuery<GetUserOrdersQuery>(GET_USER_ORDERS, {
    variables: { pagination: { page: currentPage, limit } },
    skip: status !== 'authenticated',
  });

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/orders');
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const orders = data?.userOrders?.items || [];
  const totalPages = data?.userOrders?.pagination?.totalPages || 1;

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="text-2xl font-bold mt-4">No orders yet</h1>
        <p className="text-gray-600 mt-2">You haven't placed any orders. Start shopping!</p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Order #{order.orderNumber}
                  </CardTitle>
                  <CardDescription>
                    Placed on {format(new Date(order.createdAt), 'PPP')}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">${order.total.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{order.status}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2 mt-2">
                {order.items.slice(0, 3).map((item, idx) => (
                  <span key={idx} className="text-sm text-gray-600">
                    {item.name} x{item.quantity}
                    {idx < order.items.length - 1 && ', '}
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span className="text-sm text-gray-500">
                    +{order.items.length - 3} more
                  </span>
                )}
              </div>
              <div className="mt-4">
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    View Details <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="py-2 px-3">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}