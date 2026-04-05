// lib/hooks/useAuthProducts.ts
import { useSession } from 'next-auth/react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GetProductsDocument,
  CreateProductDocument,
} from '@/lib/graphql/generated/graphql';
import type { ProductFilters, GetProductsQuery, CreateProductMutation } from '@/lib/graphql/generated/graphql';

interface UseAuthProductsOptions {
  filters?: ProductFilters;
  pagination?: { page?: number; limit?: number };
}

export function useAuthProducts(options?: UseAuthProductsOptions) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'ADMIN';

  // Use Apollo's useQuery with the generated document
  const { data, loading, error, refetch } = useQuery<GetProductsQuery>(
    GetProductsDocument,
    {
      variables: options,
      skip: !isAuthenticated,
      fetchPolicy: 'cache-and-network',
    }
  );

  // Use Apollo's useMutation with the generated document
  const [createProductMutation] = useMutation<CreateProductMutation>(
    CreateProductDocument,
    {
      context: {
        headers: {
          'x-requires-auth': 'true',
        },
      },
    }
  );

  const createProduct = async (input: any) => {
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    try {
      const { data: result } = await createProductMutation({
        variables: { input },
        // Update cache after creation
        update: (cache, { data: mutationData }) => {
          if (mutationData?.createProduct) {
            const existingProducts = cache.readQuery<GetProductsQuery>({
              query: GetProductsDocument,
              variables: options,
            });

            if (existingProducts?.products) {
              cache.writeQuery({
                query: GetProductsDocument,
                variables: options,
                data: {
                  products: {
                    ...existingProducts.products,
                    items: [
                      mutationData.createProduct,
                      ...existingProducts.products.items,
                    ],
                  },
                },
              });
            }
          }
        },
      });

      return result?.createProduct;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create product');
    }
  };

  return {
    products: data?.products?.items || [],
    pagination: data?.products?.pagination,
    loading: loading || status === 'loading',
    error,
    refetch,
    createProduct,
    isAuthenticated,
    isAdmin,
    user: session?.user,
  };
}