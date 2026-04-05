'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Package, 
  Grid,
  List,
  Download,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Loader2
} from 'lucide-react';
import AdminProductTable from '@/components/admin/product-table';
import AdminProductFilters from '@/components/admin/product-filter';
import ProductEditModal from '@/components/admin/productEdit-model';

// GraphQL imports
import { 
  GetAdminProductsDocument,
  GetCategoriesForAdminFilterDocument,
  GetProductDocument,                 // lazy query for full product
  AdminProductCardFieldsFragment,
  CategoryFilterFieldsFragment,
  GetAdminProductsQuery,
  GetCategoriesForAdminFilterQuery,
  ProductDetailsFieldsFragment,
  GetProductQuery
} from '@/lib/graphql/generated/graphql';

interface FilterState {
  search?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inventory?: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

export default function AdminProductsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filters, setFilters] = useState<FilterState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 25
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetailsFieldsFragment | null>(null);

  // Lazy query to fetch full product details when editing
const [getProduct, { data: productData, loading: productLoading }] = useLazyQuery<GetProductQuery>(GetProductDocument);

  // When productData arrives, open the modal with the full product
  useEffect(() => {
    if (productData?.product) {
      setEditingProduct(productData.product as ProductDetailsFieldsFragment);
      setModalOpen(true);
    }
  }, [productData]);

  // Query for product list
  const { data: productsData, loading, error, refetch } = useQuery<GetAdminProductsQuery>(
    GetAdminProductsDocument,
    {
      variables: {
        filters: {
          search: filters.search,
          category: filters.category,
          status: filters.status as any,
          featured: filters.featured,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        },
        pagination: {
          page: pagination.page,
          limit: pagination.limit
        }
      }
    }
  );

  // Query for categories (used in filters)
  const { data: categoriesData } = useQuery<GetCategoriesForAdminFilterQuery>(
    GetCategoriesForAdminFilterDocument,
    {
      variables: {
        pagination: { page: 1, limit: 100 }
      }
    }
  );

  const products = (productsData?.products?.items as AdminProductCardFieldsFragment[]) || [];
  const totalProducts = productsData?.products?.pagination?.total || 0;
  const categories = (categoriesData?.categories?.items as CategoryFilterFieldsFragment[]) || [];

  // Calculate stats
  const activeProducts = products.filter(p => p.status === 'ACTIVE').length;
  const featuredProducts = products.filter(p => p.featured).length;
  const outOfStockProducts = products.filter(p => p.inventory <= 0).length;

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'SKU', 'Price', 'Inventory', 'Status', 'Category'],
      ...products.map(p => [
        p.id,
        p.name,
        p.sku || '',
        p.price,
        p.inventory,
        p.status,
        p.category?.name || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Edit handler: fetch full product and then open modal
  const handleEdit = (productId: string) => {
    getProduct({ variables: { id: productId } });
  };

  // Modal close handler
  const handleModalClose = () => {
    setModalOpen(false);
    setEditingProduct(null);
    // No need to clear productData – the next edit will fetch fresh data.
  };

  // Success handler after update
  const handleUpdateSuccess = () => {
    refetch();               // refresh the product list
    handleModalClose();     // close modal
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-gray-600">
            Manage your product catalog ({totalProducts} products)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading || products.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-xl font-bold text-gray-900">{activeProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-xl font-bold text-gray-900">{featuredProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-2">
              <Package className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-xl font-bold text-gray-900">{outOfStockProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="bg-white rounded-lg shadow border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4 mr-2" />
              Table View
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid View
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            {selectedProducts.length > 0 && (
              <span className="font-medium text-blue-600">
                {selectedProducts.length} selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <AdminProductFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        showResultsCount={true}
        totalResults={totalProducts}
      />

      {/* Products Display */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow border">
          <AdminProductTable
            filters={filters}
            onEdit={handleEdit}               // 👈 pass edit handler for modal
            onSelectionChange={setSelectedProducts}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="rounded-lg bg-red-50 p-4">
                <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
                <p className="mt-2 text-sm text-red-700">{error.message}</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your filters or create a new product.</p>
              <div className="mt-6">
                <Link href="/admin/products/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Product
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id}>
                  <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                      <img
                        src={product.images?.thumbnail || product.images?.main || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </h3>
                        <span className="font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          product.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status}
                        </span>
                        {product.featured && (
                          <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/products/${product.id}`} target="_blank" className="flex-1">
                          <Button variant="ghost" size="sm" className="w-full">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Edit Modal */}
      {editingProduct && (
        <ProductEditModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          product={editingProduct}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Loading overlay while fetching product details */}
      {productLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">Loading product details...</p>
          </div>
        </div>
      )}
    </div>
  );
}