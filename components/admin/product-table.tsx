'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  Eye, 
  Edit, 
  Trash2, 
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { GET_ADMIN_PRODUCTS } from '@/lib/graphql/queries/products';
import { 
  AdminProductCardFieldsFragment,
  GetAdminProductsQuery   
} from '@/lib/graphql/generated/graphql';

interface AdminProductTableProps {
  filters?: any;
  onEdit?: (productId: string) => void;
  onDelete?: (product: AdminProductCardFieldsFragment) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function AdminProductTable({ 
  filters = {},
  onEdit,
  onDelete,
  onSelectionChange 
}: AdminProductTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data, loading, error, refetch } = useQuery<GetAdminProductsQuery>(GET_ADMIN_PRODUCTS, {
    variables: {
      filters,
      pagination: {
        page: currentPage,
        limit: 20
      }
    },
  });

  const products = (data?.products?.items as AdminProductCardFieldsFragment[]) || [];
  const totalPages = data?.products?.pagination?.totalPages || 1;
  const totalItems = data?.products?.pagination?.total || 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = products.map(p => p.id);
      setSelectedProducts(allIds);
      onSelectionChange?.(allIds);
    } else {
      setSelectedProducts([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedProducts, productId]
      : selectedProducts.filter(id => id !== productId);
    
    setSelectedProducts(newSelection);
    onSelectionChange?.(newSelection);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Active'
      },
      INACTIVE: { 
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        label: 'Inactive'
      },
      DRAFT: { 
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'Draft'
      },
    };

    const statusConfig = config[status as keyof typeof config] || config.DRAFT;
    const Icon = statusConfig.icon;

    return (
      <Badge className={`${statusConfig.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Products</h3>
        <p className="text-red-700">{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => refetch()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-800">
              {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Set as Active</DropdownMenuItem>
                <DropdownMenuItem>Set as Inactive</DropdownMenuItem>
                <DropdownMenuItem>Update Inventory</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete Selected</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedProducts([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No products found</p>
                  <p className="mt-2">Try adjusting your filters or create a new product.</p>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => 
                        handleSelectProduct(product.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                          src={
                              product.images?.main ||
                              product.images?.thumbnail ||
                              product.images?.gallery?.[0] ||
                              '/placeholder-image.jpg'
                            }
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.sku && (
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category?.name ? (
                      <Badge variant="outline" className="text-xs">
                        {product.category.name}
                        {!product.category.isActive && (
                          <span className="ml-1 text-gray-500">(inactive)</span>
                        )}
                      </Badge>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            product.inventory === 0 ? 'bg-red-500' :
                            product.inventory < 10 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (product.inventory / 100) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm">{product.inventory}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(product.status)}
                  </TableCell>
                  <TableCell>
                    {product.featured ? (
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/products/${product.id}`} target="_blank">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View on store</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {onEdit ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => onEdit(product.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit product</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => onDelete?.(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete product</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{((currentPage - 1) * 20) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * 20, totalItems)}
            </span> of{' '}
            <span className="font-medium">{totalItems}</span> products
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="h-9 w-9"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2 text-gray-500">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="h-9 w-9"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}