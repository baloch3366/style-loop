import { GraphQLError } from "graphql";
import Category from "@/lib/models/categories-models";
import Product from "@/lib/models/products-model";
import User from "@/lib/models/user-model";
import { logger } from "@/lib/logger";
import {
  categoryInputSchema,
  categoryUpdateInputSchema,
  paginationInputSchema
} from "@/types/validation";
import type { 
  Resolvers,
  Category as CategoryType,
  CategoryList,
  PaginationInfo,
  QueryCategoriesArgs,
  QueryCategoryArgs,
  MutationCreateCategoryArgs,
  MutationUpdateCategoryArgs,
  MutationDeleteCategoryArgs,
  MutationToggleCategoryStatusArgs
} from "@/lib/graphql/generated/resolvers-types";
import type { GraphQLContext } from "@/lib/graphql/context";
import type { Types } from "mongoose";

// Interface for lean category documents
interface CategoryLean {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  productCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: Types.ObjectId | null;
}

// Interface for parent category
interface ParentCategoryLean {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  productCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Type for parent documents in circular reference checks
interface ParentDoc {
  parent?: string | null;
}

// Helper to get parent for circular reference check
async function getParent(id: string): Promise<ParentDoc | null> {
  return Category
    .findById(id)
    .select("parent")
    .lean<ParentDoc>();
}

// Circular reference checker
async function checkCircularReference(
  categoryId: string,
  parentId: string
): Promise<boolean> {
  let currentParentId: string | null = parentId;
  let depth = 0;
  const MAX_DEPTH = 100;

  while (currentParentId && depth < MAX_DEPTH) {
    depth++;
    
    if (currentParentId === categoryId) return true;

    const parentCategory = await getParent(currentParentId);
    currentParentId = parentCategory?.parent ?? null;
  }

  if (depth >= MAX_DEPTH) {
    logger.warn(`Circular reference check reached max depth for category ${categoryId}`);
    return true;
  }

  return false;
}

// Helper to convert Date to ISO string for GraphQL DateTime scalar
function formatDate(date: Date): string {
  return date.toISOString();
}

// Helper to fetch parent category only when needed
async function fetchParentCategory(parentId: string | null): Promise<CategoryType | null> {
  if (!parentId) return null;
  
  const parent = await Category.findById(parentId)
    .select('_id name slug description image productCount isActive createdAt updatedAt')
    .lean<ParentCategoryLean>();
  
  if (!parent) return null;
  
  return {
    __typename: 'Category',
    id: parent._id.toString(),
    name: parent.name,
    slug: parent.slug,
    description: parent.description ?? null,
    image: parent.image ?? null,
    productCount: parent.productCount,
    isActive: parent.isActive,
    createdAt: formatDate(parent.createdAt),
    updatedAt: formatDate(parent.updatedAt),
    parent: null,
  };
}

// Generate slug helper
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Helper to map lean category to GraphQL CategoryType
function mapLeanToCategory(cat: CategoryLean, parentMap?: Map<string, ParentCategoryLean>): CategoryType {
  const category: CategoryType = {
    __typename: 'Category',
    id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? null,
    image: cat.image ?? null,
    productCount: cat.productCount,
    isActive: cat.isActive,
    createdAt: formatDate(cat.createdAt),
    updatedAt: formatDate(cat.updatedAt),
  };

  // Handle parent
  if (cat.parent && parentMap && parentMap.has(cat.parent.toString())) {
    const parent = parentMap.get(cat.parent.toString())!;
    category.parent = {
      __typename: 'Category',
      id: parent._id.toString(),
      name: parent.name,
      slug: parent.slug,
      description: parent.description ?? null,
      image: parent.image ?? null,
      productCount: parent.productCount,
      isActive: parent.isActive,
      createdAt: formatDate(parent.createdAt),
      updatedAt: formatDate(parent.updatedAt),
      parent: null,
    };
  } else {
    category.parent = null;
  }

  return category;
}

export const categoryResolvers: Resolvers<GraphQLContext> = {
  Query: {
    categories: async (_, args: QueryCategoriesArgs, context): Promise<CategoryList> => {
      try {
        // REMOVED authentication check - categories are public
        // if (!context.userId) {
        //   throw new GraphQLError("Not authenticated");
        // }

        const { pagination, onlyActive } = args;
        
        // Validate pagination with Zod
        const validatedPagination = pagination ? paginationInputSchema.parse(pagination) : { page: 1, limit: 20 };
        const page = validatedPagination.page;
        const limit = Math.min(validatedPagination.limit, 100);
        const skip = (page - 1) * limit;

        const query: any = {};
        
        // For non-admin users or when onlyActive is true, show only active categories
        if (!context.isAdmin || onlyActive) {
          query.isActive = true;
        }

        const [items, total] = await Promise.all([
          Category.find(query)
            .skip(skip)
            .limit(limit)
            .select('_id name slug description image productCount isActive createdAt updatedAt parent')
            .sort({ name: 1 })
            .lean<CategoryLean[]>(),
          Category.countDocuments(query),
        ]);

        // Batch fetch parent categories to avoid N+1
        const parentIds = items
          .map(item => item.parent)
          .filter((parentId): parentId is Types.ObjectId => !!parentId);
        
        const parentCategories = new Map<string, ParentCategoryLean>();
        if (parentIds.length > 0) {
          const parents = await Category.find({
            _id: { $in: parentIds }
          })
          .select('_id name slug description image productCount isActive createdAt updatedAt')
          .lean<ParentCategoryLean[]>();
          
          parents.forEach(parent => {
            parentCategories.set(parent._id.toString(), parent);
          });
        }

        const categoryItems: CategoryType[] = items.map(cat => 
          mapLeanToCategory(cat, parentCategories)
        );

        const paginationInfo: PaginationInfo = {
          __typename: 'PaginationInfo',
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };

        return {
          __typename: 'CategoryList',
          items: categoryItems,
          pagination: paginationInfo,
        };
      } catch (error: any) {
        logger.error("Error fetching categories:", error);
        if (error.name === 'ZodError') {
          throw new GraphQLError(`Invalid pagination parameters: ${error.errors.map((e: any) => e.message).join(', ')}`);
        }
        throw new GraphQLError(error.message || "Failed to fetch categories");
      }
    },

    category: async (_, args: QueryCategoryArgs, context): Promise<CategoryType | null> => {
      try {
        // REMOVED authentication check - categories are public
        // if (!context.userId) {
        //   throw new GraphQLError("Not authenticated");
        // }

        const category = await Category.findById(args.id)
          .select('_id name slug description image productCount isActive createdAt updatedAt parent')
          .lean<CategoryLean>();

        if (!category) {
          return null;
        }

        // For non-admin users, don't return inactive categories
        if (!context.isAdmin && !category.isActive) {
          return null;
        }

        const categoryData: CategoryType = {
          __typename: 'Category',
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          description: category.description ?? null,
          image: category.image ?? null,
          productCount: category.productCount,
          isActive: category.isActive,
          createdAt: formatDate(category.createdAt),
          updatedAt: formatDate(category.updatedAt),
        };

        // Fetch parent only if category has one
        if (category.parent) {
          categoryData.parent = await fetchParentCategory(category.parent.toString());
        } else {
          categoryData.parent = null;
        }

        return categoryData;
      } catch (error: any) {
        logger.error("Error fetching category:", error);
        throw new GraphQLError(error.message || "Failed to fetch category");
      }
    },

    activeCategories: async (_, __, context): Promise<CategoryType[]> => {
      try {
        // REMOVED authentication check - categories are public
        // if (!context.userId) {
        //   throw new GraphQLError("Not authenticated");
        // }

        const categories = await Category.find({ isActive: true })
          .select('_id name slug description image productCount isActive createdAt updatedAt parent')
          .sort({ name: 1 })
          .lean<CategoryLean[]>();

        // Batch fetch parents
        const parentIds = categories
          .map(cat => cat.parent)
          .filter((parentId): parentId is Types.ObjectId => !!parentId);
        
        const parentCategories = new Map<string, ParentCategoryLean>();
        if (parentIds.length > 0) {
          const parents = await Category.find({
            _id: { $in: parentIds }
          })
          .select('_id name slug description image productCount isActive createdAt updatedAt')
          .lean<ParentCategoryLean[]>();
          
          parents.forEach(parent => {
            parentCategories.set(parent._id.toString(), parent);
          });
        }

        return categories.map(cat => 
          mapLeanToCategory(cat, parentCategories)
        );
      } catch (error: any) {
        logger.error("Error fetching active categories:", error);
        throw new GraphQLError(error.message || "Failed to fetch active categories");
      }
    },
  },

  Mutation: {
    createCategory: async (_, args: MutationCreateCategoryArgs, context): Promise<CategoryType> => {
      try {
        // KEEP authentication for mutations - admin only
        if (!context.userId) {
          throw new GraphQLError("Not authenticated");
        }

        const currentUser = await User.findById(context.userId);
        if (!currentUser || currentUser.role !== "ADMIN") {
          throw new GraphQLError("Not authorized");
        }

        // Validate input using Zod
        const validatedInput = categoryInputSchema.parse(args.input);
        const { name, description, parent, image, isActive = true } = validatedInput;

        const slug = generateSlug(name);

        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
          throw new GraphQLError("Category with this name already exists");
        }

        if (parent) {
          const parentCategory = await Category.findById(parent);
          if (!parentCategory) {
            throw new GraphQLError("Parent category not found");
          }
        }

        const category = await Category.create({
          name,
          slug,
          description: description ?? null,
          image: image ?? null,
          parent: parent ?? null,
          isActive,
          productCount: 0,
        });

        const categoryDoc = await Category.findById(category._id)
          .select('_id name slug description image productCount isActive createdAt updatedAt parent')
          .lean<CategoryLean>();

        if (!categoryDoc) {
          throw new GraphQLError("Failed to retrieve created category");
        }

        const categoryData: CategoryType = {
          __typename: 'Category',
          id: categoryDoc._id.toString(),
          name: categoryDoc.name,
          slug: categoryDoc.slug,
          description: categoryDoc.description ?? null,
          image: categoryDoc.image ?? null,
          productCount: categoryDoc.productCount,
          isActive: categoryDoc.isActive,
          createdAt: formatDate(categoryDoc.createdAt),
          updatedAt: formatDate(categoryDoc.updatedAt),
        };

        // Fetch parent if exists
        if (categoryDoc.parent) {
          categoryData.parent = await fetchParentCategory(categoryDoc.parent.toString());
        } else {
          categoryData.parent = null;
        }

        logger.info(`Category created: ${category.name} by user ${context.userId}`);

        return categoryData;
      } catch (error: any) {
        logger.error("Error creating category:", error);
        if (error.code === 11000) {
          throw new GraphQLError("Category with this name already exists");
        }
        if (error.name === 'ZodError') {
          throw new GraphQLError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`);
        }
        throw new GraphQLError(error.message || "Failed to create category");
      }
    },

    updateCategory: async (_, args: MutationUpdateCategoryArgs, context): Promise<CategoryType> => {
      try {
        // KEEP authentication for mutations - admin only
        if (!context.userId) {
          throw new GraphQLError("Not authenticated");
        }

        const currentUser = await User.findById(context.userId);
        if (!currentUser || currentUser.role !== "ADMIN") {
          throw new GraphQLError("Not authorized");
        }

        const { id, input } = args;
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
          throw new GraphQLError("Category not found");
        }

        // Validate input using Zod
        const validatedInput = categoryUpdateInputSchema.parse(input);

        const updateData: any = { updatedAt: new Date() };

        if (validatedInput.name !== undefined && validatedInput.name !== null && validatedInput.name !== existingCategory.name) {
          const newSlug = generateSlug(validatedInput.name);

          const existingWithSlug = await Category.findOne({
            slug: newSlug,
            _id: { $ne: id }
          });
          if (existingWithSlug) {
            throw new GraphQLError("Category with this name already exists");
          }
          
          updateData.name = validatedInput.name;
          updateData.slug = newSlug;
        }

        if (validatedInput.description !== undefined) {
          updateData.description = validatedInput.description ?? null;
        }
        if (validatedInput.image !== undefined) {
          updateData.image = validatedInput.image ?? null;
        }

        if (validatedInput.parent !== undefined) {
          if (validatedInput.parent === null) {
            updateData.parent = null;
          } else {
            const parentCategory = await Category.findById(validatedInput.parent);
            if (!parentCategory) {
              throw new GraphQLError("Parent category not found");
            }
            if (validatedInput.parent === id) {
              throw new GraphQLError("Category cannot be its own parent");
            }
            
            const isCircular = await checkCircularReference(id, validatedInput.parent);
            if (isCircular) {
              throw new GraphQLError("Circular reference detected in category hierarchy");
            }
            
            updateData.parent = validatedInput.parent;
          }
        }

        if (validatedInput.isActive !== undefined) {
          updateData.isActive = validatedInput.isActive;
        }

        const category = await Category.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        )
        .select('_id name slug description image productCount isActive createdAt updatedAt parent')
        .lean<CategoryLean>();

        if (!category) {
          throw new GraphQLError("Category not found after update");
        }

        const categoryData: CategoryType = {
          __typename: 'Category',
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          description: category.description ?? null,
          image: category.image ?? null,
          productCount: category.productCount,
          isActive: category.isActive,
          createdAt: formatDate(category.createdAt),
          updatedAt: formatDate(category.updatedAt),
        };

        // Fetch parent if exists
        if (category.parent) {
          categoryData.parent = await fetchParentCategory(category.parent.toString());
        } else {
          categoryData.parent = null;
        }

        logger.info(`Category updated: ${category.name} by user ${context.userId}`);

        return categoryData;
      } catch (error: any) {
        logger.error("Error updating category:", error);
        if (error.code === 11000) {
          throw new GraphQLError("Category with this name already exists");
        }
        if (error.name === 'ZodError') {
          throw new GraphQLError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`);
        }
        throw new GraphQLError(error.message || "Failed to update category");
      }
    },

