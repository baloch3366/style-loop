'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CartIcon() {
  const { items, getTotalItems, getSubtotal, removeItem } = useCartStore();
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Shopping Cart</span>
          <span className="text-sm font-normal text-gray-500">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {items.length === 0 ? (
          <div className="py-6 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <>
            <DropdownMenuGroup className="max-h-96 overflow-y-auto">
              {items.map((item) => (
                <DropdownMenuItem 
                  key={item.id}
                  className="flex items-center gap-3 p-3 cursor-default hover:bg-gray-50"
                >
                  <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Subtotal:</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex gap-2">
                <Link href="/cart" className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Cart
                  </Button>
                </Link>
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full">
                    Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}