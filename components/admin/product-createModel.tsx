'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  CreateProductDocument,
  GetCategoriesForFilterDocument,
} from '@/lib/graphql/generated/graphql';
import type { CategoryFilterFieldsFragment, GetCategoriesForFilterQuery } from '@/lib/graphql/generated/graphql';
import CloudinaryUpload from '@/components/upload-cloudinary';
import { toGraphQLProductInput } from '@/types/validation'; 

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  price: z.number().positive(),
  category: z.string().min(1),
  sku: z.string().optional(),
  inventory: z.number().int().min(0),
  featured: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).default('DRAFT'),
  mainImage: z.string().optional(),
  thumbnailImage: z.string().optional(),
  galleryImages: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ProductCreateModal({
  open,
  onOpenChange,
  onSuccess,
}: ProductCreateModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoriesData } = useQuery<GetCategoriesForFilterQuery>(GetCategoriesForFilterDocument, {
    variables: { pagination: { page: 1, limit: 100 }, onlyActive: true },
  });
  const categories = (categoriesData?.categories?.items as CategoryFilterFieldsFragment[]) || [];

  const [createProduct] = useMutation(CreateProductDocument);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
      price: 0,
      category: '',
      sku: '',
      inventory: 0,
      featured: false,
      status: 'DRAFT',
      mainImage: '',
      thumbnailImage: '',
      galleryImages: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Transform form values to GraphQL ProductInput using the helper
      const input = toGraphQLProductInput({
        name: values.name,
        description: values.description,
        shortDescription: values.shortDescription,
        price: values.price,
        category: values.category,
        sku: values.sku,
        inventory: values.inventory,
        featured: values.featured,
        status: values.status,
        images: {
          main: values.mainImage,
          thumbnail: values.thumbnailImage,
          gallery: values.galleryImages,
        },
        tags: [],
      });

      await createProduct({ variables: { input } });
      toast({ title: 'Success', description: 'Product created successfully' });
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {/* Basic fields */}
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...form.register('name')} />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" {...form.register('description')} rows={4} />
            </div>
            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input id="shortDescription" {...form.register('shortDescription')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register('price', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="inventory">Inventory *</Label>
                <Input
                  id="inventory"
                  type="number"
                  {...form.register('inventory', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => form.setValue('category', value)}>
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
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...form.register('sku')} />
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="featured">Featured</Label>
              <Switch
                id="featured"
                checked={form.watch('featured')}
                onCheckedChange={(checked) => form.setValue('featured', checked)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value: any) => form.setValue('status', value)}
                defaultValue="DRAFT"
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
            </div>

            {/* Cloudinary Uploads */}
            <div className="border-t pt-4">
              <Label>Main Image</Label>
              <CloudinaryUpload
                existingUrl={form.watch('mainImage')}
                onUpload={(url) => form.setValue('mainImage', url)}
                onRemove={() => form.setValue('mainImage', '')}
                label="Upload Main Image"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Thumbnail Image</Label>
              <CloudinaryUpload
                existingUrl={form.watch('thumbnailImage')}
                onUpload={(url) => form.setValue('thumbnailImage', url)}
                onRemove={() => form.setValue('thumbnailImage', '')}
                label="Upload Thumbnail"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Gallery Images</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {form.watch('galleryImages').map((url, idx) => (
                  <div key={idx} className="relative h-20 w-20 rounded overflow-hidden border">
                    <img src={url} alt="Gallery" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => {
                        const newGallery = form.watch('galleryImages').filter((_, i) => i !== idx);
                        form.setValue('galleryImages', newGallery);
                      }}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              <CloudinaryUpload
                onUpload={(url) => {
                  const current = form.watch('galleryImages');
                  form.setValue('galleryImages', [...current, url]);
                }}
                label="Add Gallery Image"
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}