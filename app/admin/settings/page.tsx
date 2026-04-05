'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  GET_STORE_SETTINGS,
  UPDATE_STORE_SETTINGS,
} from '@/lib/graphql/queries/settings';
import type {
  GetStoreSettingsQuery,
  UpdateStoreSettingsMutation,
} from '@/lib/graphql/generated/graphql';

// ✅ Better URL validation
const optionalUrl = z
  .string()
  .optional()
  .refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: 'Must be a valid URL',
  });

// Zod schema
const settingsSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  storeEmail: z.string().email('Invalid email address'),
  storePhone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }),
  socialLinks: z.object({
    facebook: optionalUrl,
    twitter: optionalUrl,
    instagram: optionalUrl,
    linkedin: optionalUrl,
  }),
  currency: z.string().min(1),
  taxRate: z.coerce.number().min(0).max(100),
  freeShippingThreshold: z.coerce.number().min(0),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();

  const { data, loading, error, refetch } =
    useQuery<GetStoreSettingsQuery>(GET_STORE_SETTINGS);

  const [updateSettings, { loading: updating }] =
    useMutation<UpdateStoreSettingsMutation>(UPDATE_STORE_SETTINGS, {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Settings updated successfully',
        });
        refetch();
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: '',
      storeEmail: '',
      storePhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      },
      socialLinks: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
      },
      currency: 'USD',
      taxRate: 8,
      freeShippingThreshold: 50,
    },
  });

  // ✅ Populate form
  useEffect(() => {
    if (data?.storeSettings) {
      const settings = data.storeSettings;

      form.reset({
        storeName: settings.storeName,
        storeEmail: settings.storeEmail,
        storePhone: settings.storePhone || '',
        address: {
          street: settings.address?.street || '',
          city: settings.address?.city || '',
          state: settings.address?.state || '',
          zip: settings.address?.zip || '',
          country: settings.address?.country || '',
        },
        socialLinks: {
          facebook: settings.socialLinks?.facebook || '',
          twitter: settings.socialLinks?.twitter || '',
          instagram: settings.socialLinks?.instagram || '',
          linkedin: settings.socialLinks?.linkedin || '',
        },
        currency: settings.currency,
        taxRate: settings.taxRate,
        freeShippingThreshold: settings.freeShippingThreshold,
      });
    }
  }, [data]); // ✅ fixed dependency

  // ✅ Typed submit
  const onSubmit: SubmitHandler<SettingsFormValues> = async (values) => {
    await updateSettings({
      variables: { input: values },
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Error loading settings: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Store Settings</h1>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="commerce">Commerce</TabsTrigger>
          </TabsList>

          {/* GENERAL */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic store details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Store Name" {...form.register('storeName')} />
                <Input type="email" placeholder="Email" {...form.register('storeEmail')} />
                <Input placeholder="Phone" {...form.register('storePhone')} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADDRESS */}
          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Street" {...form.register('address.street')} />
                <Input placeholder="City" {...form.register('address.city')} />
                <Input placeholder="State" {...form.register('address.state')} />
                <Input placeholder="ZIP" {...form.register('address.zip')} />
                <Input placeholder="Country" {...form.register('address.country')} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* SOCIAL */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Facebook URL" {...form.register('socialLinks.facebook')} />
                <Input placeholder="Twitter URL" {...form.register('socialLinks.twitter')} />
                <Input placeholder="Instagram URL" {...form.register('socialLinks.instagram')} />
                <Input placeholder="LinkedIn URL" {...form.register('socialLinks.linkedin')} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMMERCE */}
          <TabsContent value="commerce">
            <Card>
              <CardHeader>
                <CardTitle>Commerce Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Currency" {...form.register('currency')} />
                <Input type="number" placeholder="Tax %" {...form.register('taxRate')} />
                <Input type="number" placeholder="Free Shipping Threshold" {...form.register('freeShippingThreshold')} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-8">
          <Button type="submit" disabled={updating}>
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}