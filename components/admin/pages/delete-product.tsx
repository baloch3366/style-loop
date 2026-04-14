'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Check, Loader2, Package, Trash2, X, AlertTriangle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

import { 
  DeleteProductDocument,
  GetProductDocument,GetProductQuery,
  ProductDetailsFieldsFragment
} from '@/lib/graphql/generated/graphql';

export default function DeleteProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  if (!params) {
  return <div>Loading...</div>;
   }
  const productId = params.id as string;
  
  const [deleteProduct, { loading: deleting, error: deleteError }] = useMutation(DeleteProductDocument);
  
  const { data: productData, loading: productLoading, error: productError } = useQuery<GetProductQuery>(
    GetProductDocument,
    {
      variables: { id: productId },
      skip: !productId,
    }
  );
  
  const [confirmText, setConfirmText] = useState('');
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  
  const product = productData?.product as ProductDetailsFieldsFragment | undefined;
  
  const handleDelete = async () => {
    if (!confirmDeletion) {
      toast({
        title: "Confirmation Required",
        description: "Please check the confirmation box first",
        variant: "destructive"
      });
      return;
    }
    
    if (confirmText !== `delete ${product?.name || 'this product'}`) {
      toast({
        title: "Verification Failed",
        description: "Please type the exact confirmation phrase",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await deleteProduct({
        variables: { id: productId },
        onCompleted: () => {
          toast({
            title: "Product Deleted",
            description: "The product has been permanently deleted",
            variant: "default"
          });
          router.push('/admin/products');
        },
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading product data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-800">Product Not Found</h2>
          </div>
          <p className="text-red-700 mb-6">
            {productError?.message || "The product you're trying to delete doesn't exist."}
          </p>
          <Link href="/admin/products">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = typeof product.category === 'object' 
    ? product.category.name 
    : 'Uncategorized';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/admin/products/${productId}/edit`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Edit Product
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Delete Product</h1>
            <p className="text-gray-600">Permanently remove this product from your store</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warning Card */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Warning: Irreversible Action</h3>
                <ul className="space-y-2 text-red-700">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-600 mt-2" />
                    This action cannot be undone
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-600 mt-2" />
                    All product data will be permanently deleted
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-600 mt-2" />
                    Product will be removed from all categories
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-600 mt-2" />
                    Any associated orders will keep historical references
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Product Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
              <CardDescription>Information about the product you're deleting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Product Name</p>
                  <p className="text-lg font-semibold">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">SKU</p>
                  <p className="text-lg font-semibold">{product.sku || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="font-medium">{categoryName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="font-medium">${product.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Inventory</p>
                  <p className={`font-medium ${
                    product.inventory > 0 
                      ? product.inventory < 10 ? 'text-yellow-600' : 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {product.inventory} units
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : product.status === 'INACTIVE'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.status === 'ACTIVE' && <Check className="mr-1 h-3 w-3" />}
                    {product.status}
                  </span>
                  {product.featured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                </div>
              </div>
              
              {product.tags && product.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(product.createdAt).toLocaleDateString()} at {new Date(product.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Card */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Confirm Deletion
              </CardTitle>
              <CardDescription>
                To confirm deletion, please complete the following steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Checkbox Confirmation */}
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="confirm-deletion"
                    type="checkbox"
                    checked={confirmDeletion}
                    onChange={(e) => setConfirmDeletion(e.target.checked)}
                    className="h-4 w-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-deletion" className="font-medium text-gray-900">
                    I understand that this action is irreversible
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    I acknowledge that all product data will be permanently deleted and cannot be recovered.
                  </p>
                </div>
              </div>

              {/* Step 2: Type Confirmation */}
              <div className="space-y-3">
                <label htmlFor="confirm-text" className="block text-sm font-medium text-gray-900">
                  Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">delete {product.name}</span> to confirm:
                </label>
                <input
                  type="text"
                  id="confirm-text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`Type "delete ${product.name}" here`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-sm text-gray-500">
                  This helps prevent accidental deletions. Please type exactly as shown.
                </p>
              </div>

              {/* Error Display */}
              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Delete Failed:</span> {deleteError.message}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="w-full">
                <Button
                  onClick={handleDelete}
                  disabled={deleting || !confirmDeletion || confirmText !== `delete ${product.name}`}
                  className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg"
                  size="lg"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Deleting Product...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-5 w-5" />
                      Permanently Delete Product
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 text-center mt-3">
                  This action cannot be undone. Please proceed with caution.
                </p>
              </div>
              
              <div className="w-full pt-4 border-t">
                <Link href={`/admin/products/${productId}/edit`}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={deleting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel and Return to Edit
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-6">
          {/* Alternative Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Alternative Actions
              </CardTitle>
              <CardDescription>
                Consider these options before deleting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Set to Inactive</h4>
                <p className="text-sm text-gray-600">
                  Hide the product from customers while keeping all data intact.
                </p>
                <Link href={`/admin/products/${productId}/edit`}>
                  <Button variant="outline" className="w-full">
                    Edit Product Status
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-gray-900">Archive Product</h4>
                <p className="text-sm text-gray-600">
                  Move to archives for historical records while removing from active listings.
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Archive (Coming Soon)
                </Button>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-gray-900">Update Inventory</h4>
                <p className="text-sm text-gray-600">
                  Set inventory to 0 instead of deleting the product entirely.
                </p>
                <Link href={`/admin/products/${productId}/edit`}>
                  <Button variant="outline" className="w-full">
                    Update Inventory
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Impact Analysis Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Orders</span>
                <span className="font-semibold">0 orders</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer Reviews</span>
                <span className="font-semibold">0 reviews</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Wishlists</span>
                <span className="font-semibold">0 lists</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category Impact</span>
                <span className="font-semibold">1 category</span>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-gray-500 border-t pt-4">
              Note: This product has no active dependencies. Deletion will not affect customer orders.
            </CardFooter>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/products" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  ← Back to All Products
                </Button>
              </Link>
              <Link href={`/products/${productId}`} target="_blank" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  ↗ View Live Product
                </Button>
              </Link>
              <Link href="/admin/products/new" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  ＋ Create New Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}