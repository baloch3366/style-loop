'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentProps {
  orderId: string;
  disabled?: boolean;
}

export default function StripePayment({ orderId, disabled }: StripePaymentProps) {
    console.log('StripePayment rendered with orderId:', orderId);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
    } catch (error: any) {
      toast({
        title: 'Payment Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Redirecting to Stripe...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-5 w-5" />
          Pay with Credit Card
        </>
      )}
    </Button>
  );
}