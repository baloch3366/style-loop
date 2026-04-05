import { gql } from 'graphql-tag';

export const productTypes = gql`
  enum ProductStatus {
    ACTIVE
    INACTIVE
    DRAFT
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    shortDescription: String
    price: Float!
    category: Category!
    sku: String!
    images: ProductImages
    inventory: Int!
    tags: [String!]
    featured: Boolean!
    totalSold: Int!
    status: ProductStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductImages {
    main: String
    thumbnail: String
    gallery: [String!]
  }

  type ProductList {
    items: [Product!]!
    pagination: PaginationInfo!
  }

  input ProductFilters {
    search: String
    category: ID
    status: ProductStatus
    featured: Boolean
    minPrice: Float
    maxPrice: Float
  }

  input ProductInput {
    name: String!
    description: String!
    shortDescription: String
    price: Float!
    category: ID!
    sku: String
    images: ProductImagesInput
    inventory: Int!
    tags: [String!]
    featured: Boolean
    status: ProductStatus
  }

  input ProductUpdateInput {
    name: String
    description: String
    shortDescription: String
    price: Float
    category: ID
    sku: String
    images: ProductImagesInput
    inventory: Int
    tags: [String!]
    featured: Boolean
    status: ProductStatus
  }

  input ProductImagesInput {
    main: String
    thumbnail: String
    gallery: [String!]
  }

  extend type Query {
    products(filters: ProductFilters, pagination: PaginationInput): ProductList!
    product(id: ID!): Product
    productsByCategory(categoryId: ID!, pagination: PaginationInput): ProductList!
    searchProducts(query: String!, pagination: PaginationInput): ProductList!
    bestSellingProducts(limit: Int): [Product!]!
    newArrivals(limit: Int): [Product!]!
  }

  extend type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductUpdateInput!): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;