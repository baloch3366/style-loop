import { GraphQLError } from 'graphql';
import Product from '@/lib/models/products-model';
import Category from '@/lib/models/categories-models';
import {
  validateProductInput,
  validateProductUpdate,
  productFiltersSchema,
  paginationInputSchema,
} from '@/types/validation';
import type { GraphQLContext } from '@/lib/graphql/context';

interface ProductType {
  __typename: 'Product';
  id: string;
  name: string;
  description: string;
  shortDescription: string | null;
  price: number;
  category: any;
  sku: string;
  images: any;
  inventory: number;
  totalSold:number;
  tags: string[] | null;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductList {
  __typename: 'ProductList';
  items: ProductType[];
  pagination: {
    __typename: 'PaginationInfo';
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const transformProduct = (product: any): ProductType | null => {
  if (!product) return null;
  
  return {
    __typename: 'Product',
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription || null,
    price: product.price,
    category: product.category ? {
      __typename: 'Category',
      id: product.category._id?.toString() || product.category.toString(),
      name: product.category.name || 'Unknown',
      slug: product.category.slug || '',
      productCount: product.category.productCount || 0,
      createdAt: product.category.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.category.updatedAt?.toISOString() || new Date().toISOString(),
      isActive: product.category.isActive !== false,
    } : null,
    sku: product.sku,
    images: product.images ? {
      main: product.images.main || null,
      thumbnail: product.images.thumbnail || null,
      gallery: product.images.gallery || []
    } : null,
    inventory: product.inventory,
    totalSold: product.totalSold || 0, 
    tags: product.tags && product.tags.length > 0 ? product.tags : null,
    featured: product.featured || false,
    status: product.status || 'DRAFT',
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
};

export const productResolvers = {
  Query: {
    products: async (_: any, args: any, context: GraphQLContext): Promise<ProductList> => {
      try {
        const pagination = args.filters?.pagination || args.pagination;
        const validatedPagination = pagination ? paginationInputSchema.parse(pagination) : { page: 1, limit: 20 };
        const page = validatedPagination.page || 1;
        const limit = validatedPagination.limit || 20;
        const skip = (page - 1) * limit;
        
        const query: any = {};

        if (args.filters) {
          const validatedFilters = productFiltersSchema.parse(args.filters);
          
          if (validatedFilters.search) {
            query.$text = { $search: validatedFilters.search };
          }
          
          if (validatedFilters.category) query.category = validatedFilters.category;
          if (validatedFilters.status) query.status = validatedFilters.status;
          if (validatedFilters.featured !== undefined) query.featured = validatedFilters.featured;
          
          if (validatedFilters.minPrice !== undefined || validatedFilters.maxPrice !== undefined) {
            query.price = {};
            if (validatedFilters.minPrice !== undefined) query.price.$gte = validatedFilters.minPrice;
            if (validatedFilters.maxPrice !== undefined) query.price.$lte = validatedFilters.maxPrice;
          }
        }

        if (!context.isAdmin) {
          query.status = 'ACTIVE';
        }

        const [items, total] = await Promise.all([
          Product.find(query)
            .skip(skip)
            .limit(limit)
            .populate('category')
            .sort({ createdAt: -1 }),
          Product.countDocuments(query)
        ]);

        return {
          __typename: 'ProductList',
          items: items.map(transformProduct).filter(Boolean) as ProductType[],
          pagination: {
            __typename: 'PaginationInfo',
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        };
      } catch (error: any) {
        console.error('Error fetching products:', error);
        throw new GraphQLError('Failed to fetch products');
      }
    },

    product: async (_: any, args: any, context: GraphQLContext): Promise<ProductType | null> => {
      try {
        const product = await Product.findById(args.id).populate('category');
        
        if (!product) return null;
        if (!context.isAdmin && product.status !== 'ACTIVE') return null;

        return transformProduct(product);
      } catch (error) {
        console.error('Error fetching product:', error);
        throw new GraphQLError('Failed to fetch product');
      }
    },

    productsByCategory: async (_: any, args: any, context: GraphQLContext): Promise<ProductList> => {
      try {
        const validatedPagination = args.pagination ? paginationInputSchema.parse(args.pagination) : { page: 1, limit: 20 };
        const page = validatedPagination.page || 1;
        const limit = validatedPagination.limit || 20;
        const skip = (page - 1) * limit;

        const category = await Category.findById(args.categoryId);
        if (!category) throw new GraphQLError('Category not found');

        const query: any = { category: args.categoryId };
        if (!context.isAdmin) query.status = 'ACTIVE';

        const [items, total] = await Promise.all([
          Product.find(query)
            .skip(skip)
            .limit(limit)
            .populate('category')
            .sort({ createdAt: -1 }),
          Product.countDocuments(query)
        ]);

        return {
          __typename: 'ProductList',
          items: items.map(transformProduct).filter(Boolean) as ProductType[],
          pagination: {
            __typename: 'PaginationInfo',
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        };
      } catch (error: any) {
        console.error('Error fetching products by category:', error);
        throw new GraphQLError('Failed to fetch products');
      }
    },

    searchProducts: async (_: any, args: any, context: GraphQLContext): Promise<ProductList> => {
      try {
        const validatedPagination = args.pagination ? paginationInputSchema.parse(args.pagination) : { page: 1, limit: 20 };
        const page = validatedPagination.page || 1;
        const limit = validatedPagination.limit || 20;
        const skip = (page - 1) * limit;

        const query: any = {};
        if (args.query) {
          query.$or = [
            { name: { $regex: args.query, $options: 'i' } },
            { description: { $regex: args.query, $options: 'i' } },
            { sku: { $regex: args.query, $options: 'i' } }
          ];
        }
        
        if (!context.isAdmin) query.status = 'ACTIVE';

        const [items, total] = await Promise.all([
          Product.find(query)
            .skip(skip)
            .limit(limit)
            .populate('category')
            .sort({ createdAt: -1 }),
          Product.countDocuments(query)
        ]);

        return {
          __typename: 'ProductList',
          items: items.map(transformProduct).filter(Boolean) as ProductType[],
          pagination: {
            __typename: 'PaginationInfo',
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        };
      } catch (error: any) {
        console.error('Error searching products:', error);
        throw new GraphQLError('Failed to search products');
      }
    },

    bestSellingProducts: async (_: any, args: { limit?: number }, context: GraphQLContext) => {
  try {
    const limit = args.limit || 10;
    
    const query: any = {};
    if (!context.isAdmin) query.status = 'ACTIVE';

    const products = await Product.find(query)
      .sort({ totalSold: -1 })     
      .limit(limit)
      .populate('category');

    return products
      .map(transformProduct)
      .filter(Boolean) as ProductType[];
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    throw new GraphQLError('Failed to fetch best sellers');
  }
},

newArrivals: async (_: any, args: { limit?: number }, context: GraphQLContext) => {
  try {
    const limit = args.limit || 10;
    
    const query: any = {};
    if (!context.isAdmin) query.status = 'ACTIVE';

    const products = await Product.find(query)
      .sort({ createdAt: -1 })      //  newest first
      .limit(limit)
      .populate('category');

    return products
      .map(transformProduct)
      .filter(Boolean) as ProductType[];
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    throw new GraphQLError('Failed to fetch new arrivals');
  }
},
  },

  Mutation: {
    createProduct: async (_: any, args: any, context: GraphQLContext): Promise<ProductType> => {
      try {
        if (!context.userId || !context.isAdmin) {
          throw new GraphQLError('Not authorized');
        }

        const validatedInput = validateProductInput(args.input);
        const category = await Category.findById(validatedInput.category);
        if (!category) throw new GraphQLError('Category not found');

        const productData = {
          ...validatedInput,
          tags: validatedInput.tags || [],
          images: validatedInput.images || { main: null, thumbnail: null, gallery: [] },
          shortDescription: validatedInput.shortDescription || null,
          status: validatedInput.status || 'DRAFT'
        };

        const product = await Product.create(productData);
        
        await Category.findByIdAndUpdate(category.id, {
          $inc: { productCount: 1 }
        });

        await product.populate('category');

        return transformProduct(product)!;
      } catch (error: any) {
        console.error('Error creating product:', error);
        throw new GraphQLError(error.message || 'Failed to create product');
      }
    },

    updateProduct: async (_: any, args: any, context: GraphQLContext): Promise<ProductType> => {
      try {
        if (!context.userId || !context.isAdmin) {
          throw new GraphQLError('Not authorized');
        }

        const product = await Product.findById(args.id);
        if (!product) throw new GraphQLError('Product not found');

        const validatedInput = validateProductUpdate(args.input);

        if (validatedInput.category && validatedInput.category !== product.category.toString()) {
          await Category.findByIdAndUpdate(product.category, {
            $inc: { productCount: -1 }
          });
          
          const newCategory = await Category.findById(validatedInput.category);
          if (!newCategory) throw new GraphQLError('Category not found');
          
          await Category.findByIdAndUpdate(validatedInput.category, {
            $inc: { productCount: 1 }
          });
        }

        const updateData = {
          ...validatedInput,
          updatedAt: new Date()
        };

        const updatedProduct = await Product.findByIdAndUpdate(
          args.id,
          updateData,
          { new: true, runValidators: true }
        ).populate('category');

        if (!updatedProduct) throw new GraphQLError('Product not found');

        return transformProduct(updatedProduct)!;
      } catch (error: any) {
        console.error('Error updating product:', error);
        throw new GraphQLError(error.message || 'Failed to update product');
      }
    },

    deleteProduct: async (_: any, args: any, context: GraphQLContext): Promise<boolean> => {
      try {
        if (!context.userId || !context.isAdmin) {
          throw new GraphQLError('Not authorized');
        }

        const product = await Product.findByIdAndDelete(args.id);
        if (!product) throw new GraphQLError('Product not found');

        await Category.findByIdAndUpdate(product.category, {
          $inc: { productCount: -1 }
        });

        return true;
      } catch (error) {
        console.error('Error deleting product:', error);
        throw new GraphQLError('Failed to delete product');
      }
    }
  }
};