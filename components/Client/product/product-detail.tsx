// components/pages/ProductDetailClient.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Package,
  Tag,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/store/cart-store';
import { GET_PRODUCT } from '@/lib/graphql/queries/products';
import type { GetProductQuery, GetProductQueryVariables } from '@/lib/graphql/generated/graphql';

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const productId = params.id as string;
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, isInCart, getItemQuantity } = useCartStore();

  const { data, loading, error } = useQuery<GetProductQuery, GetProductQueryVariables>(
    GET_PRODUCT,
    { variables: { id: productId } }
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data?.product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const product = data.product;
  const mainImage = product.images?.main || product.images?.thumbnail || '/placeholder-product.jpg';
  const gallery = product.images?.gallery || [];
  const isInStock = product.inventory > 0;
  const alreadyInCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    if (!isInStock) return;
    setIsAdding(true);
    try {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: mainImage,
        sku: product.sku || '',
        maxQuantity: product.inventory,
      });
      toast({
        title: 'Added to cart!',
        description: `${product.name} added to your cart.`,
      });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not add item.', variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {!isInStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge className="text-lg px-4 py-2 bg-red-600">Out of Stock</Badge>
              </div>
            )}
          </div>
          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {gallery.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80">
                  <Image src={url} alt={`${product.name} ${idx+1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          {product.category && (
            <Link
              href={`/products?category=${product.category.id}`}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-4"
            >
              <Tag className="h-4 w-4" />
              {product.category.name}
            </Link>
          )}

          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <Badge
              className={`text-sm ${
                isInStock
                  ? product.inventory < 10
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isInStock
                ? product.inventory < 10
                  ? `Only ${product.inventory} left`
                  : 'In Stock'
                : 'Out of Stock'}
            </Badge>
          </div>

          {product.shortDescription && (
            <p className="text-gray-600 mb-6">{product.shortDescription}</p>
          )}

          <div className="space-y-4 mb-8">
            <Button
              onClick={handleAddToCart}
              disabled={!isInStock || isAdding}
              className="w-full md:w-auto px-8"
              size="lg"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Adding...
                </>
              ) : alreadyInCart ? (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add More ({cartQuantity} in cart)
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">Product Details</h3>
            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {product.sku && (
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="h-4 w-4" />
                <span>SKU: {product.sku}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Truck className="h-4 w-4" />
              <span>Free shipping over $50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}