'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { Package, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GetActiveCategoriesDocument,
  GetActiveCategoriesQuery,  // ✅ import the query type
} from '@/lib/graphql/generated/graphql';
import type { CategoryCardFieldsFragment } from '@/lib/graphql/generated/graphql';

export default function CategoriesPage() {
  // ✅ add the generic type to useQuery
  const { data, loading, error } = useQuery<GetActiveCategoriesQuery>(GetActiveCategoriesDocument);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Categories</h1>
        <p className="text-gray-600 mb-8">{error.message}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const categories = (data?.activeCategories as CategoryCardFieldsFragment[]) || [];

  if (categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Categories Yet</h1>
        <p className="text-gray-600 mb-8">Check back later or run the seed script to populate the database.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">All Categories</h1>
      <p className="text-gray-600 mb-8">Browse our collection of {categories.length} categories.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group block"
          >
            <Card className="h-full hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="text-sm font-medium text-blue-600">
                  {category.productCount || 0} products
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}