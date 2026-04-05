'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  Truck,
  Shield,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/store/cart-store';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getSubtotal,
    getTotal 
  } = useCartStore();

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  const subtotal = getSubtotal();
  const shippingCost = shippingMethod === 'standard' ? 5.99 : 14.99;
  const tax = subtotal * 0.08;
  const total = getTotal(shippingCost, tax);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your cart',
      });
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart',
      });
    }
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <div className="space-y-4">
            <Link href="/products">
              <Button size="lg" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Cart
        </Button>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Cart Items Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Cart Items</h2>
            </div>

            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="sm:w-24 sm:h-24 w-full h-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                            {item.name}
                          </h3>
                        </Link>

                        {item.sku && (
                          <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(item.productId, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  item.productId,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-16 h-8 border-0 text-center"
                              min="1"
                            />

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(item.productId, item.quantity + 1)
                              }
                              disabled={
                                item.maxQuantity
                                  ? item.quantity >= item.maxQuantity
                                  : false
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${item.price.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Link href="/products">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="mt-8 lg:mt-0">
          <div className="bg-white rounded-lg shadow border sticky top-24">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Order Summary</h2>
            </div>

            <div className="p-6">
              {/* Shipping Method (still shown because it affects total displayed) */}
              <div className="mb-6 space-y-2">
                <label className="flex justify-between border p-3 rounded-lg cursor-pointer">
                  <div>
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                    />
                    <span className="ml-2 font-medium">Standard (5-7 days)</span>
                  </div>
                  <span>$5.99</span>
                </label>

                <label className="flex justify-between border p-3 rounded-lg cursor-pointer">
                  <div>
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                    />
                    <span className="ml-2 font-medium">Express (2-3 days)</span>
                  </div>
                  <span>$14.99</span>
                </label>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* ✅ FIXED: Navigate to checkout page, not place order */}
              <Link href="/checkout">
                <Button size="lg" className="w-full">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="mt-6 pt-6 border-t flex justify-center gap-6 text-gray-500 text-xs">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Secure Payment
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Free Returns
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}