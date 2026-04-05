'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, 
  Plus, 
  X, 
  Image as ImageIcon, 
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';

// ✅ GraphQL imports – from generated types, using fragments
import { 
  UpdateProductDocument,
  GetCategoriesForFilterDocument,      // 👈 lightweight fragment
  GetProductDocument, 
  GetProductQuery,                // 👈 uses PRODUCT_DETAILS_FRAGMENT
  CategoryFilterFieldsFragment,
  ProductDetailsFieldsFragment,
  GetCategoriesForFilterQuery
} from '@/lib/graphql/generated/graphql';

// Zod imports
import {
  ProductUpdateInput,
  validateProductUpdate,
  toGraphQLProductUpdateInput,
  type ProductStatus as ZodProductStatus,
} from '@/types/validation';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const productId = params.id as string;
  
  const [updateProduct, { loading: updating }] = useMutation(UpdateProductDocument);
  
  // ✅ Use lightweight fragment query for categories (only id, name, isActive)
  const { data: productData, loading: productLoading, error: productError } = useQuery<GetProductQuery>(
  GetProductDocument,
  {
    variables: { id: productId },
    skip: !productId,
  }
);

  
  // ✅ GetProductDocument already uses PRODUCT_DETAILS_FRAGMENT
 const { data: categoriesData, loading: categoriesLoading } = useQuery<GetCategoriesForFilterQuery>(
  GetCategoriesForFilterDocument,
  {
    variables: {
      pagination: { page: 1, limit: 100 },
      onlyActive: true,
    },
  }
);

  
  const [formData, setFormData] = useState<ProductUpdateInput>({});
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // ✅ Typed categories from fragment
  const categories = (categoriesData?.categories?.items as CategoryFilterFieldsFragment[]) || [];

  // Initialize form when product data is loaded
  useEffect(() => {
    if (productData?.product) {
      const product = productData.product as ProductDetailsFieldsFragment;
      
      // Get category ID
      const categoryId = typeof product.category === 'object' 
        ? product.category.id 
        : product.category || '';
      
      // Get current tags
      const currentTags = Array.isArray(product.tags) ? product.tags : [];
      
      // Get images
      const currentImages = product.images || {};
      
      const initialFormData = {
        name: product.name || undefined,
        description: product.description || undefined,
        shortDescription: product.shortDescription || undefined,
        price: product.price || undefined,
        category: categoryId || undefined,
        sku: product.sku || undefined,
        inventory: product.inventory || undefined,
        status: product.status || undefined,
        featured: product.featured || undefined,
        tags: currentTags,
        images: {
          main: currentImages.main || undefined,
          thumbnail: currentImages.thumbnail || undefined,
          gallery: currentImages.gallery || [],
        },
      };
      
      setFormData(initialFormData);
      setOriginalData(initialFormData);
      setTagInput('');
      setValidationErrors({});
    }
  }, [productData]);

  // Check for changes
  useEffect(() => {
    if (originalData && formData) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(hasChanges);
    }
  }, [formData, originalData]);

  // Helper function to update form data
  const updateFormData = <K extends keyof ProductUpdateInput>(key: K, value: ProductUpdateInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Update nested images object
  // const updateImages = (key: 'main' | 'thumbnail' | 'gallery', value: string | string[] | undefined) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     images: {
  //       ...prev.images,
  //       [key]: value,
  //     },
  //   }));
  // };
  const updateImages = (key: 'main' | 'thumbnail' | 'gallery', value: string | string[] | undefined) => {
  setFormData(prev => {
    // Ensure images object always exists with default values
    const currentImages = prev.images ?? { 
      gallery: [], 
      main: undefined, 
      thumbnail: undefined 
    };
    
    // For gallery, always store an array
    let newValue = value;
    if (key === 'gallery' && !Array.isArray(newValue)) {
      newValue = [];
    }
    
    return {
      ...prev,
      images: {
        ...currentImages,
        [key]: newValue,
      },
    };
  });
};

  // Validate form with Zod
  const validateForm = (): boolean => {
    try {
      // For update, we only validate if there are fields to update
      if (!hasChanges) {
        toast({
          title: "No Changes",
          description: "No modifications were made",
        });
        return false;
      }
      
      validateProductUpdate(formData);
      setValidationErrors({});
      return true;
    } catch (error: any) {
      const errors: Record<string, string> = {};
      
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
      } else if (error.message) {
        errors._general = error.message;
      }
      
      setValidationErrors(errors);
      
      const firstError = Object.values(errors)[0];
      toast({
        title: "Validation Error",
        description: firstError || "Please check the form for errors",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Convert to GraphQL input format
      const graphqlInput = toGraphQLProductUpdateInput(formData);
      
      await updateProduct({
        variables: { 
          id: productId, 
          input: graphqlInput 
        },
        onCompleted: () => {
          toast({ 
            title: "Success", 
            description: "Product updated successfully" 
          });
          setValidationErrors({});
          setTagInput('');
          router.push('/admin/products');
        },
        onError: (error) => {
          toast({ 
            title: "Update Failed", 
            description: error.message, 
            variant: "destructive" 
          });
        }
      });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "An unexpected error occurred", 
        variant: "destructive" 
      });
    }
  };

  // Tag handlers
  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      const currentTags = formData.tags || [];
      updateFormData('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags || [];
    updateFormData('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  // Gallery image handlers
  const addGalleryImage = () => {
    const url = prompt('Enter image URL:');
    if (url?.trim()) {
      const currentGallery = formData.images?.gallery || [];
      updateImages('gallery', [...currentGallery, url.trim()]);
    }
  };

  const removeGalleryImage = (index: number) => {
    const currentGallery = formData.images?.gallery || [];
    updateImages('gallery', currentGallery.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    if (originalData) {
      setFormData({...originalData});
      setTagInput('');
      setValidationErrors({});
      toast({
        title: "Form Reset",
        description: "All changes have been reverted"
      });
    }
  };

  const product = productData?.product as ProductDetailsFieldsFragment | undefined;

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-800">Product Not Found</h2>
          </div>
          <p className="text-red-700 mb-6">{productError?.message || "Product not found"}</p>
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with back button */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  formData.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : formData.status === 'INACTIVE'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formData.status === 'ACTIVE' && <CheckCircle className="mr-1 h-3 w-3" />}
                  {formData.status || 'Loading...'}
                </span>
                {formData.featured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-1 text-gray-600">
                Update product information. Only modified fields will be saved.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-sm text-blue-600 font-medium animate-pulse">
                ● Unsaved changes
              </span>
            )}
            <Link href={`/products/${productId}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View Live
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Current Inventory</p>
              <p className="text-xl font-bold text-gray-900">{formData.inventory || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Price</p>
              <p className="text-xl font-bold text-gray-900">
                ${typeof formData.price === 'number' ? formData.price.toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-2">
              <ImageIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Gallery Images</p>
              <p className="text-xl font-bold text-gray-900">
                {formData.images?.gallery?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-2">
              <Save className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm font-bold text-gray-900">
                {product?.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData('name', e.target.value || undefined)}
                    className={validationErrors.name ? "border-red-500" : ""}
                    placeholder="Enter product name"
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {validationErrors.name}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => updateFormData('sku', e.target.value || undefined)}
                    className={validationErrors.sku ? "border-red-500" : ""}
                    placeholder="e.g., TSH-PRM-BLK"
                  />
                  {validationErrors.sku && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {validationErrors.sku}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription || ''}
                  onChange={(e) => updateFormData('shortDescription', e.target.value || undefined)}
                  className={validationErrors.shortDescription ? "border-red-500" : ""}
                  placeholder="Brief description for product listings"
                  rows={2}
                />
                {validationErrors.shortDescription && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {validationErrors.shortDescription}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => updateFormData('description', e.target.value || undefined)}
                  className={validationErrors.description ? "border-red-500 min-h-[200px]" : "min-h-[200px]"}
                  placeholder="Detailed product description"
                  rows={4}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {validationErrors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-1 bg-green-600 rounded-full" />
              <h2 className="text-xl font-semibold">Pricing & Inventory</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    id="price"
                    value={formData.price || ''}
                    onChange={(e) => updateFormData('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={validationErrors.price ? "border-red-500 pl-8" : "pl-8"}
                    placeholder="29.99"
                  />
                </div>
                {validationErrors.price && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {validationErrors.price}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory</Label>
                <Input
                  type="number"
                  min="0"
                  id="inventory"
                  value={formData.inventory || ''}
                  onChange={(e) => updateFormData('inventory', e.target.value ? parseInt(e.target.value) : undefined)}
                  className={validationErrors.inventory ? "border-red-500" : ""}
                  placeholder="100"
                />
                {validationErrors.inventory && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {validationErrors.inventory}
                  </p>
                )}
                <div className={`text-xs mt-1 ${
                  (formData.inventory || 0) < 10 ? 'text-red-500' : 
                  (formData.inventory || 0) < 50 ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {(formData.inventory || 0) < 10 ? 'Low stock warning' : 
                   (formData.inventory || 0) < 50 ? 'Moderate stock' : 
                   'Good stock level'}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => updateFormData('category', value || undefined)}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger className={validationErrors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                        {!category.isActive && (
                          <span className="ml-2 text-xs text-gray-500">(inactive)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.category && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {validationErrors.category}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Images Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-1 bg-purple-600 rounded-full" />
              <h2 className="text-xl font-semibold">Product Images</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Main Image URL</Label>
                  <Input
                    value={formData.images?.main || ''}
                    onChange={(e) => updateImages('main', e.target.value || undefined)}
                    placeholder="https://example.com/main-image.jpg"
                    className={validationErrors['images.main'] ? "border-red-500" : ""}
                  />
                  {validationErrors['images.main'] && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {validationErrors['images.main']}
                    </p>
                  )}
                  {formData.images?.main && (
                    <div className="mt-2 relative h-32 w-32 rounded-lg overflow-hidden border">
                      <Image
                        src={formData.images.main}
                        alt="Main preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input
                    value={formData.images?.thumbnail || ''}
                    onChange={(e) => updateImages('thumbnail', e.target.value || undefined)}
                    placeholder="https://example.com/thumbnail.jpg"
                    className={validationErrors['images.thumbnail'] ? "border-red-500" : ""}
                  />
                  {validationErrors['images.thumbnail'] && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {validationErrors['images.thumbnail']}
                    </p>
                  )}
                  {formData.images?.thumbnail && (
                    <div className="mt-2 relative h-32 w-32 rounded-lg overflow-hidden border">
                      <Image
                        src={formData.images.thumbnail}
                        alt="Thumbnail preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Gallery Images</Label>
                    <p className="text-sm text-gray-500">Additional product images</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addGalleryImage}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image URL
                  </Button>
                </div>
                
                {formData.images?.gallery && formData.images.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.gallery.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                          {url ? (
                            <Image
                              src={url}
                              alt={`Gallery ${index + 1}`}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-1 rounded-full"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No gallery images</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Add images to showcase your product from different angles
                    </p>
                  </div>
                )}
                {validationErrors['images.gallery'] && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {validationErrors['images.gallery']}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-8">
          {/* Status & Featured Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-1 bg-yellow-600 rounded-full" />
              <h2 className="text-xl font-semibold">Status & Settings</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Product Status</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={(value: ZodProductStatus) =>
                    updateFormData('status', value)
                  }
                >
                  <SelectTrigger className={validationErrors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.status && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {validationErrors.status}
                  </p>
                )}
                <div className="text-sm text-gray-500 mt-2 space-y-1">
                  <p><strong>Draft:</strong> Hidden from customers</p>
                  <p><strong>Active:</strong> Visible and purchasable</p>
                  <p><strong>Inactive:</strong> Hidden but kept in system</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <Label className="font-semibold">Featured Product</Label>
                  <p className="text-sm text-gray-500 mt-1">Show in featured sections</p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured || false}
                  onCheckedChange={(checked) => updateFormData('featured', checked)}
                />
              </div>
            </div>
          </div>

          {/* Tags Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <h2 className="text-xl font-semibold">Tags & Keywords</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags && formData.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={`${tag}-${index}`}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No tags added yet</p>
                  <p className="text-sm mt-2">Tags help customers find your product</p>
                </div>
              )}
              {validationErrors.tags && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {validationErrors.tags}
                </p>
              )}
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-1 bg-gray-600 rounded-full" />
              <h2 className="text-xl font-semibold">Actions</h2>
            </div>
            
            <div className="space-y-4">
              {validationErrors._general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{validationErrors._general}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {hasChanges && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={resetForm}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Discard Changes
                  </Button>
                )}
                
                <Link href="/admin/products">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={updating || !hasChanges}
                  onClick={handleSubmit}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {hasChanges ? 'Update Product' : 'No Changes'}
                    </>
                  )}
                </Button>
                
                <Link href={`/admin/products/${productId}/delete`}>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Product
                  </Button>
                </Link>
              </div>
              
              <div className="text-xs text-gray-500 pt-4 border-t">
                <p className="font-medium mb-1">Product Information</p>
                <ul className="space-y-1">
                  <li>• Created: {product?.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</li>
                  <li>• Last Updated: {product?.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'Never'}</li>
                  <li>• Product ID: {productId}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}