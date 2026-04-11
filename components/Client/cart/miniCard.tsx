'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart-store';

interface MiniCartProps {
  onClose?: () => void;
}

export default function MiniCart({ onClose }: MiniCartProps) {
  const { items, removeItem, getTotalItems, getSubtotal } = useCartStore();
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  
  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Your Cart</h3>
        <span className="text-sm text-gray-500">
          {totalItems} item{totalItems !== 1 ? 's' : ''}
        </span>
      </div>
      
      {items.length === 0 ? (
        <div className="py-8 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-16 w-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-500">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </span>
                    <span className="font-medium text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Subtotal:</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-2">
              <Link href="/cart" className="flex-1" onClick={onClose}>
                <Button variant="outline" className="w-full">
                  View Cart
                </Button>
              </Link>
              <Link href="/checkout" className="flex-1" onClick={onClose}>
                <Button className="w-full">
                  Checkout
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}