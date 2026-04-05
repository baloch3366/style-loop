'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from './product-card';
import ProductFilters, { ProductFilterState } from './products-filter';
import {
  GetProductsDocument,
  GetProductsQuery,          // ✅ import the query type
  ProductCardFieldsFragment, // ✅ import fragment type for product
} from '@/lib/graphql/generated/graphql';

interface ProductListProps {
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

// Skeleton Loader
function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
          <Skeleton className="h-64 w-full" />
          <div className="p-5 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductList({ selectedCategory, onCategoryChange }: ProductListProps) {
  const [filters, setFilters] = useState<ProductFilterState>({
    category: selectedCategory,
  });

  const [clearProducts, setClearProducts] = useState(false);

  const buildQueryFilters = () => {
    const queryFilters: any = {};
    if (filters.search) queryFilters.search = filters.search;
    if (filters.category) queryFilters.category = filters.category;
    if (filters.minPrice !== undefined) queryFilters.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined) queryFilters.maxPrice = filters.maxPrice;
    return queryFilters;
  };

  // ✅ Add the generic type to useQuery
  const { data, loading, error, refetch } = useQuery<GetProductsQuery>(GetProductsDocument, {
    variables: {
      filters: buildQueryFilters(),
      pagination: { page: 1, limit: 12 },
    },
    fetchPolicy: 'cache-and-network',
  });

  const products = clearProducts ? [] : data?.products?.items || [];
  const totalProducts = data?.products?.pagination?.total || 0;

  useEffect(() => {
    if (selectedCategory !== filters.category) {
      setClearProducts(true);
      setFilters(prev => ({ ...prev, category: selectedCategory }));
      refetch({ filters: { ...buildQueryFilters(), category: selectedCategory } }).finally(() => {
        setClearProducts(false);
      });
    }
  }, [selectedCategory]);

  const handleFilterChange = (newFilters: ProductFilterState) => {
    setFilters(newFilters);
    if (newFilters.category !== selectedCategory && onCategoryChange) {
      onCategoryChange(newFilters.category || '');
    }
  };

  const handleResetFilters = () => {
    setFilters({});
    if (onCategoryChange) onCategoryChange('');
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Error loading products: {error.message}
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Products</h2>
          <p className="text-gray-600">
            {loading || clearProducts
              ? 'Loading...'
              : `${totalProducts} product${totalProducts !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      <ProductFilters
        initialFilters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {loading || clearProducts ? (
        <ProductListSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or check back later.
          </p>
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