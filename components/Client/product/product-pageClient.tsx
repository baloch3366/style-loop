// components/pages/ProductsPageClient.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { 
  Grid,
  List,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ProductCard from '@/components/Client/product/product-card';
import UserProductFilters from '@/components/Client/product/products-filter';
import CategoriesList from '@/components/Client/category/categories-list';
import { GetProductsDocument, GetProductsQuery } from '@/lib/graphql/generated/graphql';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface UserFilterState {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

export default function ProductsPageClient() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UserFilterState>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);

  const { data, loading, error } = useQuery<GetProductsQuery>(GetProductsDocument, {
    variables: {
      filters: {
        search: filters.search,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      },
      pagination: {
        page: currentPage,
        limit: 12
      }
    }
  });

  const products = data?.products?.items || [];
  const totalPages = data?.products?.pagination?.totalPages || 1;
  const totalProducts = data?.products?.pagination?.total || 0;

  const handleFilterChange = (newFilters: UserFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="lg:w-1/4 hidden lg:block space-y-6">
          <div className="sticky top-24">
            <CategoriesList
              selectedCategory={filters.category}
              onSelectCategory={(catId) => handleFilterChange({ ...filters, category: catId })}
            />
            <div className="mt-6">
              <UserProductFilters
                initialFilters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-gray-600">
              Browse our collection of {totalProducts} products
            </p>
          </div>

          {/* Mobile action buttons */}
          <div className="lg:hidden mb-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsMobileCategoryOpen(true)}>
              <Filter className="mr-2 h-4 w-4" /> Categories
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setIsMobileFilterOpen(true)}>
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Mobile drawers (same as original) */}
          <Sheet open={isMobileCategoryOpen} onOpenChange={setIsMobileCategoryOpen}>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader><SheetTitle>Categories</SheetTitle></SheetHeader>
              <div className="mt-6">
                <CategoriesList
                  selectedCategory={filters.category}
                  onSelectCategory={(catId) => {
                    handleFilterChange({ ...filters, category: catId });
                    setIsMobileCategoryOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="mt-6">
                <UserProductFilters
                  initialFilters={filters}
                  onFilterChange={(newFilters) => {
                    handleFilterChange(newFilters);
                    setIsMobileFilterOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* View toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
              <span className="ml-4 text-sm text-gray-600">{totalProducts} products found</span>
            </div>
          </div>

          {/* Products display (same as original) */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
              <p className="mt-2 text-sm text-red-700">{error.message}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your filters or search term.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow border p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={product.images?.thumbnail || product.images?.main || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {product.shortDescription || 'No description available.'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xl text-gray-900">${product.price.toFixed(2)}</span>
                          <span className={`ml-3 text-sm ${product.inventory > 0 ? (product.inventory < 10 ? 'text-amber-600' : 'text-green-600') : 'text-red-600'}`}>
                            {product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <Button>View Details</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8">
              <nav className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(pageNum)} className="h-9 w-9">
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} className="h-9 w-9">
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
