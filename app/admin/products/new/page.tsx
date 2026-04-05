'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import Link from 'next/link';
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
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { 
  CreateProductDocument,
  GetCategoriesForFilterDocument,
  GetCategoriesForFilterQuery,   
  CategoryFilterFieldsFragment
} from '@/lib/graphql/generated/graphql';

// Zod types & helpers
import {
  ProductInput,
  DEFAULT_PRODUCT_INPUT,
  validateFrontendProduct,
  toGraphQLProductInput,
  type ProductStatus as ZodProductStatus,
} from '@/types/validation';
import CloudinaryUpload from '@/components/upload-cloudinary';

export default function CreateProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [createProduct, { loading }] = useMutation(CreateProductDocument);

  const { data: categoriesData, loading: categoriesLoading } = useQuery<GetCategoriesForFilterQuery>(
    GetCategoriesForFilterDocument,
    {
      variables: {
        pagination: { page: 1, limit: 100 },
        onlyActive: true,
      },
    }
  );

  const [formData, setFormData] = useState<ProductInput>({
    ...DEFAULT_PRODUCT_INPUT,
    status: 'DRAFT',
  });
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const categories = (categoriesData?.categories?.items as CategoryFilterFieldsFragment[]) || [];

  const updateFormData = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateImages = (
    key: 'main' | 'thumbnail' | 'gallery',
    value: string | string[] | undefined
  ) => {
    setFormData(prev => ({
      ...prev,
      images: {
        ...prev.images,
        [key]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    try {
      validateFrontendProduct(formData);
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
        title: 'Validation Error',
        description: firstError || 'Please check the form for errors',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const graphqlInput = toGraphQLProductInput(formData);
      await createProduct({
        variables: { input: graphqlInput },
        onCompleted: () => {
          toast({ title: 'Success', description: 'Product created successfully' });
          setFormData(DEFAULT_PRODUCT_INPUT);
          setTagInput('');
          setValidationErrors({});
          router.push('/admin/products');
        },
        onError: error => {
          toast({ title: 'Creation Failed', description: error.message, variant: 'destructive' });
        },
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Unexpected error', variant: 'destructive' });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateFormData('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addGalleryImage = () => {
    const url = prompt('Enter image URL:');
    if (url?.trim()) {
      updateImages('gallery', [...formData.images.gallery, url.trim()]);
    }
  };

  const removeGalleryImage = (index: number) => {
    updateImages('gallery', formData.images.gallery.filter((_, i) => i !== index));
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
              <p className="mt-1 text-gray-600">
                Add a new product to your store. Fields with * are required.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {formData.status === 'DRAFT' ? (
                <span className="inline-flex items-center text-yellow-600">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  Draft
                </span>
              ) : formData.status === 'ACTIVE' ? (
                <span className="inline-flex items-center text-green-600">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center text-red-600">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  Inactive
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
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
                    <Label htmlFor="name" className="flex items-center gap-1">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => updateFormData('name', e.target.value)}
                      className={validationErrors.name ? 'border-red-500' : ''}
                      placeholder="Enter product name"
                      required
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
                      onChange={e => updateFormData('sku', e.target.value || undefined)}
                      className={validationErrors.sku ? 'border-red-500' : ''}
                      placeholder="TSH-PRM-BLK"
                    />
                    {validationErrors.sku && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {validationErrors.sku}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Leave blank to auto-generate</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription || ''}
                    onChange={e => updateFormData('shortDescription', e.target.value || undefined)}
                    className={validationErrors.shortDescription ? 'border-red-500' : ''}
                    rows={2}
                    placeholder="Brief description for product listings and search results"
                  />
                  {validationErrors.shortDescription && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {validationErrors.shortDescription}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-1">
                    Full Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => updateFormData('description', e.target.value)}
                    className={validationErrors.description ? 'border-red-500 min-h-[200px]' : 'min-h-[200px]'}
                    placeholder="Detailed product description, features, specifications..."
                    required
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
                  <Label htmlFor="price" className="flex items-center gap-1">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      id="price"
                      value={formData.price}
                      onChange={e => updateFormData('price', parseFloat(e.target.value) || 0)}
                      className={validationErrors.price ? 'border-red-500 pl-8' : 'pl-8'}
                      required
                    />
                  </div>
                  {validationErrors.price && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {validationErrors.price}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventory" className="flex items-center gap-1">
                    Inventory <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    id="inventory"
                    value={formData.inventory}
                    onChange={e => updateFormData('inventory', parseInt(e.target.value) || 0)}
                    className={validationErrors.inventory ? 'border-red-500' : ''}
                    required
                  />
                  {validationErrors.inventory && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {validationErrors.inventory}
                    </p>
                  )}
                  <div className={`text-xs mt-1 ${
                    formData.inventory < 10 ? 'text-red-500' : 
                    formData.inventory < 50 ? 'text-yellow-500' : 
                    'text-green-500'
                  }`}>
                    {formData.inventory < 10 ? 'Low stock warning' : 
                     formData.inventory < 50 ? 'Moderate stock' : 
                     'Good stock level'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-1">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={value => updateFormData('category', value)}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                          {!cat.isActive && (
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
                    <Label>Main Image</Label>
                    <CloudinaryUpload
                      existingUrl={formData.images.main}
                      onUpload={(url) => updateImages('main', url)}
                      onRemove={() => updateImages('main', undefined)}
                      label="Upload Main Image"
                    />
                    <p className="text-xs text-gray-500">Primary product image (shown in product page)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Thumbnail Image</Label>
                    <CloudinaryUpload
                      existingUrl={formData.images.thumbnail}
                      onUpload={(url) => updateImages('thumbnail', url)}
                      onRemove={() => updateImages('thumbnail', undefined)}
                      label="Upload Thumbnail"
                    />
                    <p className="text-xs text-gray-500">Small image for product listings and cards</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label>Gallery Images</Label>
                      <p className="text-sm text-gray-500">Additional product images (max 10)</p>
                    </div>
                    <CloudinaryUpload
                      onUpload={(url) => {
                        if (formData.images.gallery.length >= 10) {
                          toast({ title: 'Limit reached', description: 'Maximum 10 gallery images allowed', variant: 'destructive' });
                          return;
                        }
                        updateImages('gallery', [...formData.images.gallery, url]);
                      }}
                      label="Add Gallery Image"
                    />
                  </div>

                  {formData.images.gallery.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No gallery images added yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Click "Add Gallery Image" to upload images from Cloudinary
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.gallery.map((url, i) => (
                        <div key={i} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={url}
                              alt={`Gallery ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-1 rounded-full"
                            onClick={() => removeGalleryImage(i)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                            {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
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
                    value={formData.status} 
                    onValueChange={(val: ZodProductStatus) => updateFormData('status', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
                    checked={formData.featured} 
                    onCheckedChange={checked => updateFormData('featured', checked)} 
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
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    onKeyDown={e => {
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

                {formData.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <div key={tag} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm">
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setFormData(DEFAULT_PRODUCT_INPUT);
                      setTagInput('');
                      setValidationErrors({});
                    }}
                  >
                    Reset Form
                  </Button>

                  <Link href="/admin/products">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Creating Product...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> 
                        Create Product
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-xs text-gray-500 pt-4 border-t">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="space-y-1">
                    <li>• Product will be saved to your catalog</li>
                    <li>• You can edit it anytime</li>
                    <li>• Set to "Active" to make it visible</li>
                    <li>• Add inventory to allow purchases</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}