'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCartStore } from '@/lib/store/cart-store';
import { useToast } from '@/hooks/use-toast';
import { ProductCardFieldsFragment } from '@/lib/graphql/generated/graphql';

interface ProductCardProps {
  product: ProductCardFieldsFragment;
  showSalesBadge?: boolean;
  showNewBadge?: boolean;
}

export default function ProductCard({ 
  product, 
  showSalesBadge, 
  showNewBadge 
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const { addItem, isInCart, getItemQuantity } = useCartStore();

  // ✅ Fixed: proper fallback to a placeholder string
  const imageUrl = 
    product.images?.main || 
    product.images?.thumbnail || 
    '/placeholder-product.jpg';
  
  const categoryName = product.category?.name || 'Uncategorized';
  const categorySlug = product.category?.slug || 'uncategorized';
  
  const inventory = product.inventory ?? 0;
  const isInStock = inventory > 0;
  const isLowStock = inventory > 0 && inventory < 10;
  
  const isAlreadyInCart = isInCart(product.id);
  const quantityInCart = getItemQuantity(product.id);

  // New badge: within last 7 days
  const isNew = showNewBadge && product.createdAt && 
    new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const handleAddToCart = async () => {
    if (!isInStock) return;

    setIsAdding(true);

    try {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: imageUrl,
        sku: product.sku || '',
        maxQuantity: Math.min(inventory, 10),
      });

      toast({
        title: 'Added to cart!',
        description: `${product.name} has been added to your cart.`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {showSalesBadge && product.totalSold && product.totalSold > 0 && (
          <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {product.totalSold}+ sold
          </span>
        )}
        {isNew && (
          <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
            New
          </span>
        )}
        {product.featured && !showSalesBadge && !isNew && (
          <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
            Featured
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/products/${product.id}`}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      <CardContent className="p-4">
        {/* Category */}
        {product.category && (
          <Link
            href={`/category/${categorySlug}`}
            className="inline-block text-xs font-medium text-blue-600 hover:text-blue-800 mb-2"
          >
            {categoryName}
          </Link>
        )}

        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 mb-2 min-h-[3rem]">
            {product.name}
          </h3>
        </Link>

        {/* Description (optional) */}
        {product.shortDescription && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
            {product.shortDescription}
          </p>
        )}

        {/* Price & Cart Status */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-bold text-xl text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {isAlreadyInCart && (
              <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <Check className="h-3 w-3" />
                {quantityInCart} in cart
              </div>
            )}
          </div>
          {/* Stock Status */}
          <div
            className={`text-xs px-2 py-1 rounded-full ${
              !isInStock
                ? 'bg-red-100 text-red-800'
                : isLowStock
                ? 'bg-amber-100 text-amber-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {!isInStock
              ? 'Out of stock'
              : isLowStock
              ? `Only ${inventory} left`
              : 'In stock'}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button
            className="flex-1"
            size="sm"
            disabled={!isInStock || isAdding}
            onClick={handleAddToCart}
          >
            {isAdding ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Adding...
              </>
            ) : isAlreadyInCart ? (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add More ({quantityInCart})
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/products/${product.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}