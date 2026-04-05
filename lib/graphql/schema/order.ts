import { gql } from 'graphql-tag';

export const orderTypes = gql`
  enum OrderStatus {
    PENDING
    PAID
    SHIPPED
    DELIVERED
    CANCELLED
  }

  type Order {
    id: ID!
    orderNumber: String!
    user: User
    guestEmail: String
    items: [OrderItem!]!
    subtotal: Float!
    shipping: Float!
    tax: Float!
    total: Float!
    status: OrderStatus!
    paymentMethod: String
    shippingAddress: ShippingAddress!
    createdAt: DateTime!
  }

  type OrderItem {
    productId: ID!
    name: String!
    price: Float!
    quantity: Int!
  }

  type ShippingAddress {
    street: String!
    city: String!
    state: String!
    zip: String!
    country: String!
  }

  type OrderList {
    items: [Order!]!
    pagination: PaginationInfo!
  }

  input OrderFilters {
    search: String
    status: OrderStatus
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    shippingMethod: String!
    shippingAddress: ShippingAddressInput!
    paymentMethod: String!
    guestEmail: String
  }

  input ShippingAddressInput {
    street: String!
    city: String!
    state: String!
    zip: String!
    country: String!
  }

  extend type Query {
    order(id: ID!): Order
    orders(filters: OrderFilters, pagination: PaginationInput): OrderList!
    userOrders(pagination: PaginationInput): OrderList!
  }

  extend type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
  }
`;