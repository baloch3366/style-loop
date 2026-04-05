import Order from "@/lib/models/order-model";
import Product from "@/lib/models/products-model";
import User from "@/lib/models/user-model";
import type { GraphQLContext } from '@/lib/graphql/context';

// ✅ Strong type for lean() results
type OrderDoc = {
  _id: any;
  status?: string;
  orderNumber?: string;
  total?: number;
  createdAt?: Date;
  userId?: string;
  guestEmail?: string;
  // add any other fields you need in resolvers
};

export const orderResolvers = {
  Query: {
    order: async (_: any, { id }: { id: string }) => {
      const order = await Order.findById(id).lean() as OrderDoc | null;
      if (!order) return null;

      return {
        ...order,
        status: order.status?.toUpperCase(),
      };
    },

    orders: async (_: any, args: any, context: GraphQLContext) => {
      if (!context.isAdmin) throw new Error('Not authorized');

      const { filters, pagination } = args;
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const skip = (page - 1) * limit;

      const query: any = {};
      if (filters?.search) {
        query.$or = [
          { orderNumber: { $regex: filters.search, $options: 'i' } },
          { guestEmail: { $regex: filters.search, $options: 'i' } },
        ];
      }
      if (filters?.status) {
        query.status = filters.status; // already uppercase from frontend
      }

      const itemsRaw = (await Order.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()) as OrderDoc[];

      const total = await Order.countDocuments(query);

      const items = itemsRaw.map(order => ({
        ...order,
        status: order.status?.toUpperCase(),
      }));

      return {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    },

    // Inside the Query object in orderResolvers
    userOrders: async (_: any, { pagination }: any, context: GraphQLContext) => {
      if (!context.userId) throw new Error('Not authenticated');
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const skip = (page - 1) * limit;
      const items = await Order.find({ userId: context.userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();
      const total = await Order.countDocuments({ userId: context.userId });
      return {
        items: items.map(order => ({ ...order, status: order.status?.toUpperCase() })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
  },

  Mutation: {
    createOrder: async (_: any, args: any, context: GraphQLContext) => {
      try {
        const productIds = args.input.items.map((i: any) => i.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        let subtotal = 0;
        const orderItems = args.input.items.map((item: any) => {
          const product = productMap.get(item.productId.toString());
          if (!product) throw new Error(`Product ${item.productId} not found`);
          subtotal += product.price * item.quantity;
          return {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
          };
        });

        const shippingCost = args.input.shippingMethod === 'express' ? 14.99 : 5.99;
        const tax = subtotal * 0.08;

        let userEmail = null;
        if (context.userId) {
          const user = await User.findById(context.userId);
          userEmail = user?.email;
        }

        const order = await Order.create({
          ...args.input,
          userId: context.userId,
          guestEmail: userEmail,
          items: orderItems,
          subtotal,
          shipping: shippingCost,
          tax,
          total: subtotal + shippingCost + tax,
          status: 'PENDING',
        });

        return order;
      } catch (error: any) {
        console.error('Error in createOrder:', error);
        throw new Error(`Order creation failed: ${error.message}`);
      }
    },

    updateOrderStatus: async (_: any, { id, status }: { id: string; status: string }, context: GraphQLContext) => {
      if (!context.isAdmin) throw new Error('Not authorized');

      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status: status.toUpperCase() },
        { new: true }
      ).lean() as OrderDoc | null;

      if (!updatedOrder) throw new Error('Order not found');

      return {
        ...updatedOrder,
        status: updatedOrder.status?.toUpperCase(),
      };
    },
  },

  Order: {
    id: (order: any) => order._id?.toString(),
    user: async (order: any) => {
      if (!order.userId) return null;
      return await User.findById(order.userId).lean();
    },
  },
};