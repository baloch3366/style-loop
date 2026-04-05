import { gql } from '@apollo/client';

// Fields needed for admin product list and cards
export const ADMIN_PRODUCT_CARD_FRAGMENT = gql`
  fragment AdminProductCardFields on Product {
    id
    name
    price
    sku
    inventory
    status
    featured
    createdAt
    images {
      main
      thumbnail
      gallery
    }
    category {
      id
      name
      isActive
    }
  }
`;