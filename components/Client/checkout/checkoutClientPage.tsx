'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import StripePayment from '@/components/Client/checkout/stripe-payment';
import PayPalPayment from '@/components/Client/checkout/paypal-payments';

import { 
  ArrowLeft, 
  Truck, 
  Shield, 
  Loader2,
  MapPin,
  ShoppingCart,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/store/cart-store';

import { 
  CreateOrderDocument,
  CreateOrderMutation,
  CreateOrderMutationVariables 
} from '@/lib/graphql/generated/graphql';
import { checkoutFormSchema, CheckoutFormValues } from '@/types/validation';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const { items, clearCart, getSubtotal, getTotal } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingCost, setShippingCost] = useState(5.99);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; orderNumber: string } | null>(null);
  const taxRate = 0.08;

  const [createOrder] = useMutation<CreateOrderMutation, CreateOrderMutationVariables>(
    CreateOrderDocument
  );

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
      },
      shippingMethod: 'standard',
      saveInfo: false,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const selectedShippingMethod = watch('shippingMethod');

  useEffect(() => {
    setShippingCost(selectedShippingMethod === 'standard' ? 5.99 : 14.99);
  }, [selectedShippingMethod]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && status !== 'loading') {
      toast({
        title: 'Your cart is empty',
        description: 'Add some products before checkout',
      });
      router.replace('/products');
    }
  }, [items, status, router, toast]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            You need items in your cart to checkout.
          </p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const tax = subtotal * taxRate;
  const total = getTotal(shippingCost, tax);

  const onSubmit = async (data: CheckoutFormValues) => {
      console.log('onSubmit called with data:', data); 
    setIsSubmitting(true); 
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      // Set a placeholder payment method – will be updated after actual payment
      const { data: result } = await createOrder({
        variables: {
          input: {
            items: orderItems,
            shippingMethod: data.shippingMethod,
            shippingAddress: data.shippingAddress,
            paymentMethod: 'pending', // or a default like 'card'

          },
        },
      });

      console.log("Order response:", result);


      if (result?.createOrder) {
          console.log('✅ Order created, ID:', result.createOrder.id);
        setCreatedOrder({
          id: result.createOrder.id,
          orderNumber: result.createOrder.orderNumber,
        });
        
        toast({
          title: 'Order created',
          description: 'Please complete payment to confirm your order.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Checkout failed',
        description: error?.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link 
          href="/cart" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column – Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Shipping Address
                </CardTitle>
                <CardDescription>
                  Where should we deliver your order?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      {...register('shippingAddress.street')}
                      placeholder="123 Main St"
                      className={errors.shippingAddress?.street ? 'border-red-500' : ''}
                    />
                    {errors.shippingAddress?.street && (
                      <p className="text-sm text-red-500">{errors.shippingAddress.street.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register('shippingAddress.city')}
                      placeholder="New York"
                      className={errors.shippingAddress?.city ? 'border-red-500' : ''}
                    />
                    {errors.shippingAddress?.city && (
                      <p className="text-sm text-red-500">{errors.shippingAddress.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province *</Label>
                    <Input
                      id="state"
                      {...register('shippingAddress.state')}
                      placeholder="NY"
                      className={errors.shippingAddress?.state ? 'border-red-500' : ''}
                    />
                    {errors.shippingAddress?.state && (
                      <p className="text-sm text-red-500">{errors.shippingAddress.state.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">Postal Code *</Label>
                    <Input
                      id="zip"
                      {...register('shippingAddress.zip')}
                      placeholder="10001"
                      className={errors.shippingAddress?.zip ? 'border-red-500' : ''}
                    />
                    {errors.shippingAddress?.zip && (
                      <p className="text-sm text-red-500">{errors.shippingAddress.zip.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      onValueChange={(value) => setValue('shippingAddress.country', value)}
                      defaultValue={form.getValues('shippingAddress.country')}
                    >
                      <SelectTrigger className={errors.shippingAddress?.country ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.shippingAddress?.country && (
                      <p className="text-sm text-red-500">{errors.shippingAddress.country.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="saveInfo"
                    {...register('saveInfo')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="saveInfo" className="text-sm font-normal text-gray-600">
                    Save this address for next time
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Shipping Method
                </CardTitle>
                <CardDescription>
                  Choose your delivery speed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        value="standard"
                        {...register('shippingMethod')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium">Standard Shipping</p>
                        <p className="text-sm text-gray-500">5-7 business days</p>
                      </div>
                    </div>
                    <span className="font-semibold">$5.99</span>
                  </label>
                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        value="express"
                        {...register('shippingMethod')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium">Express Shipping</p>
                        <p className="text-sm text-gray-500">2-3 business days</p>
                      </div>
                    </div>
                    <span className="font-semibold">$14.99</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column – Order Summary */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold mt-1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {!createdOrder ? (
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="w-full mt-4 h-12 text-base"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      'Continue to Payment'
                    )}
                  </Button>
                ) : (
                  <div className="space-y-4 mt-4">
                    <StripePayment orderId={createdOrder.id} />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or pay with</span>
                      </div>
                    </div>
                    <PayPalPayment orderId={createdOrder.id} />
                  </div>
                )}

                <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-green-600" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    30-Day Returns
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-purple-600" />
                    Free Shipping over $50
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}                         