import { gql } from '@apollo/client';

export const PRODUCT_CARD_FRAGMENT = gql`
  fragment ProductCardFields on Product {
    id
    name
    price
    sku
    inventory
    shortDescription
    featured
    status
    totalSold
    createdAt
    images {
      thumbnail
      main
    }
    category {
      id
      name
      slug
    }
  }
`;

export const PRODUCT_DETAILS_FRAGMENT = gql`
  fragment ProductDetailsFields on Product {
    id
    name
    description
    shortDescription
    price
    sku
    inventory
    tags
    featured
    status
    totalSold
    createdAt
    updatedAt
    images {
      main
      thumbnail
      gallery
    }
    category {
      id
      name
      slug
      description
      image
      productCount
      isActive
      createdAt
      updatedAt
    }
  }
`;