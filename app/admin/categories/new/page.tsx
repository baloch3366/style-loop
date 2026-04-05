'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  CreateCategoryDocument,
  GetCategoriesDocument,
  GetCategoriesQuery,  // ✅ import the generated query type
} from '@/lib/graphql/generated/graphql';
import type { CategoryCardFieldsFragment } from '@/lib/graphql/generated/graphql';

// Remove slug from schema – server will generate it
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parent: z.string().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ add the generic type to useQuery
  const { data: categoriesData, loading: categoriesLoading } = useQuery<GetCategoriesQuery>(GetCategoriesDocument, {
    variables: { pagination: { page: 1, limit: 100 } },
  });

  const categories = (categoriesData?.categories?.items as CategoryCardFieldsFragment[]) || [];

  const [createCategory] = useMutation(CreateCategoryDocument, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Category created successfully' });
      router.push('/admin/categories');
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      parent: undefined,
      isActive: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await createCategory({
        variables: {
          input: {
            name: values.name,
            description: values.description || null,
            parent: values.parent || null,
            isActive: values.isActive,
          },
        },
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optional: show loading indicator while fetching categories for parent dropdown
  if (categoriesLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="e.g., Electronics"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={4}
                placeholder="Optional description of the category"
              />
            </div>

            {/* Parent Category */}
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category</Label>
              <Select
                value={watch('parent') || ''}
                onValueChange={(value) => {
                  if (value === '__none__') {
                    setValue('parent', undefined);
                  } else {
                    setValue('parent', value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {categories
                    .filter((cat) => !cat.parent) // only top-level as parents (optional)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active switch */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div>
                <Label className="font-semibold">Active</Label>
                <p className="text-sm text-gray-500">
                  Inactive categories are hidden from customers.
                </p>
              </div>
              <Switch
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Category
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}