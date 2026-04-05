import { gql } from '@apollo/client';
import {
  PRODUCT_CARD_FRAGMENT,
  PRODUCT_DETAILS_FRAGMENT,
} from '../fragments/product-fragments';
import { ADMIN_PRODUCT_CARD_FRAGMENT } from '../fragments/admin-products-fragments';


/* =========================
   GET PRODUCTS (LIST)
========================= */
export const GET_PRODUCTS = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query GetProducts($filters: ProductFilters, $pagination: PaginationInput) {
    products(filters: $filters, pagination: $pagination) {
      items {
        ...ProductCardFields
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
   GET SINGLE PRODUCT
========================= */
export const GET_PRODUCT = gql`
  ${PRODUCT_DETAILS_FRAGMENT}
  query GetProduct($id: ID!) {
    product(id: $id) {
      ...ProductDetailsFields
    }
  }
`;

/* =========================
   CREATE PRODUCT
========================= */
export const CREATE_PRODUCT = gql`
  ${PRODUCT_DETAILS_FRAGMENT}
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      ...ProductDetailsFields
    }
  }
`;

/* =========================
   UPDATE PRODUCT
========================= */
export const UPDATE_PRODUCT = gql`
  ${PRODUCT_DETAILS_FRAGMENT}
  mutation UpdateProduct($id: ID!, $input: ProductUpdateInput!) {
    updateProduct(id: $id, input: $input) {
      ...ProductDetailsFields
    }
  }
`;

/* =========================
   DELETE PRODUCT
========================= */
export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

/* =========================
   SEARCH PRODUCTS
========================= */
export const SEARCH_PRODUCTS = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query SearchProducts($query: String!, $pagination: PaginationInput) {
    searchProducts(query: $query, pagination: $pagination) {
      items {
        ...ProductCardFields
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
   BEST SELLING PRODUCTS
========================= */
export const GET_BEST_SELLING_PRODUCTS = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query GetBestSellingProducts($limit: Int) {
    bestSellingProducts(limit: $limit) {
      ...ProductCardFields
    }
  }
`;

/* =========================
   NEW ARRIVALS
========================= */
export const GET_NEW_ARRIVALS = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query GetNewArrivals($limit: Int) {
    newArrivals(limit: $limit) {
      ...ProductCardFields
    }
  }
`;


export const GET_ADMIN_PRODUCTS = gql`
  ${ADMIN_PRODUCT_CARD_FRAGMENT}
  query GetAdminProducts($filters: ProductFilters, $pagination: PaginationInput) {
    products(filters: $filters, pagination: $pagination) {
      items {
        ...AdminProductCardFields
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