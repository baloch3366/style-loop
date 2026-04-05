'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  UpdateProductDocument,
  GetCategoriesForFilterDocument,
} from '@/lib/graphql/generated/graphql';
import type {
  ProductDetailsFieldsFragment,
  CategoryFilterFieldsFragment,
  GetCategoriesForFilterQuery,
} from '@/lib/graphql/generated/graphql';
import CloudinaryUpload from '@/components/upload-cloudinary';
import {
  productUpdateSchema,
  toGraphQLProductUpdateInput,
  type ProductUpdateInput,
} from '@/types/validation';

interface ProductEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDetailsFieldsFragment;
  onSuccess: () => void;
}

export default function ProductEditModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductEditModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoriesData } = useQuery<GetCategoriesForFilterQuery>(
    GetCategoriesForFilterDocument,
    {
      variables: {
        pagination: { page: 1, limit: 100 },
        onlyActive: true,
      },
    }
  );

  const categories = (categoriesData?.categories?.items as CategoryFilterFieldsFragment[]) || [];
  const [updateProduct] = useMutation(UpdateProductDocument);

  const existingImages = product.images || { main: undefined, thumbnail: undefined, gallery: [] };

  const form = useForm<ProductUpdateInput>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || undefined,
      price: product.price,
      category: typeof product.category === 'object' ? product.category.id : product.category,
      sku: product.sku || undefined,
      inventory: product.inventory,
      featured: product.featured,
      status: product.status,
      images: {
        main: existingImages.main || undefined,
        thumbnail: existingImages.thumbnail || undefined,
        gallery: existingImages.gallery || [],
      },
    },
  });

  const mainImage = form.watch('images.main');
  const thumbnailImage = form.watch('images.thumbnail');
  const galleryImages = form.watch('images.gallery') || [];

  const onSubmit = async (values: ProductUpdateInput) => {
    setIsSubmitting(true);
    try {
      const graphqlInput = toGraphQLProductUpdateInput(values);
      await updateProduct({
        variables: {
          id: product.id,
          input: graphqlInput,
        },
      });
      toast({ title: 'Success', description: 'Product updated successfully' });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGalleryImage = (url: string) => {
    const current = galleryImages;
    if (!current.includes(url)) {
      form.setValue('images.gallery', [...current, url]);
    }
  };

  const removeGalleryImage = (index: number) => {
    const current = galleryImages;
    form.setValue('images.gallery', current.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register('description')} rows={4} />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input id="shortDescription" {...form.register('shortDescription')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register('price', { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="inventory">Inventory</Label>
                <Input
                  id="inventory"
                  type="number"
                  {...form.register('inventory', { valueAsNumber: true })}
                />
                {form.formState.errors.inventory && (
                  <p className="text-sm text-red-500">{form.formState.errors.inventory.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.watch('category')}
                onValueChange={(value) => form.setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...form.register('sku')} />
              {form.formState.errors.sku && (
                <p className="text-sm text-red-500">{form.formState.errors.sku.message}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="featured">Featured</Label>
              <Switch
                id="featured"
                checked={form.watch('featured') || false}
                onCheckedChange={(checked) => form.setValue('featured', checked)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value: any) => form.setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>

            {/* Cloudinary Uploads */}
            <div className="border-t pt-4">
              <Label>Main Image</Label>
              <CloudinaryUpload
                existingUrl={mainImage}
                onUpload={(url) => form.setValue('images.main', url)}
                onRemove={() => form.setValue('images.main', undefined)}
                label="Upload Main Image"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Primary product image (shown on product page)</p>
            </div>

            <div>
              <Label>Thumbnail Image</Label>
              <CloudinaryUpload
                existingUrl={thumbnailImage}
                onUpload={(url) => form.setValue('images.thumbnail', url)}
                onRemove={() => form.setValue('images.thumbnail', undefined)}
                label="Upload Thumbnail"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Small image for product listings and cards</p>
            </div>

            <div>
              <Label>Gallery Images</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {galleryImages.map((url, idx) => (
                  <div key={idx} className="relative h-20 w-20 rounded overflow-hidden border">
                    <img src={url} alt="Gallery" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              <CloudinaryUpload
                onUpload={addGalleryImage}
                label="Add Gallery Image"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Additional product images (max 10)</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}