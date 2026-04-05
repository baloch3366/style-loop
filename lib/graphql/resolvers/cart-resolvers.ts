import Cart from '@/lib/models/cart-model';
import Product from '@/lib/models/products-model';
import type { GraphQLContext } from '@/lib/context';

// Helper to transform a cart document to GraphQL type
const transformCart = (cart: any) => ({
  id: cart._id.toString(),
  userId: cart.userId.toString(),
  items: cart.items.map((item: any) => ({
    productId: item.productId.toString(),
    quantity: item.quantity,
    name: item.name,
    price: item.price,
    image: item.image || null,
  })),
  updatedAt: cart.updatedAt.toISOString(),
});

export const cartResolvers = {
  Query: {
    cart: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.userId) throw new Error('Not authenticated');

      let cart = await Cart.findOne({ userId: context.userId });
      if (!cart) {
        // Create empty cart if none exists
        cart = await Cart.create({ userId: context.userId, items: [] });
      }
      return transformCart(cart);
    },
  },

  Mutation: {
    addToCart: async (_: any, { input }: any, context: GraphQLContext) => {
      if (!context.userId) throw new Error('Not authenticated');

      const { productId, quantity } = input;

      // Fetch product details
      const product = await Product.findById(productId);
      if (!product) throw new Error('Product not found');
      if (product.inventory < quantity) throw new Error('Insufficient stock');

      // Find or create cart
      let cart = await Cart.findOne({ userId: context.userId });
      if (!cart) {
        cart = await Cart.create({ userId: context.userId, items: [] });
      }

      // Check if product already in cart
      const existingItem = cart.items.find(
        (item: any) => item.productId.toString() === productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (product.inventory < newQuantity) throw new Error('Insufficient stock');
        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({
          productId: product._id,
          quantity,
          name: product.name,
          price: product.price,
          image: product.images?.thumbnail || product.images?.main || null,
        });
      }

      await cart.save();
      return transformCart(cart);
    },

    removeFromCart: async (_: any, { productId }: any, context: GraphQLContext) => {
      if (!context.userId) throw new Error('Not authenticated');

      const cart = await Cart.findOne({ userId: context.userId });
      if (!cart) throw new Error('Cart not found');

      cart.items = cart.items.filter(
        (item: any) => item.productId.toString() !== productId
      );
      await cart.save();
      return transformCart(cart);
    },

    updateCartItem: async (_: any, { input }: any, context: GraphQLContext) => {
      if (!context.userId) throw new Error('Not authenticated');

      const { productId, quantity } = input;
      if (quantity < 1) throw new Error('Quantity must be at least 1');

      const cart = await Cart.findOne({ userId: context.userId });
      if (!cart) throw new Error('Cart not found');

      const item = cart.items.find((i: any) => i.productId.toString() === productId);
      if (!item) throw new Error('Item not in cart');

      // Re‑fetch product to check stock
      const product = await Product.findById(productId);
      if (!product) throw new Error('Product not found');
      if (product.inventory < quantity) throw new Error('Insufficient stock');

      item.quantity = quantity;
      await cart.save();
      return transformCart(cart);
    },

    clearCart: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.userId) throw new Error('Not authenticated');

      const cart = await Cart.findOne({ userId: context.userId });
      if (!cart) throw new Error('Cart not found');

      cart.items = [];
      await cart.save();
      return transformCart(cart);
    },
  },
};