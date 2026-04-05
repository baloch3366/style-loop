import { gql } from '@apollo/client';
import {
  CATEGORY_FILTER_FRAGMENT,
  CATEGORY_CARD_FRAGMENT,
  CATEGORY_DETAILS_FRAGMENT,
} from '../fragments/category-fragments';

/* =========================
   GET CATEGORIES (for FILTER dropdown) – lightweight
========================= */
export const GET_CATEGORIES_FOR_FILTER = gql`
  ${CATEGORY_FILTER_FRAGMENT}
  query GetCategoriesForFilter($pagination: PaginationInput, $onlyActive: Boolean) {
    categories(pagination: $pagination, onlyActive: $onlyActive) {
      items {
        ...CategoryFilterFields
      }
      pagination {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

/* =========================
   GET CATEGORIES (full card data)
========================= */
export const GET_CATEGORIES = gql`
  ${CATEGORY_CARD_FRAGMENT}
  query GetCategories($pagination: PaginationInput, $onlyActive: Boolean) {
    categories(pagination: $pagination, onlyActive: $onlyActive) {
      items {
        ...CategoryCardFields
      }
      pagination {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

/* =========================
   GET SINGLE CATEGORY
========================= */
export const GET_CATEGORY = gql`
  ${CATEGORY_DETAILS_FRAGMENT}
  query GetCategory($id: ID!) {
    category(id: $id) {
      ...CategoryDetailsFields
    }
  }
`;

/* =========================
   GET ACTIVE CATEGORIES
========================= */
export const GET_ACTIVE_CATEGORIES = gql`
  ${CATEGORY_CARD_FRAGMENT}
  query GetActiveCategories {
    activeCategories {
      ...CategoryCardFields
    }
  }
`;

/* =========================
   CREATE CATEGORY
========================= */
export const CREATE_CATEGORY = gql`
  ${CATEGORY_DETAILS_FRAGMENT}
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      ...CategoryDetailsFields
    }
  }
`;

/* =========================
   UPDATE CATEGORY
========================= */
export const UPDATE_CATEGORY = gql`
  ${CATEGORY_DETAILS_FRAGMENT}
  mutation UpdateCategory($id: ID!, $input: CategoryUpdateInput!) {
    updateCategory(id: $id, input: $input) {
      ...CategoryDetailsFields
    }
  }
`;

/* =========================
   DELETE CATEGORY
========================= */
export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

/* =========================
   TOGGLE CATEGORY STATUS
========================= */
export const TOGGLE_CATEGORY_STATUS = gql`
  ${CATEGORY_DETAILS_FRAGMENT}
  mutation ToggleCategoryStatus($id: ID!, $isActive: Boolean!) {
    toggleCategoryStatus(id: $id, isActive: $isActive) {
      ...CategoryDetailsFields
    }
  }
`;

export const GET_CATEGORIES_FOR_ADMIN_FILTER = gql`
  ${CATEGORY_FILTER_FRAGMENT}
  query GetCategoriesForAdminFilter($pagination: PaginationInput) {
    categories(pagination: $pagination, onlyActive: false) {
      items {
        ...CategoryFilterFields
      }
    }
  }
`;