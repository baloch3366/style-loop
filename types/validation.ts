
import { z } from "zod";

// Import GraphQL generated types
import type { 
  ProductStatus as GraphQLProductStatus,
  ProductImagesInput,
  ProductInput as GraphQLProductInput
} from '@/lib/graphql/generated/graphql';

/* =======================
   ENUMS & BASIC SCHEMAS
======================= */
export const productStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']);
export type ProductStatus = z.infer<typeof productStatusSchema>;

export const userRoleSchema = z.enum(['USER', 'ADMIN']);
export type UserRole = z.infer<typeof userRoleSchema>;

// Helper to convert between Zod and GraphQL ProductStatus
export const toGraphQLProductStatus = (status: ProductStatus): GraphQLProductStatus => {
  return status as GraphQLProductStatus;
};

/* =======================
   CATEGORY SCHEMAS
======================= */
const baseCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Category name is required" }),
  slug: z.string(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  productCount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().or(z.date()).transform(val => new Date(val)),
  updatedAt: z.string().or(z.date()).transform(val => new Date(val)),
});

type BaseCategoryType = z.infer<typeof baseCategorySchema>;

export const categorySchema: z.ZodType<BaseCategoryType & { parent?: BaseCategoryType | null }> = 
  baseCategorySchema.extend({
    parent: z.lazy(() => categorySchema.nullable().optional()),
  });

export type CategoryType = z.infer<typeof categorySchema>;

export const categoryInputSchema = z.object({
  name: z.string().min(1, { message: "Category name is required" }),
  description: z.string().optional(),
  image: z.string().url({ message: "Please enter a valid URL" }).optional(),
  parent: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const categoryUpdateInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parent: z.string().optional(),
  isActive: z.boolean().optional(),
}).partial();

export type CategoryUpdateInput = z.infer<typeof categoryUpdateInputSchema>;

/* =======================
   PRODUCT IMAGES SCHEMAS
======================= */
export const productImagesSchema = z.object({
  main: z.string().url({ message: "Please enter a valid URL" }).nullable().optional(),
  thumbnail: z.string().url({ message: "Please enter a valid URL" }).nullable().optional(),
  gallery: z.array(z.string().url({ message: "Please enter a valid URL" })).default([]),
});

export type ProductImagesType = z.infer<typeof productImagesSchema>;

/* =======================
   PRODUCT SCHEMAS
======================= */
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  shortDescription: z.string().nullable().optional(),
  price: z.number().min(0),
  category: categorySchema,
  sku: z.string(),
  images: productImagesSchema,
  inventory: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  status: productStatusSchema.default('DRAFT'),
  createdAt: z.string().or(z.date()).transform(val => new Date(val)),
  updatedAt: z.string().or(z.date()).transform(val => new Date(val)),
});

export type ProductType = z.infer<typeof productSchema>;

/* =======================
   PRODUCT INPUT SCHEMAS - FIXED SKU TYPE
======================= */
export const productInputSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  shortDescription: z.string().max(200, { message: "Short description must be less than 200 characters" }).nullable().optional(),
  price: z.number().min(0.01, { message: "Price must be greater than 0" }),
  category: z.string().min(1, { message: "Category is required" }),
  // ✅ FIXED: sku is optional in GraphQL, so make it optional here too
  sku: z.string().optional(),
  images: productImagesSchema,
  inventory: z.number().int().min(0, { message: "Inventory cannot be negative" }).default(0),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  status: productStatusSchema.default('DRAFT'),
});

export type ProductInput = z.infer<typeof productInputSchema>;

/* =======================
   PRODUCT UPDATE SCHEMAS
======================= */
export const productUpdateSchema = productInputSchema.partial();

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

/* =======================
   PRODUCT FILTERS SCHEMAS
======================= */
export const productFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: productStatusSchema.optional(),
  featured: z.boolean().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
});

export type ProductFilters = z.infer<typeof productFiltersSchema>;

// ------------------ Zod schema for form validation ------------------
export const shippingAddressSchema = z.object({
  street: z
    .string()
    .min(1, { message: "🏠 Street address is required" }),
  city: z
    .string()
    .min(1, { message: "🌆 City is required" }),
  state: z
    .string()
    .min(1, { message: "🗺️ State / Province is required" }),
  zip: z
    .string()
    .min(1, { message: "📮 Postal code is required" }),
  country: z
    .string()
    .min(1, { message: "🌍 Country is required" }),
});

