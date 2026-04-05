// app/page.tsx - FULLY TYPED AND CORRECTED
'use client';

import { useQuery } from '@apollo/client/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Package, Star, Headphones, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/product-card';
import {
  GetProductsDocument,
  GetActiveCategoriesDocument,
  GetBestSellingProductsDocument,
  GetNewArrivalsDocument,
  GetProductsQuery,
  GetActiveCategoriesQuery,
  GetBestSellingProductsQuery,
  GetNewArrivalsQuery,
} from '@/lib/graphql/generated/graphql';
import type { ProductCardFieldsFragment, CategoryCardFieldsFragment } from '@/lib/graphql/generated/graphql';
import FeaturesBanner from '@/components/Layout/features-banner';

export default function HomePage() {
  const { data: session, status } = useSession();

  // ✅ typed query for featured products
  const { data: productsData, loading: productsLoading } = useQuery<GetProductsQuery>(
    GetProductsDocument,
    {
      variables: {
        filters: { featured: true },
        pagination: { limit: 8 },
      },
      skip: status === 'loading',
    }
  );

  // ✅ typed query for active categories
  const { data: categoriesData, loading: categoriesLoading } = useQuery<GetActiveCategoriesQuery>(
    GetActiveCategoriesDocument,
    {
      skip: status === 'loading',
    }
  );

  // ✅ typed query for best sellers
  const { data: bestSellersData, loading: bestSellersLoading } = useQuery<GetBestSellingProductsQuery>(
    GetBestSellingProductsDocument,
    { variables: { limit: 4 }, skip: status === 'loading' }
  );

  // ✅ typed query for new arrivals
  const { data: newArrivalsData, loading: newArrivalsLoading } = useQuery<GetNewArrivalsQuery>(
    GetNewArrivalsDocument,
    { variables: { limit: 4 }, skip: status === 'loading' }
  );

  const featuredProducts = productsData?.products?.items || [];
  const categories = (categoriesData?.activeCategories as CategoryCardFieldsFragment[]) || [];
  const productCount = productsData?.products?.pagination?.total || 0;
  const bestSellers = (bestSellersData?.bestSellingProducts as ProductCardFieldsFragment[]) || [];
  const newArrivals = (newArrivalsData?.newArrivals as ProductCardFieldsFragment[]) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span>🎉</span> New Collection
            <span className="mx-2">•</span>
            <span>🚚 Free Shipping Worldwide</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Discover Amazing Products
          </h1>

          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Shop the latest trends in fashion, electronics, and home goods.
            Quality products at unbeatable prices with fast delivery.
          </p>

          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Products</p>
                    <p className="text-2xl font-bold">
                      {productsLoading ? '...' : `${Math.ceil(productCount / 1000)}K+`}
                    </p>
                  </div>
                  <Package className="h-10 w-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Customer Rating</p>
                    <p className="text-2xl font-bold">4.9★</p>
                  </div>
                  <Star className="h-10 w-10 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Support</p>
                    <p className="text-2xl font-bold">24/7</p>
                  </div>
                  <Headphones className="h-10 w-10 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Shipping</p>
                    <p className="text-2xl font-bold">Free</p>
                  </div>
                  <Truck className="h-10 w-10 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked selection of our best products</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No featured products yet
              </h3>
              <p className="text-gray-600 mb-6">
                Mark products as "featured" in the admin panel to display them here.
              </p>
              <Button asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Best Sellers 🔥</h2>
              <p className="text-gray-600">Our most popular products right now</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/products?sort=totalSold">View All</Link>
            </Button>
          </div>

          {bestSellersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} showSalesBadge />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No best sellers yet
              </h3>
              <p className="text-gray-600 mb-6">
                Products with sales will appear here.
              </p>
              <Button asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">New Arrivals ✨</h2>
              <p className="text-gray-600">Fresh from our collection</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/products?sort=newest">View All</Link>
            </Button>
          </div>

          {newArrivalsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} showNewBadge />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No new arrivals yet
              </h3>
              <p className="text-gray-600 mb-6">
                Check back soon for fresh products.
              </p>
              <Button asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse Categories</h2>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {category.description || 'Explore our collection'}
                      </p>
                      <div className="text-sm font-medium text-blue-600">
                        {category.productCount || 0} products
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories available yet.</p>
              <p className="text-sm text-gray-400">Run `yarn seed` to populate the database</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl py-16 px-4 md:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers. Start shopping now and experience
              the best online shopping experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="/login">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <FeaturesBanner />
      </section>
    </div>
  );
}