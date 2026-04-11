'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface PayPalPaymentProps {
  orderId: string;
  disabled?: boolean;
}

export default function PayPalPayment({ orderId, disabled }: PayPalPaymentProps) {
    console.log('🪙 PayPalPayment rendered with orderId:', orderId);

  const { toast } = useToast();
  const router = useRouter();

  const createOrder = async () => {
        console.log('📤 Creating PayPal order with orderId:', orderId);
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
       console.log('📥 PayPal create-order response:', data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data.id;
    } catch (error: any) {
      toast({
        title: 'Payment Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const onError = (err: any) => {
    toast({
      title: 'Payment Error',
      description: err.message || 'PayPal payment failed',
      variant: 'destructive',
    });
  };

  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    return null;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={createOrder}
        onError={onError}
        disabled={disabled}
      />
    </PayPalScriptProvider>
  );
}


// File Path	Purpose
// lib/stripe.ts	Stripe SDK initialization (server-side)
// app/api/stripe/create-checkout/route.ts	Creates Stripe Checkout Session
// app/api/stripe/webhook/route.ts	Listens for payment success/failure
// app/api/paypal/create-order/route.ts	Creates PayPal order
// app/api/paypal/capture-order/route.ts	Captures PayPal payment
// components/checkout/stripe-payment.tsx	Stripe Checkout button
// components/checkout/paypal-payment.tsx	PayPal Smart Button