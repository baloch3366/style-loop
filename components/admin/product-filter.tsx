'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Filter, 
  X, 
  Download, 
  RefreshCw, 
  Package,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

// ✅ Import generated types (including the query type)
import { 
  GetCategoriesForAdminFilterDocument,
  GetCategoriesForAdminFilterQuery,  // 👈 import the query type
  CategoryFilterFieldsFragment 
} from '@/lib/graphql/generated/graphql';

export interface FilterState {
  search?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inventory?: string;
  limit?: number;
}

interface AdminProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  showResultsCount?: boolean;
  totalResults?: number;
}

export default function AdminProductFilters({ 
  filters, 
  onFilterChange,
  onExport,
  onRefresh,
  showResultsCount = true,
  totalResults = 0
}: AdminProductFiltersProps) {
  // ✅ Add the generic type to useQuery
  const { data: categoriesData, loading: categoriesLoading } = useQuery<GetCategoriesForAdminFilterQuery>(
    GetCategoriesForAdminFilterDocument,
    {
      variables: {
        pagination: { page: 1, limit: 100 },
      },
    }
  );

  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ✅ Now TypeScript knows that categoriesData has a categories property
  const categories = (categoriesData?.categories?.items as CategoryFilterFieldsFragment[]) || [];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ ...filters, search: localSearch || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, filters, onFilterChange]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      limit: filters.limit || 25
    };
    onFilterChange(resetFilters);
    setLocalSearch('');
  };

  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'limit') return false;
      if (key === 'minPrice' || key === 'maxPrice') {
        return value !== undefined;
      }
      return value && value !== '';
    });
  };

  return (
    <div className="space-y-4">
      {/* Stats & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {showResultsCount && (
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {totalResults} product{totalResults !== 1 ? 's' : ''} found
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {hasActiveFilters() && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-9"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showAdvanced ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          
          {onExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExport}
              className="h-9"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Quick Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products by name, SKU, or description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => handleFilterChange('category', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {!categoriesLoading && categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <span>{category.name}</span>
                          {!category.isActive && (
                            <span className="ml-2 text-xs text-gray-500">(Inactive)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="ACTIVE">
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="INACTIVE">
                      <div className="flex items-center">
                        <XCircle className="mr-2 h-3 w-3 text-red-500" />
                        Inactive
                      </div>
                    </SelectItem>
                    <SelectItem value="DRAFT">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-3 w-3 text-yellow-500" />
                        Draft
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inventory Filter */}
              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory</Label>
                <Select
                  value={filters.inventory || ''}
                  onValueChange={(value) => handleFilterChange('inventory', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Inventory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Inventory</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock (&lt;10)</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    min="0"
                    step="0.01"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    min="0"
                    step="0.01"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {/* Items Per Page */}
              <div className="space-y-2">
                <Label htmlFor="limit">Per Page</Label>
                <Select
                  value={filters.limit?.toString() || '25'}
                  onValueChange={(value) => handleFilterChange('limit', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="25" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Toggle Filters */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-medium">Featured Only</Label>
                  <p className="text-sm text-gray-500 mt-1">Show featured products</p>
                </div>
                <Switch
                  checked={filters.featured || false}
                  onCheckedChange={(checked) => handleFilterChange('featured', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Badges */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <Search className="h-3 w-3" />
              {filters.search}
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  handleFilterChange('search', undefined);
                }}
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.category && (
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Category: {categories.find(c => c.id === filters.category)?.name}
              <button
                type="button"
                onClick={() => handleFilterChange('category', undefined)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.status && (
            <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              {filters.status === 'ACTIVE' && <CheckCircle className="h-3 w-3 mr-1" />}
              {filters.status === 'INACTIVE' && <XCircle className="h-3 w-3 mr-1" />}
              {filters.status === 'DRAFT' && <Clock className="h-3 w-3 mr-1" />}
              {filters.status}
              <button
                type="button"
                onClick={() => handleFilterChange('status', undefined)}
                className="text-purple-600 hover:text-purple-800 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.featured && (
            <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              Featured Only
              <button
                type="button"
                onClick={() => handleFilterChange('featured', false)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}