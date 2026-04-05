'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  Tag, 
  DollarSign, 
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DeleteProductDocument, AdminProductCardFieldsFragment } from '@/lib/graphql/generated/graphql';

interface AdminProductCardProps {
  product: AdminProductCardFieldsFragment;
  onDeleteSuccess?: () => void;
  onEditClick?: () => void;
  variant?: 'compact' | 'detailed';
}

export default function AdminProductCard({ 
  product,
  onDeleteSuccess,
  onEditClick,
  variant = 'detailed'
}: AdminProductCardProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [deleteProduct, { loading: isDeleting }] = useMutation(DeleteProductDocument);

  const getImageUrl = (): string => {
  if (!product.images) return '/placeholder-image.jpg';

  return (
    product.images.main ||
    product.images.gallery?.[0] ||
    product.images.thumbnail ||
    '/placeholder-image.jpg'
  );
};

  const handleDelete = async () => {
    try {
      await deleteProduct({
        variables: { id: product.id },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: 'Product deleted successfully',
          });
          setIsDeleteDialogOpen(false);
          onDeleteSuccess?.();
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${text} copied to clipboard`,
    });
  };

  const statusConfig = {
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

  const StatusIcon = statusConfig[product.status as keyof typeof statusConfig]?.icon || Clock;
  const statusColor = statusConfig[product.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800';

  const imageUrl = getImageUrl();

  if (variant === 'compact') {
    return (
      <>
        <div className="bg-white rounded-lg border hover:border-blue-300 transition-colors group">
          <div className="p-4 flex items-start gap-4">
            {/* Image */}
            <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="80px"
              />
              {product.featured && (
                <div className="absolute top-1 right-1">
                  <Badge className="bg-yellow-500 text-white text-xs px-1 py-0 h-4">
                    ★
                  </Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={statusColor}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {product.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 ml-2">
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
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => onEditClick?.()}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
                          onClick={() => setIsDeleteDialogOpen(true)}
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
              </div>
              
              {/* Additional Info */}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {product.inventory} units
                </span>
                {product.sku && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => copyToClipboard(product.sku!)}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          <span>SKU: {product.sku}</span>
                          <Copy className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to copy SKU</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product
                "{product.name}" and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Detailed View (Default)
  return (
    <>
      <div className="bg-white rounded-lg border hover:shadow-md transition-all group">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              {/* Image */}
              <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              {/* Title and Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={statusColor}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {product.status}
                  </Badge>
                  {product.featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      ★ Featured
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {product.category?.name || 'Uncategorized'}
                  </span>
                  {product.sku && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => copyToClipboard(product.sku)}
                            className="flex items-center gap-1 hover:text-gray-800"
                          >
                            <span>SKU: {product.sku}</span>
                            <Copy className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to copy SKU</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/products/${product.id}`} target="_blank">
                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                        <ExternalLink className="h-4 w-4" />
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
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-9 w-9 p-0"
                      onClick={() => onEditClick?.()}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit product</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500">Price</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Package className="h-4 w-4 text-gray-500" />
                <span className={`font-semibold ${
                  product.inventory > 0 
                    ? product.inventory < 10 ? 'text-amber-600' : 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {product.inventory}
                </span>
              </div>
              <p className="text-xs text-gray-500">Inventory</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart3 className="h-4 w-4 text-gray-500" />
                <span className="font-semibold text-gray-900">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <p className="text-xs text-gray-500">Created</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Link 
              href={`/admin/products/${product.id}/edit`}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Edit Details
            </Link>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              
              <Link href={`/products/${product.id}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View Live
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{product.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}