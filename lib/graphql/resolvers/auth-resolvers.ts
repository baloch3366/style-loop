import crypto from 'crypto'; //  Added for randomBytes
import { GraphQLError } from "graphql";
import User from "@/lib/models/user-model";
import Product from "@/lib/models/products-model";
import Category from "@/lib/models/categories-models";
import { logger } from "@/lib/logger";
import {
  registerInputSchema,
  userUpdateInputSchema,
  userRoleSchema,
  paginationInputSchema
} from "@/types/validation";
import type { 
  Resolvers,
  User as UserType,
  UserList,
  PaginationInfo,
  AuthResponse,
  DashboardStats,
} from "@/lib/graphql/generated/resolvers-types";
import type { GraphQLContext } from "@/lib/context";
import { UserRole } from "@/lib/graphql/generated/resolvers-types";
import bcrypt from "bcryptjs";
import { sendResetPasswordEmail } from "@/lib/email/sendOrderConfirmationEmail";

// Helper function to transform product for dashboard
const transformProductForDashboard = (product: any) => {
  if (!product) return null;
  
  return {
    __typename: 'Product' as const,
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription || null,
    price: product.price,
    category: {
      __typename: 'Category' as const,
      id: product.category?._id?.toString() || product.category?.toString() || '',
      name: product.category?.name || 'Unknown',
      slug: product.category?.slug || '',
      description: product.category?.description || null,
      image: product.category?.image || null,
      parent: null, // Dashboard doesn't need parent
      productCount: product.category?.productCount || 0,
      isActive: product.category?.isActive !== false,
      createdAt: product.category?.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.category?.updatedAt?.toISOString() || new Date().toISOString(),
    },
    sku: product.sku || '',
    images: product.images ? {
      main: product.images.main || null,
      thumbnail: product.images.thumbnail || null,
      gallery: product.images.gallery || []
    } : null,
    inventory: product.inventory || 0,
    totalSold: product.totalSold || 0, 
    tags: product.tags || null,
    featured: product.featured || false,
    status: product.status || 'DRAFT',
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
};

export const authResolvers: Resolvers<GraphQLContext> = {
  Query: {
    me: async (_, __, context): Promise<UserType> => {
      try {
        if (!context.userId) {
          throw new GraphQLError("Not authenticated");
        }

        const user = await User.findById(context.userId);
        if (!user) {
          throw new GraphQLError("User not found");
        }

        if (!user.isActive) {
          throw new GraphQLError("Account is deactivated");
        }

        return {
          __typename: 'User',
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          image: user.image || null,
          isActive: user.isActive,
          lastLogin: user.lastLogin?.toISOString() || null,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      } catch (error: any) {
        logger.error("Error fetching user profile:", error);
        throw new GraphQLError(error.message || "Failed to fetch user profile");
      }
    },

    users: async (_, args, context): Promise<UserList> => {
      try {
        if (!context.isAdmin) {
          throw new GraphQLError("Not authorized");
        }

        const { role, isActive, pagination } = args;
        
        const validatedPagination = pagination ? paginationInputSchema.parse(pagination) : { page: 1, limit: 20 };
        const page = validatedPagination.page;
        const limit = validatedPagination.limit;
        const skip = (page - 1) * limit;

        const query: any = {};
        if (role) {
          try {
            query.role = userRoleSchema.parse(role);
          } catch (error) {
            throw new GraphQLError("Invalid user role");
          }
        }
        if (isActive !== undefined) query.isActive = isActive;

        const [items, total] = await Promise.all([
          User.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .select('-password'),
          User.countDocuments(query),
        ]);

        const userItems: UserType[] = items.map(user => ({
          __typename: 'User',
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          image: user.image || null,
          isActive: user.isActive,
          lastLogin: user.lastLogin?.toISOString() || null,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }));

        const paginationInfo: PaginationInfo = {
          __typename: 'PaginationInfo',
          total, 
          page, 
          limit,
          totalPages: Math.ceil(total / limit)
        };

        return {
          __typename: 'UserList',
          items: userItems,
          pagination: paginationInfo,
        };
      } catch (error: any) {
        logger.error("Error fetching users:", error);
        if (error.name === 'ZodError') {
          throw new GraphQLError(`Invalid parameters: ${error.errors.map((e: any) => e.message).join(', ')}`);
        }
        throw new GraphQLError(error.message || "Failed to fetch users");
      }
    },

    user: async (_, args, context): Promise<UserType | null> => {
      try {
        if (!context.isAdmin) {
          throw new GraphQLError("Not authorized");
        }

        const user = await User.findById(args.id).select('-password');
        if (!user) {
          return null;
        }

        return {
          __typename: 'User',
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          image: user.image || null,
          isActive: user.isActive,
          lastLogin: user.lastLogin?.toISOString() || null,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      } catch (error: any) {
        logger.error("Error fetching user:", error);
        throw new GraphQLError(error.message || "Failed to fetch user");
      }
    },

    dashboardStats: async (_, __, context): Promise<DashboardStats> => {
      try {
        if (!context.userId) {
          throw new GraphQLError("Not authenticated");
        }

        const [
          totalProducts,
          activeProducts,
          featuredProducts,
          lowInventory,
          totalCategories,
          recentProducts
        ] = await Promise.all([
          Product.countDocuments({}),
          Product.countDocuments({ status: 'ACTIVE' }),
          Product.countDocuments({ featured: true }),
          Product.countDocuments({ inventory: { $lt: 10 } }),
          Category.countDocuments({}),
          Product.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('category')
            .lean()
        ]);

        return {
          __typename: 'DashboardStats',
          totalProducts,
          activeProducts,
          featuredProducts,
          lowInventory,
          totalCategories,
          recentProducts: recentProducts
            .map(transformProductForDashboard)
            .filter((product): product is NonNullable<ReturnType<typeof transformProductForDashboard>> => product !== null)
        };
      } catch (error: any) {
        logger.error("Error fetching dashboard stats:", error);
        throw new GraphQLError(error.message || "Failed to fetch dashboard stats");
      }
    },
  },

  Mutation: {
    register: async (_, args): Promise<AuthResponse> => {
      try {
        const validatedInput = registerInputSchema.parse(args.input);
        const { name, email, password } = validatedInput;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new GraphQLError("Email already registered");
        }

        const user = await User.create({
          name,
          email,
          password,
          role: "USER",
        });

        logger.info(`New user registered: ${user.email}`);

        const userData: UserType = {
          __typename: 'User',
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          image: user.image || null,
          isActive: user.isActive,
          lastLogin: user.lastLogin?.toISOString() || null,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };

        return {
          __typename: 'AuthResponse',
          success: true,
          message: "Registration successful. Please login.",
          user: userData,
        };
      } catch (error: any) {
        logger.error("Registration error:", error);
        if (error.code === 11000) {
          throw new GraphQLError("Email already registered");
        }
        if (error.name === 'ZodError') {
          throw new GraphQLError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`);
        }
        throw new GraphQLError(error.message || "Registration failed");
      }
    },

    updateProfile: async (_, args, context): Promise<UserType> => {
      try {
        if (!context.userId) {
          throw new GraphQLError("Not authenticated");
        }

        const validatedInput = userUpdateInputSchema.parse(args.input);

        const user = await User.findByIdAndUpdate(
          context.userId,
          { ...validatedInput, updatedAt: new Date() },
          { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
          throw new GraphQLError("User not found");
        }

        logger.info(`User profile updated: ${user.email}`);

        return {
          __typename: 'User',
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          image: user.image || null,
          isActive: user.isActive,
          lastLogin: user.lastLogin?.toISOString() || null,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      } catch (error: any) {
        logger.error("Error updating profile:", error);
        if (error.name === 'ZodError') {
          throw new GraphQLError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`);
        }
        throw new GraphQLError(error.message || "Failed to update profile");
      }
    },

    updateUserRole: async (_, args, context): Promise<UserType> => {
      try {
        if (!context.isAdmin) {
          throw new GraphQLError("Not authorized");
        }

        const validatedRole = userRoleSchema.parse(args.role);

        const user = await User.findByIdAndUpdate(
          args.userId,
          { role: validatedRole, updatedAt: new Date() },
          { new: true }
        ).select('-password');

        if (!user) {
          throw new GraphQLError("User not found");
        }

        logger.info(`User role updated: ${user.email} to ${args.role} by admin ${context.userId}`);

        return {
          __typename: 'User',
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          image: user.image || null,
          isActive: user.isActive,
          lastLogin: user.lastLogin?.toISOString() || null,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      } catch (error: any) {
        logger.error("Error updating user role:", error);
        if (error.name === 'ZodError') {
          throw new GraphQLError(`Invalid role: ${error.errors.map((e: any) => e.message).join(', ')}`);
        }
        throw new GraphQLError(error.message || "Failed to update user role");
      }
    },

    deleteUser: async (_, args, context): Promise<boolean> => {
      try {
        if (!context.isAdmin) {
          throw new GraphQLError("Not authorized");
        }

        if (args.userId === context.userId) {
          throw new GraphQLError("Cannot delete your own account");
        }

        const user = await User.findByIdAndDelete(args.userId);
        if (!user) {
          throw new GraphQLError("User not found");
        }

        logger.info(`User deleted: ${user.email} by admin ${context.userId}`);

        return true;
      } catch (error: any) {
        logger.error("Error deleting user:", error);
        throw new GraphQLError(error.message || "Failed to delete user");
      }
    },

    toggleUserStatus: async (_, args, context): Promise<UserType> => {
      try {
        if (!context.isAdmin) {
          throw new GraphQLError("Not authorized");
        }

        if (args.userId === context.userId && !args.isActive) {
          throw new GraphQLError("Cannot deactivate your own account");
        }

        const user = await User.findByIdAndUpdate(
          args.userId,
          { isActive: args.isActive, updatedAt: new Date() },
          { new: true }
        ).select('-password');

        if (!user) {
          throw new GraphQLError("User not found");
        }

        logger.info(`User status updated: ${user.email} to ${args.isActive ? 'active' : 'inactive'} by admin ${context.userId}`);

        return {
          __typename: 'User',
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          image: user.image || null,
          isActive: user.isActive,
          lastLogin: user.lastLogin?.toISOString() || null,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      } catch (error: any) {
        logger.error("Error toggling user status:", error);
        throw new GraphQLError(error.message || "Failed to update user status");
      }
    },
    
    requestPasswordReset: async (_: any, { email }: { email: string }) => {
        console.log('🔍 requestPasswordReset called with email:', email);
      try {
        const user = await User.findOne({ email });
        if (!user) {
           console.log('⚠️ User not found, returning true (no email sent)');
          return true; 
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        await sendResetPasswordEmail(email, token);

        return true;
      } catch (error) {
        console.error('Request password reset error:', error);
        return true; // Always return true to avoid email enumeration
      }
    },

    resetPassword: async (_: any, { token, newPassword }: { token: string; newPassword: string }) => {
      try {
        const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
          throw new Error('Invalid or expired reset token');
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return true;
      } catch (error) {
        console.error('Reset password error:', error);
        throw new Error('Unable to reset password');
      }
    },
  },
};