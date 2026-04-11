'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/store/cart-store';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    sku?: string;
    inventory: number;
  };
  variant?: 'default' | 'compact' | 'detailed';
  showQuantity?: boolean;
}

export default function AddToCartButton({ 
  product, 
  variant = 'default',
  showQuantity = true 
}: AddToCartButtonProps) {
  const { toast } = useToast();
  const { addItem, isInCart, getItemQuantity, updateQuantity } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  const alreadyInCart = isInCart(product.id);
  const currentQuantity = getItemQuantity(product.id);
  const maxQuantity = Math.min(product.inventory, 99);
  
  const handleAddToCart = async () => {
    if (product.inventory <= 0) {
      toast({
        title: 'Out of Stock',
        description: 'This product is currently unavailable',
        variant: 'destructive'
      });
      return;
    }
    
    if (quantity > maxQuantity) {
      toast({
        title: 'Quantity Limit',
        description: `Maximum ${maxQuantity} items allowed`,
        variant: 'destructive'
      });
      return;
    }
    
    setIsAdding(true);
    
    try {
      if (alreadyInCart) {
        // If already in cart, update quantity to current + desired
        await updateQuantity(product.id, currentQuantity + quantity);
      } else {
        // Add new item with the selected quantity (single call)
        await addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          sku: product.sku,
          maxQuantity: product.inventory
        }, quantity);
      }
      
      toast({
        title: 'Added to Cart',
        description: `${quantity} × ${product.name} added to cart`,
      });
      
      // Reset quantity after adding (except on detailed view where user may want to add again)
      if (variant !== 'detailed') {
        setQuantity(1);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add item to cart',
        variant: 'destructive'
      });
    } finally {
      setIsAdding(false);
    }
  };
  
  if (product.inventory <= 0) {
    return (
      <Button disabled className="w-full">
        Out of Stock
      </Button>
    );
  }
  
  if (variant === 'detailed') {
    return (
      <div className="space-y-4">
        {showQuantity && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Quantity:</label>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 h-10 border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
                max={maxQuantity}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10"
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <span className="text-sm text-gray-500">
              {maxQuantity} available
            </span>
          </div>
        )}
        
        <Button
          size="lg"
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full"
        >
          {isAdding ? (
            'Adding...'
          ) : alreadyInCart ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              {currentQuantity} in Cart • Add {quantity} More
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add {quantity} to Cart • ${(product.price * quantity).toFixed(2)}
            </>
          )}
        </Button>
        
        {alreadyInCart && (
          <p className="text-sm text-green-600 text-center">
            ✓ Item already in cart ({currentQuantity})
          </p>
        )}
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <Button
        size="sm"
        onClick={() => handleAddToCart()}
        disabled={isAdding || product.inventory <= 0}
      >
        {isAdding ? (
          'Adding...'
        ) : alreadyInCart ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            In Cart
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add
          </>
        )}
      </Button>
    );
  }
  
  // Default variant
  return (
    <Button
      className="w-full"
      onClick={handleAddToCart}
      disabled={isAdding || product.inventory <= 0}
      size="sm"
    >
      {isAdding ? (
        'Adding...'
      ) : alreadyInCart ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}