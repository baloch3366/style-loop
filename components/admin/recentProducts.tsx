'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Edit, Trash2, Star, Grid, List, ArrowRight, Eye } from 'lucide-react';

export interface RecentProduct {
  id: string;
  name: string;
  price: number;
  category: { id: string; name: string } | null;
  inventory: number;
  status: string;
  featured: boolean;
  sku?: string;
  images?: {
    main?: string | null;
    thumbnail?: string | null;
  } | null;
}

interface RecentProductsProps {
  products: RecentProduct[];
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onEdit: (product: RecentProduct) => void;
  onDelete: (product: RecentProduct) => void;
}

export default function RecentProducts({
  products,
  viewMode,
  onViewModeChange,
  onEdit,
  onDelete,
}: RecentProductsProps) {
  if (!products.length) return null;

  // Helper to get the best available image URL
  const getImageUrl = (product: RecentProduct): string | null => {
    return product.images?.main || product.images?.thumbnail || null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle>Recent Products</CardTitle>
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 border rounded-md p-1 bg-background">
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              onClick={() => onViewModeChange('table')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-1" />
              Table
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => onViewModeChange('grid')}
              className="h-8 px-3"
            >
              <Grid className="h-4 w-4 mr-1" />
              Grid
            </Button>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/admin/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {viewMode === 'table' ? (
          // ---------- TABLE VIEW ----------
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const imageUrl = getImageUrl(product);
                  return (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              {product.name}
                              {product.featured && (
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                            {product.sku && (
                              <div className="text-xs text-muted-foreground">{product.sku}</div>
                            )}
                          </div>
                        </div>
                       </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {product.category?.name || 'Uncategorized'}
                       </td>
                      <td className="py-3 px-4 font-medium">${product.price.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            product.inventory < 10
                              ? 'text-destructive font-medium'
                              : 'text-muted-foreground'
                          }
                        >
                          {product.inventory}
                        </span>
                       </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            product.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : product.status === 'INACTIVE'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {product.status}
                        </span>
                       </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* View button */}
                          <Link href={`/products/${product.id}`} target="_blank">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                              title="View on store"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {/* Edit button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                            onClick={() => onEdit(product)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* Delete button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(product)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // ---------- GRID VIEW ----------
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => {
                const imageUrl = getImageUrl(product);
                return (
                  <div
                    key={product.id}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-muted">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      {product.featured && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-yellow-400 rounded-full p-1">
                            <Star className="h-3 w-3 fill-white text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div>
                        <h3 className="font-medium line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.category?.name || 'Uncategorized'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            product.inventory < 10
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : product.inventory < 50
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {product.inventory} left
                        </span>
                      </div>

                      {/* Status and actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            product.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : product.status === 'INACTIVE'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {product.status}
                        </span>
                        <div className="flex items-center gap-1">
                          <Link href={`/products/${product.id}`} target="_blank">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                              title="View on store"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                            onClick={() => onEdit(product)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(product)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}