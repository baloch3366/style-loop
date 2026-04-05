import { gql } from '@apollo/client';

// Lightweight fragment for dropdown filters (only what's needed)
export const CATEGORY_FILTER_FRAGMENT = gql`
  fragment CategoryFilterFields on Category {
    id
    name
    productCount
    isActive         
  }
`;

// Card/List fragment (for category listings)
export const CATEGORY_CARD_FRAGMENT = gql`
  fragment CategoryCardFields on Category {
    id
    name
    slug
    description
    image
    productCount
    isActive
    createdAt
    updatedAt
    parent {
      id
      name
    }
  }
`;

// Full details fragment (for single category page)
export const CATEGORY_DETAILS_FRAGMENT = gql`
  fragment CategoryDetailsFields on Category {
    id
    name
    slug
    description
    image
    productCount
    isActive
    createdAt
    updatedAt
    parent {
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