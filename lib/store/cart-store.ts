'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  GET_CART,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEM,
  CLEAR_CART,
} from '@/lib/graphql/queries/cart';

// ---------- Types ----------
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  sku?: string;
  maxQuantity?: number;
}

interface CartStore {
  items: CartItem[];
  isHydrated: boolean;
  setHydrated: () => void;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncFromServer: () => Promise<void>;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: (shipping?: number, tax?: number) => number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  getItem: (productId: string) => CartItem | undefined;

  // Injected dependencies (not persisted)
  _apolloClient: any;
  _getSession: () => any;
}

// ---------- Helpers ----------
const fromServerItem = (item: any): CartItem => ({
  id: crypto.randomUUID(),
  productId: item.productId,
  name: item.name,
  price: item.price,
  image: item.image || '/placeholder-product.jpg',
  quantity: item.quantity,
  sku: undefined,
  maxQuantity: undefined,
});

// ---------- Store Creation ----------
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),
      _apolloClient: null,
      _getSession: () => null,

      // ---------- Actions ----------
      syncFromServer: async () => {
        const client = get()._apolloClient;
        if (!client) return;
        try {
          const { data } = await client.query({ query: GET_CART });
          if (data?.cart?.items) {
            const serverItems = data.cart.items.map(fromServerItem);
            set({ items: serverItems });
          }
        } catch (error) {
          console.error('Failed to sync cart from server', error);
        }
      },

      addItem: async (item, quantity = 1) => {
        const { productId, name, price, image, sku, maxQuantity } = item;

        // Optimistic update
        set((state) => {
          const existing = state.items.find(i => i.productId === productId);
          if (existing) {
            const newQty = existing.quantity + quantity;
            if (maxQuantity && newQty > maxQuantity) throw new Error('Quantity exceeds limit');
            return {
              items: state.items.map(i =>
                i.productId === productId ? { ...i, quantity: newQty } : i
              ),
            };
          }
          const newItem: CartItem = {
            id: crypto.randomUUID(),
            productId,
            name,
            price,
            image: image || '/placeholder-product.jpg',
            quantity,
            sku,
            maxQuantity,
          };
          return { items: [...state.items, newItem] };
        });

        const session = get()._getSession?.();
        const client = get()._apolloClient;
        if (session?.user && client) {
          try {
            await client.mutate({
              mutation: ADD_TO_CART,
              variables: { input: { productId, quantity } },
            });
          } catch (error) {
            await get().syncFromServer();
            throw error;
          }
        }
      },

      removeItem: async (productId) => {
        set((state) => ({
          items: state.items.filter(i => i.productId !== productId),
        }));

        const session = get()._getSession?.();
        const client = get()._apolloClient;
        if (session?.user && client) {
          try {
            await client.mutate({
              mutation: REMOVE_FROM_CART,
              variables: { productId },
            });
          } catch (error) {
            await get().syncFromServer();
            throw error;
          }
        }
      },

      updateQuantity: async (productId, quantity) => {
        const safeQuantity = Math.max(1, quantity);
        set((state) => ({
          items: state.items.map(i =>
            i.productId === productId ? { ...i, quantity: safeQuantity } : i
          ),
        }));

        const session = get()._getSession?.();
        const client = get()._apolloClient;
        if (session?.user && client) {
          try {
            await client.mutate({
              mutation: UPDATE_CART_ITEM,
              variables: { input: { productId, quantity: safeQuantity } },
            });
          } catch (error) {
            await get().syncFromServer();
            throw error;
          }
        }
      },

      clearCart: async () => {
        set({ items: [] });

        const session = get()._getSession?.();
        const client = get()._apolloClient;
        if (session?.user && client) {
          try {
            await client.mutate({ mutation: CLEAR_CART });
          } catch (error) {
            await get().syncFromServer();
            throw error;
          }
        }
      },

      // ---------- Getters ----------
      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getTotal: (shipping = 0, tax = 0) => get().getSubtotal() + shipping + tax,
      isInCart: (productId) => get().items.some(i => i.productId === productId),
      getItemQuantity: (productId) => get().items.find(i => i.productId === productId)?.quantity ?? 0,
      getItem: (productId) => get().items.find(i => i.productId === productId),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        isHydrated: state.isHydrated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);