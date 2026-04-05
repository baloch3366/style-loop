'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import Image from 'next/image';
import { GET_CATEGORIES } from '@/lib/graphql/queries/categories';
import { Loader2 } from 'lucide-react';

interface CategoryImage {
  thumbnail?: string | null;
  main?: string | null;
  gallery?: string[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: CategoryImage;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  productCount: number;
  isActive: boolean;
  products?: Product[];
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  productCount: number;
  isActive: boolean;
  products?: Product[];
}

interface CategoriesResponse {
  categories: {
    items: CategoryItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export default function FeaturedCategories() {
  const { data, loading, error } = useQuery<CategoriesResponse>(
    GET_CATEGORIES,
    {
      variables: {
        limit: 6,
        page: 1,
        withProducts: true,
        productsLimit: 4,
        onlyActive: true,
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  if (loading) {
    return (
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-6">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error loading categories:', error);
    return (
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load categories</h3>
            <p className="text-red-600">Please try again later</p>
          </div>
        </div>
      </section>
    );
  }

  const categories = data?.categories?.items || [];
  const pagination = data?.categories?.pagination;

  if (categories.length === 0) {
    return (
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-sm p-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories available</h3>
            <p className="text-gray-600">Categories will appear here once they are added</p>
          </div>
        </div>
      </section>
    );
  }

  // Filter only active categories for display
  const activeCategories = categories.filter(cat => cat.isActive);

  if (activeCategories.length === 0) {
    return null;
  }

  // Get total product count across all displayed categories
  const totalProductsCount = activeCategories.reduce(
    (sum, category) => sum + category.productCount, 
    0
  );

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-3">
            Browse Categories
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover products organized by category. Find exactly what you need from our curated collections.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {activeCategories.map((category) => {
            const productImage = category.products?.[0]?.images?.thumbnail || 
                               category.products?.[0]?.images?.main || 
                               category.image;

            return (
              <div
                key={category.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <Link href={`/categories/${category.slug || category.id}`}>
                  {/* Category Image */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    {productImage ? (
                      <Image
                        src={productImage}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-5xl font-bold text-gray-300 opacity-50">
                          {category.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300" />
                    
                    {/* Product count badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                      <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        {category.productCount} items
                      </span>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {category.name}
                      </h3>
                      {!category.isActive && (
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    {/* Product Previews */}
                    {category.products && category.products.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Top Products
                          </span>
                          <div className="flex-1 h-px bg-gray-200"></div>
                        </div>
                        <div className="flex -space-x-3">
                          {category.products.slice(0, 4).map((product) => (
                            <div
                              key={product.id}
                              className="relative w-14 h-14 rounded-xl border-3 border-white shadow-lg overflow-hidden group/product"
                              title={product.name}
                            >
                              {product.images?.thumbnail || product.images?.main ? (
                                <Image
                                  src={product.images.thumbnail || product.images.main!}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover/product:scale-110 transition-transform duration-300"
                                  sizes="56px"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                                  <span className="text-xs font-bold text-blue-600">
                                    ${product.price.toFixed(0)}
                                  </span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover/product:bg-black/20 transition-colors duration-300" />
                            </div>
                          ))}
                          {category.productCount > 4 && (
                            <div className="relative w-14 h-14 rounded-xl border-3 border-white bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-700">
                                +{category.productCount - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Call to Action */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-semibold text-sm group-hover:text-blue-800 transition-colors">
                          Explore {category.name}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Stats & CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">
                Explore All Categories
              </h3>
              <p className="text-blue-100 max-w-xl">
                Browse through {pagination?.total || 0} categories with {totalProductsCount} products to find exactly what you're looking for.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/categories"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                View All Categories
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-center"
              >
                Browse All Products
              </Link>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {pagination?.total || 0}
              </div>
              <div className="text-blue-200 text-sm">Total Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {totalProductsCount}
              </div>
              <div className="text-blue-200 text-sm">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {Math.max(...activeCategories.map(cat => cat.productCount), 0)}
              </div>
              <div className="text-blue-200 text-sm">Most Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {Math.round(totalProductsCount / (activeCategories.length || 1))}
              </div>
              <div className="text-blue-200 text-sm">Avg per Category</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}