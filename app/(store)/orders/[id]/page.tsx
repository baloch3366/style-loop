'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { GET_ORDER } from '@/lib/graphql/queries/order';
import { format } from 'date-fns';
import { Loader2, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GetOrderQuery } from '@/lib/graphql/generated/graphql'; 

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data, loading, error } = useQuery<GetOrderQuery>(GET_ORDER, {
    variables: { id: orderId },
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600">Order Not Found</h1>
        <Button asChild className="mt-4">
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const order = data.order;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/orders">← Back to Orders</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.orderNumber}</CardTitle>
          <p className="text-sm text-gray-500">
            Placed on {format(new Date(order.createdAt), 'PPP')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Items</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b py-2">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-4 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <address className="not-italic text-gray-600">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
              {order.shippingAddress.country}
            </address>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}