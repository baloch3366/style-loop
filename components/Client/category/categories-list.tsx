'use client';

import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { ChevronRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GetCategoriesDocument,
  GetCategoriesQuery,  
  CategoryCardFieldsFragment,
} from '@/lib/graphql/generated/graphql';

interface CategoriesListProps {
  onSelectCategory?: (categoryId: string) => void;
  selectedCategory?: string;
}

export default function CategoriesList({
  onSelectCategory,
  selectedCategory,
}: CategoriesListProps) {
  const { data, loading, error } = useQuery<GetCategoriesQuery>(GetCategoriesDocument, {
    variables: {
      pagination: { page: 1, limit: 50 },
      onlyActive: true,
    },
  });

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const categories = (data?.categories?.items as CategoryCardFieldsFragment[]) || [];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (error) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="text-red-600 text-sm mb-2">Unable to load categories</div>
        <p className="text-gray-500 text-sm mb-4">Please try again later</p>
        <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Browse Categories</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectCategory?.('')}
          className={!selectedCategory ? 'bg-blue-50 text-blue-600' : ''}
        >
          All Categories
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-6 border rounded-lg">
          <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No categories available</p>
        </div>
      ) : (
        <div className="space-y-1">
          {categories.map((category) => (
            <div key={category.id}>
              <Button
                variant="ghost"
                className={`w-full justify-between ${
                  selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : ''
                }`}
                onClick={() => onSelectCategory?.(category.id)}
              >
                <span className="flex items-center gap-2">
                  <span>{category.name}</span>
                  {category.productCount > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {category.productCount}
                    </span>
                  )}
                </span>
                {/* Optional: show chevron if you implement nested categories */}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}