import { gql } from '@apollo/client';

export const GET_CART = gql`
  query GetCart {
    cart {
      id
      userId
      items {
        productId
        quantity
        name
        price
        image
      }
      updatedAt
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      userId
      items {
        productId
        quantity
        name
        price
        image
      }
      updatedAt
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
      id
      userId
      items {
        productId
        quantity
        name
        price
        image
      }
      updatedAt
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      id
      userId
      items {
        productId
        quantity
        name
        price
        image
      }
      updatedAt
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart {
      id
      userId
      items {
        productId
        quantity
        name
        price
        image
      }
      updatedAt
    }
  }
`;