    deleteCategory: async (_, args: MutationDeleteCategoryArgs, context): Promise<boolean> => {
      try {
        // KEEP authentication for mutations - admin only
        if (!context.userId) {
          throw new GraphQLError("Not authenticated");
        }

        const currentUser = await User.findById(context.userId);
        if (!currentUser || currentUser.role !== "ADMIN") {
          throw new GraphQLError("Not authorized");
        }

        const { id } = args;
        const category = await Category.findById(id);
        if (!category) {
          throw new GraphQLError("Category not found");
        }

        const productCount = await Product.countDocuments({ category: id });
        if (productCount > 0) {
          throw new GraphQLError(
            `Cannot delete category with ${productCount} products. Remove or reassign products first.`
          );
        }

        const subcategoryCount = await Category.countDocuments({ parent: id });
        if (subcategoryCount > 0) {
          throw new GraphQLError(
            `Cannot delete category with ${subcategoryCount} subcategories. Remove subcategories first.`
          );
        }

        await Category.findByIdAndDelete(id);
        logger.info(`Category deleted: ${category.name} by user ${context.userId}`);

        return true;
      } catch (error: any) {
        logger.error("Error deleting category:", error);
        throw new GraphQLError(error.message || "Failed to delete category");
      }
    },

    toggleCategoryStatus: async (_, args: MutationToggleCategoryStatusArgs, context): Promise<CategoryType> => {
      try {
        // KEEP authentication for mutations - admin only
        if (!context.userId) {
          throw new GraphQLError("Not authenticated");
        }

        const currentUser = await User.findById(context.userId);
        if (!currentUser || currentUser.role !== "ADMIN") {
          throw new GraphQLError("Not authorized");
        }

        const { id, isActive } = args;

        if (isActive === false) {
          await Category.updateMany(
            { parent: id },
            { isActive: false, updatedAt: new Date() }
          );
        }

        const category = await Category.findByIdAndUpdate(
          id,
          { isActive, updatedAt: new Date() },
          { new: true, runValidators: true }
        )
        .select('_id name slug description image productCount isActive createdAt updatedAt parent')
        .lean<CategoryLean>();

        if (!category) {
          throw new GraphQLError("Category not found");
        }

        const categoryData: CategoryType = {
          __typename: 'Category',
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          description: category.description ?? null,
          image: category.image ?? null,
          productCount: category.productCount,
          isActive: category.isActive,
          createdAt: formatDate(category.createdAt),
          updatedAt: formatDate(category.updatedAt),
        };

        // Fetch parent if exists
        if (category.parent) {
          categoryData.parent = await fetchParentCategory(category.parent.toString());
        } else {
          categoryData.parent = null;
        }

        logger.info(`Category status updated: ${category.name} to ${isActive ? 'active' : 'inactive'} by user ${context.userId}`);

        return categoryData;
      } catch (error: any) {
        logger.error("Error toggling category status:", error);
        throw new GraphQLError(error.message || "Failed to update category status");
      }
    },
  },
};