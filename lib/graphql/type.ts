// Types that match your actual backend resolvers
export interface GraphQLCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parent?: {
    id: string;
    name: string;
  } | null;
  productCount?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GraphQLProduct {
  id: string;
  name: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  category: GraphQLCategory; // Your resolver populates category
  sku: string;
  images: {
    main?: string | null;
    thumbnail?: string | null;
    gallery: string[];
  };
  inventory: number;
  tags: string[];
  featured: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductListResponse {
  items: GraphQLProduct[];
  pagination: PaginationInfo;
}

export interface GetProductsResponse {
  products: ProductListResponse;
}

export interface GetProductResponse {
  product: GraphQLProduct;
}

export interface CategoryListResponse {
  items: GraphQLCategory[];
  pagination: PaginationInfo;
}

export interface GetCategoriesResponse {
  categories: CategoryListResponse;
}

// Input types
export interface ProductFiltersInput {
  search?: string;
  category?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
}