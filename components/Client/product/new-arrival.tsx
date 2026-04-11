'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Loader2, Package, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GET_NEW_ARRIVALS } from '@/lib/graphql/queries/products';
import ProductCard from '@/components/Client/product/product-card';
import type { GetNewArrivalsQuery, ProductCardFieldsFragment } from '@/lib/graphql/generated/graphql';

export default function NewArrivalsPage() {
  const [limit, setLimit] = useState(12);
  const [showMoreLoading, setShowMoreLoading] = useState(false);

  const { data, loading, error, fetchMore } = useQuery<GetNewArrivalsQuery>(GET_NEW_ARRIVALS, {
    variables: { limit },
    notifyOnNetworkStatusChange: true,
  });

  const products = (data?.newArrivals as ProductCardFieldsFragment[]) || [];

  const handleLoadMore = async () => {
    setShowMoreLoading(true);
    try {
      await fetchMore({
        variables: { limit: limit + 12 },
        updateQuery: (prev: GetNewArrivalsQuery, { fetchMoreResult }: { fetchMoreResult?: GetNewArrivalsQuery }) => {
          if (!fetchMoreResult) return prev;
          return {
            newArrivals: [...prev.newArrivals, ...fetchMoreResult.newArrivals],
          };
        },
      });
      setLimit(limit + 12);
    } finally {
      setShowMoreLoading(false);
    }
  };

  if (loading && !products.length) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Calendar className="h-4 w-4" />
            Fresh from our collection
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            New Arrivals
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the latest products added to our store. Be the first to shop our newest collections.
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg bg-white">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No new arrivals yet</h3>
            <p className="text-gray-600 mt-2">Check back soon for fresh products.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} showNewBadge />
              ))}
            </div>

            {/* Load More Button */}
            {products.length >= limit && (
              <div className="text-center mt-12">
                <Button
                  onClick={handleLoadMore}
                  disabled={showMoreLoading}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px]"
                >
                  {showMoreLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}