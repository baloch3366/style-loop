'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import CategoriesList from '@/components/products/categories-list';
import ProductList from '@/components/products/product-list';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Mobile Filters Button */}
        <div className="lg:hidden mb-6">
          <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Browse Categories
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Categories</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <CategoriesList
                  selectedCategory={selectedCategory}
                  onSelectCategory={(categoryId) => {
                    setSelectedCategory(categoryId);
                    setIsMobileFiltersOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <CategoriesList
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <ProductList 
            selectedCategory={selectedCategory} 
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>
    </div>
  );
}