export const checkoutFormSchema = z.object({
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.enum(['standard', 'express']),
  // paymentMethod: z.enum(['card', 'paypal', 'bank']),
  saveInfo: z.boolean().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;


/* =======================
   PAGINATION SCHEMAS
======================= */
export const paginationInputSchema = z.object({
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationInputSchema>;

export const paginationInfoSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

export type PaginationInfo = z.infer<typeof paginationInfoSchema>;

/* =======================
   AUTH SCHEMAS (LOGIN, REGISTER, etc.)
======================= */
export const loginInputSchema = z.object({
  email: z
    .string()
    .email({ message: "📧 Please enter a valid email address (e.g., name@example.com)" })
    .min(1, { message: "📧 Email is required" }),
  password: z
    .string()
    .min(6, { message: "🔐 Password must be at least 6 characters long" })
    .min(1, { message: "🔐 Password is required" }),
});

export const registerInputSchema = z.object({
  name: z
    .string()
    .min(1, { message: "👤 Your full name is required" }),
  email: z
    .string()
    .email({ message: "📧 Please enter a valid email address (e.g., name@example.com)" }),
  password: z
    .string()
    .min(6, { message: "🔐 Password must be at least 6 characters long" })
    .refine((val) => /[A-Z]/.test(val), {
      message: "🔐 Password must contain at least one uppercase letter",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "🔐 Password must contain at least one lowercase letter",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "🔐 Password must contain at least one number",
    })
    .refine((val) => /[!@#$%^&*]/.test(val), {
      message: "🔐 Password must contain at least one special character (!@#$%^&*)",
    }),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const userUpdateInputSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  image: z.string().url({ message: "Please enter a valid URL" }).optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateInputSchema>;

export const authResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: userRoleSchema,
    image: z.string().nullable().optional(),
    isActive: z.boolean(),
    lastLogin: z.string().or(z.date()).nullable().optional(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

/* =======================
   DASHBOARD STATS SCHEMAS
======================= */
export const dashboardStatsSchema = z.object({
  totalProducts: z.number().int().min(0),
  activeProducts: z.number().int().min(0),
  featuredProducts: z.number().int().min(0),
  lowInventory: z.number().int().min(0),
  totalCategories: z.number().int().min(0),
  recentProducts: z.array(productSchema).default([]),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

/* =======================
   LIST SCHEMAS
======================= */
export const productListSchema = z.object({
  items: z.array(productSchema),
  pagination: paginationInfoSchema,
});

export type ProductList = z.infer<typeof productListSchema>;

export const categoryListSchema = z.object({
  items: z.array(categorySchema),
  pagination: paginationInfoSchema,
});

export type CategoryList = z.infer<typeof categoryListSchema>;

/* =======================
   HELPER FUNCTIONS - UPDATED FOR OPTIONAL SKU
======================= */
export function toGraphQLProductInput(input: ProductInput): GraphQLProductInput {
  return {
    name: input.name,
    description: input.description,
    shortDescription: input.shortDescription || null,
    price: input.price,
    category: input.category,
    // ✅ Handle optional sku
    sku: input.sku || null,
    images: {
      main: input.images.main || null,
      thumbnail: input.images.thumbnail || null,
      gallery: input.images.gallery,
    } as ProductImagesInput,
    inventory: input.inventory,
    tags: input.tags,
    featured: input.featured,
    status: toGraphQLProductStatus(input.status),
  };
}

export function toGraphQLProductUpdateInput(input: ProductUpdateInput): any {
  const result: any = { ...input };
  
  // ✅ Handle optional fields
  if (input.sku === undefined) delete result.sku;
  else result.sku = input.sku || null;
  
  if (input.shortDescription === undefined) delete result.shortDescription;
  else result.shortDescription = input.shortDescription || null;
  
  if (input.images) {
    result.images = {
      main: input.images.main || null,
      thumbnail: input.images.thumbnail || null,
      gallery: input.images.gallery || [],
    };
  }
  
  if (input.status) {
    result.status = toGraphQLProductStatus(input.status);
  }
  
  return result;
}

/* =======================
   VALIDATOR FUNCTIONS
======================= */
export function validateProduct(data: unknown): ProductType {
  return productSchema.parse(data);
}

export function validateProductInput(data: unknown): ProductInput {
  const parsed = productInputSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Validation error:', parsed.error.issues);
    throw new Error(`Invalid product data: ${parsed.error.issues.map(e => e.message).join(', ')}`);
  }
  return parsed.data;
}

export function validateProductUpdate(data: unknown): ProductUpdateInput {
  const parsed = productUpdateSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Validation error:', parsed.error.issues);
    throw new Error(`Invalid update data: ${parsed.error.issues.map(e => e.message).join(', ')}`);
  }
  return parsed.data;
}

export function validateLoginInput(data: unknown): LoginInput {
  const parsed = loginInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid login data: ${parsed.error.issues.map(e => e.message).join(', ')}`);
  }
  return parsed.data;
}

export function validateRegisterInput(data: unknown): RegisterInput {
  const parsed = registerInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid registration data: ${parsed.error.issues.map(e => e.message).join(', ')}`);
  }
  return parsed.data;
}

// ✅ Fix for frontend validation
export function validateFrontendProduct(data: unknown): ProductInput {
  return validateProductInput(data);
}

// ✅ Transform function - UPDATED FOR OPTIONAL SKU
export function transformToProductInput(product: Partial<ProductType>): ProductInput {
  return {
    name: product.name || '',
    description: product.description || '',
    shortDescription: product.shortDescription || undefined,
    price: product.price || 0,
    category: typeof product.category === 'object' ? product.category.id : product.category || '',
    // ✅ sku can be undefined
    sku: product.sku || undefined,
    images: {
      main: product.images?.main || undefined,
      thumbnail: product.images?.thumbnail || undefined,
      gallery: product.images?.gallery || [],
    },
    inventory: product.inventory || 0,
    tags: product.tags || [],
    featured: product.featured || false,
    status: product.status || 'DRAFT',
  };
}

/* =======================
   DEFAULT VALUES - UPDATED FOR OPTIONAL SKU
======================= */
export const DEFAULT_PRODUCT_INPUT: ProductInput = {
  name: '',
  description: '',
  shortDescription: undefined,
  price: 0,
  category: '',
  sku: undefined, // ✅ Now optional
  images: {
    main: undefined,
    thumbnail: undefined,
    gallery: [],
  },
  inventory: 0,
  tags: [],
  featured: false,
  status: 'DRAFT',
};

export const DEFAULT_LOGIN_INPUT: LoginInput = {
  email: '',
  password: '',
};

export const DEFAULT_REGISTER_INPUT: RegisterInput = {
  name: '',
  email: '',
  password: '',
};

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {};

export const DEFAULT_PAGINATION: PaginationInput = {
  page: 1,
  limit: 20,
};