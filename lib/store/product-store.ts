import { create } from 'zustand';
import type { ProductCardFieldsFragment, ProductDetailsFieldsFragment } from '@/lib/graphql/generated/graphql';

interface ProductStore {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedProduct: ProductCardFieldsFragment | null; 
  selectedProductDetails: ProductDetailsFieldsFragment | null; 
  setCreateModalOpen: (open: boolean) => void;
  setEditModalOpen: (open: boolean) => void;
  setDeleteModalOpen: (open: boolean) => void;
  setSelectedProduct: (product: ProductCardFieldsFragment | null) => void;
  setSelectedProductDetails: (product: ProductDetailsFieldsFragment | null) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  selectedProduct: null,
  selectedProductDetails: null,
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setEditModalOpen: (open) => set({ isEditModalOpen: open }),
  setDeleteModalOpen: (open) => set({ isDeleteModalOpen: open }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedProductDetails: (details) => set({ selectedProductDetails: details }),
}));