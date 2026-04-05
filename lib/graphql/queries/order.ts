import { gql } from '@apollo/client';
import { ORDER_DETAILS_FIELDS } from '../fragments/order-fragments';
import { ORDER_CARD_FIELDS } from '../fragments/order-fragments'; 


export const GET_ORDER = gql`
  ${ORDER_DETAILS_FIELDS}
  query GetOrder($id: ID!) {
    order(id: $id) {
      ...OrderDetailsFields
    }
  }
`;

export const GET_ORDERS = gql`
  ${ORDER_CARD_FIELDS}
  query GetOrders($filters: OrderFilters, $pagination: PaginationInput) {
    orders(filters: $filters, pagination: $pagination) {
      items {
        ...OrderCardFields
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

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const CREATE_ORDER = gql`
  ${ORDER_DETAILS_FIELDS}
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      ...OrderDetailsFields
    }
  }
`;

export const GET_USER_ORDERS = gql`
  ${ORDER_CARD_FIELDS}
  query GetUserOrders($pagination: PaginationInput) {
    userOrders(pagination: $pagination) {
      items {
        ...OrderCardFields
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