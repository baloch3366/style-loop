'use client';

import { useQuery } from '@apollo/client/react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { GET_CATEGORIES_FOR_FILTER } from '@/lib/graphql/queries/categories';
import { CategoryFilterFieldsFragment } from '@/lib/graphql/generated/graphql';
import { GetCategoriesForFilterQuery } from '@/lib/graphql/generated/graphql';
import { useState } from 'react';

interface CategoryFilterProps {
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryFilter({ 
  selectedCategoryId, 
  onSelectCategory 
}: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  
  const { data, loading, error } = useQuery<GetCategoriesForFilterQuery>(GET_CATEGORIES_FOR_FILTER, {
    variables: {
      pagination: { page: 1, limit: 100 },
      onlyActive: true,
    },
  });

  const categories = (data?.categories?.items as CategoryFilterFieldsFragment[]) || [];
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Failed to load categories
      </div>
    );
  }

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCategory ? selectedCategory.name : 'Select category...'}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            <CommandItem
              onSelect={() => {
                onSelectCategory('');
                setOpen(false);
              }}
            >
              <Check
                className={`mr-2 h-4 w-4 ${
                  !selectedCategoryId ? 'opacity-100' : 'opacity-0'
                }`}
              />
              All Categories
            </CommandItem>
            {categories.map((category) => (
              <CommandItem
                key={category.id}
                onSelect={() => {
                  onSelectCategory(category.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    selectedCategoryId === category.id ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <span>{category.name}</span>
                {category.productCount > 0 && (
                  <span className="ml-auto text-xs text-gray-500">
                    ({category.productCount})
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}