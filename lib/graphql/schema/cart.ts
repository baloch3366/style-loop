import { gql } from 'graphql-tag';

export const cartTypes = gql`
  type CartItem {
    productId: ID!
    quantity: Int!
    name: String!
    price: Float!
    image: String
  }

  type Cart {
    id: ID!
    userId: ID!
    items: [CartItem!]!
    updatedAt: DateTime!
  }

  input AddToCartInput {
    productId: ID!
    quantity: Int!
  }

  input UpdateCartItemInput {
    productId: ID!
    quantity: Int!
  }

  extend type Query {
    cart: Cart
  }

  extend type Mutation {
    addToCart(input: AddToCartInput!): Cart!
    removeFromCart(productId: ID!): Cart!
    updateCartItem(input: UpdateCartItemInput!): Cart!
    clearCart: Cart!
  }
`;