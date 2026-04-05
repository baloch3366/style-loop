'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Tag, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Star, 
  RefreshCw, 
  BarChart3,
  Plus
} from 'lucide-react';
import { useProductStore } from '@/lib/store/product-store';
import ProductCreateModal from '@/components/admin/product-createModel';
import ProductEditModal from '@/components/admin/productEdit-model';
import ProductDeleteModal from '@/components/admin/product-deleteModel';
import RecentProducts from '@/components/admin/recentProducts';
import { GET_DASHBOARD_STATS } from '@/lib/graphql/queries/dashboard';

interface DashboardStatsData {
  dashboardStats: {
    totalProducts: number;
    activeProducts: number;
    featuredProducts: number;
    lowInventory: number;
    totalCategories: number;
    recentProducts: Array<{
      id: string;
      name: string;
      price: number;
      sku: string;
      inventory: number;
      status: string;
      featured: boolean;
      createdAt: string;
      category: { id: string; name: string } | null;
      images?: { main?: string | null; thumbnail?: string | null } | null;
    }>;
  };
}

// Stats cards configuration
const statCards = [
  {
    title: 'Total Products',
    queryKey: 'totalProducts',
    icon: Package,
    color: 'bg-blue-500',
    link: '/admin/products',
  },
  {
    title: 'Active Products',
    queryKey: 'activeProducts',
    icon: TrendingUp,
    color: 'bg-green-500',
    link: '/admin/products?status=ACTIVE',
  },
  {
    title: 'Featured Products',
    queryKey: 'featuredProducts',
    icon: Star,
    color: 'bg-yellow-500',
    link: '/admin/products?featured=true',
  },
  {
    title: 'Low Inventory',
    queryKey: 'lowInventory',
    icon: AlertTriangle,
    color: 'bg-red-500',
    link: '/admin/products?inventory=low',
  },
  {
    title: 'Categories',
    queryKey: 'totalCategories',
    icon: Tag,
    color: 'bg-purple-500',
    link: '/admin/categories',
  },
];

export default function AdminDashboard() {
  const [recentViewMode, setRecentViewMode] = useState<'table' | 'grid'>('table');

  // Fetch dashboard stats (including recent products)
  const { data: statsData, loading, error, refetch: refetchStats } =
    useQuery<DashboardStatsData>(GET_DASHBOARD_STATS);

  // Modal state from the product store
  const {
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedProduct,
    selectedProductDetails,
    setCreateModalOpen,
    setEditModalOpen,
    setDeleteModalOpen,
    setSelectedProduct,
    setSelectedProductDetails,
  } = useProductStore();

  // Handlers for edit and delete
  const handleEdit = (product: any) => {
    setSelectedProductDetails(product);
    setEditModalOpen(true);
  };

  const handleDelete = (product: any) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    refetchStats(); // refresh the dashboard stats after create/update/delete
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-red-600">Error loading dashboard: {error.message}</p>
      </div>
    );
  }

  const stats = statsData?.dashboardStats || {
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    lowInventory: 0,
    totalCategories: 0,
    recentProducts: [],
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetchStats()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className="transform overflow-hidden rounded-lg bg-white shadow transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`rounded-md p-3 ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {card.queryKey === 'totalProducts' && stats.totalProducts}
                    {card.queryKey === 'activeProducts' && stats.activeProducts}
                    {card.queryKey === 'featuredProducts' && stats.featuredProducts}
                    {card.queryKey === 'lowInventory' && stats.lowInventory}
                    {card.queryKey === 'totalCategories' && stats.totalCategories}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Products Component */}
      <RecentProducts
        products={stats.recentProducts}
        viewMode={recentViewMode}
        onViewModeChange={setRecentViewMode}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products/new"
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
          >
            <Package className="mb-3 h-8 w-8 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
            <p className="mt-2 text-sm text-gray-600">Create a new product listing</p>
          </Link>
          <Link
            href="/admin/categories/new"
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
          >
            <Tag className="mb-3 h-8 w-8 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Create Category</h3>
            <p className="mt-2 text-sm text-gray-600">Add a new product category</p>
          </Link>
          <Link
            href="/admin/users"
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
          >
            <Users className="mb-3 h-8 w-8 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
            <p className="mt-2 text-sm text-gray-600">View and manage user accounts</p>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
          >
            <BarChart3 className="mb-3 h-8 w-8 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">View Analytics</h3>
            <p className="mt-2 text-sm text-gray-600">Check store performance</p>
          </Link>
        </div>
      </div>

      {/* Modals */}
      <ProductCreateModal
        open={isCreateModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleSuccess}
      />
      {selectedProductDetails && (
        <ProductEditModal
          open={isEditModalOpen}
          onOpenChange={setEditModalOpen}
          product={selectedProductDetails}
          onSuccess={handleSuccess}
        />
      )}
      {selectedProduct && (
        <ProductDeleteModal
          open={isDeleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          product={selectedProduct}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}