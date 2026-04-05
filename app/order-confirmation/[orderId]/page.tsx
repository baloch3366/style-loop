'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GET_ORDER } from '@/lib/graphql/queries/order'; // ✅ use the single order query
import { useToast } from '@/hooks/use-toast';

// ✅ Use the generated types (after running codegen)
import type { GetOrderQuery, GetOrderQueryVariables } from '@/lib/graphql/generated/graphql';

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.orderId as string;
  const sessionId = searchParams.get('session_id');

  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: 'Invalid confirmation',
        description: 'Missing payment session information.',
        variant: 'destructive',
      });
      router.push('/');
      return;
    }
    setVerifying(false);
  }, [sessionId, router, toast]);

  // ✅ Use the correct query document and variables
  const { data, loading, error } = useQuery<GetOrderQuery, GetOrderQueryVariables>(
    GET_ORDER,
    {
      variables: { id: orderId! }, // safe because skip ensures orderId is truthy
      skip: verifying || !orderId,
    }
  );

  if (verifying || loading || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-8">We couldn't find your order. Please contact support.</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const order = data.order;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Thank You for Your Order!</CardTitle>
            <p className="text-gray-600 mt-2">
              Order #{order.orderNumber} has been confirmed.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 space-y-1">
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
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              {order.shippingAddress ? (
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                  {order.shippingAddress.country}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Address not available</p>
              )}
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button asChild variant="outline">
                <Link href="/">Continue Shopping</Link>
              </Button>
              <Button asChild>
                <Link href="/orders">View My Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}