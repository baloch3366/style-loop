import { gql } from '@apollo/client';

export const ORDER_CORE_FIELDS = gql`
  fragment OrderCoreFields on Order {
    id
    orderNumber
    status
    subtotal
    shipping
    tax
    total
    createdAt
  }
`;

 export const ORDER_CARD_FIELDS = gql`
  fragment OrderCardFields on Order {
    id
    orderNumber
    status
    total
    createdAt
    user {
      email
    }
    guestEmail
    items {
      name
      quantity
      price
    }
  }
`;

export const ORDER_ITEM_FIELDS = gql`
  fragment OrderItemFields on OrderItem {
    productId
    name
    price
    quantity
  }
`;

export const ORDER_ADDRESS_FIELDS = gql`
  fragment OrderAddressFields on ShippingAddress {
    street
    city
    state
    zip
    country
  }
`;

export const ORDER_DETAILS_FIELDS = gql`
  ${ORDER_CORE_FIELDS}
  ${ORDER_ITEM_FIELDS}
  ${ORDER_ADDRESS_FIELDS}
  fragment OrderDetailsFields on Order {
    ...OrderCoreFields
    items {
      ...OrderItemFields
    }
    shippingAddress {
      ...OrderAddressFields
    }
  }
`;