'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, DollarSign } from 'lucide-react';
import CategoryFilter from './category-filter'; // 👈 import the dropdown

export interface ProductFilterState {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

interface ProductFiltersProps {
  initialFilters?: ProductFilterState;
  onFilterChange: (filters: ProductFilterState) => void;
  onReset?: () => void;
}

export default function ProductFilters({
  initialFilters = {},
  onFilterChange,
  onReset,
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProductFilterState>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const handleChange = (key: keyof ProductFilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    const newFilters = {
      ...localFilters,
      minPrice: values[0],
      maxPrice: values[1],
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: ProductFilterState = {};
    setLocalFilters(resetFilters);
    setPriceRange([0, 1000]);
    setShowAdvanced(false);
    onFilterChange(resetFilters);
    onReset?.();
  };

  const hasActiveFilters = () => {
    return Object.entries(localFilters).some(([key, value]) => {
      if (key === 'minPrice' || key === 'maxPrice') {
        return value !== undefined && value !== (key === 'minPrice' ? 0 : 1000);
      }
      return value && value !== '';
    });
  };

//  same logic but simple 
//   const hasActiveFilters = () => {
//   const { search, category, minPrice, maxPrice } = localFilters;

//   return (
//     search ||
//     category ||
//     (minPrice !== undefined && minPrice !== 0) ||
//     (maxPrice !== undefined && maxPrice !== 1000)
//   );
// };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search products..."
          value={localFilters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Category Filter (Dropdown) */}
      <div className="space-y-2">
        <Label>Category</Label>
        <CategoryFilter
          selectedCategoryId={localFilters.category}
          onSelectCategory={(categoryId) => handleChange('category', categoryId)}
        />
      </div>

      {/* Sort Options */}
      <div>
        <Label>Sort By</Label>
        <Select
          value={localFilters.sortBy || 'featured'}
          onValueChange={(value) => handleChange('sortBy', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters Toggle */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full"
        >
          <Filter className="mr-2 h-4 w-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="space-y-6">
            {/* Price Range */}
            <div>
              <Label className="mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price Range
              </Label>
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  min={0}
                  max={1000}
                  step={10}
                  onValueChange={handlePriceRangeChange}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">${priceRange[0]}</span>
                  <span className="text-gray-600">${priceRange[1]}+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters() && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Active Filters</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localFilters.search && (
              <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Search: {localFilters.search}
                <button
                  type="button"
                  onClick={() => handleChange('search', '')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {localFilters.category && (
              <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Category: Selected
                <button
                  type="button"
                  onClick={() => handleChange('category', '')}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {(localFilters.minPrice !== undefined && localFilters.minPrice > 0) && (
              <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                Min: ${localFilters.minPrice}
                <button
                  type="button"
                  onClick={() => {
                    setPriceRange([0, priceRange[1]]);
                    handleChange('minPrice', undefined);
                  }}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {(localFilters.maxPrice !== undefined && localFilters.maxPrice < 1000) && (
              <div className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                Max: ${localFilters.maxPrice}
                <button
                  type="button"
                  onClick={() => {
                    setPriceRange([priceRange[0], 1000]);
                    handleChange('maxPrice', undefined);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}