'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/product-card';
import {
  GetActiveCategoriesDocument,
  GetProductsDocument,
  GetActiveCategoriesQuery,   // ✅ import query type for categories
  GetProductsQuery,          // ✅ import query type for products
  CategoryCardFieldsFragment,
  ProductCardFieldsFragment, // ✅ import fragment type for products
} from '@/lib/graphql/generated/graphql';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  // ✅ Add generic to useQuery for categories
  const { data: categoriesData, loading: categoriesLoading } = useQuery<GetActiveCategoriesQuery>(
    GetActiveCategoriesDocument
  );

  // ✅ Explicitly type the find callback
  const category = categoriesData?.activeCategories?.find(
    (cat: CategoryCardFieldsFragment) => cat.slug === slug
  );

  // ✅ Add generic to useQuery for products
  const { data: productsData, loading: productsLoading } = useQuery<GetProductsQuery>(
    GetProductsDocument,
    {
      variables: {
        filters: {
          category: category?.id,
        },
        pagination: { page: 1, limit: 50 },
      },
      skip: !category?.id, // wait until we have the category ID
    }
  );

  if (categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    );
  }

  const products = productsData?.products?.items || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/products"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all products
      </Link>

      {/* Category header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 max-w-2xl">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Products grid */}
      {productsLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No products in this category</h3>
          <p className="text-gray-600 mt-2">Check back later or browse other categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: ProductCardFieldsFragment) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}