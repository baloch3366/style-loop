import { gql } from 'graphql-tag';

export const categoryTypes = gql`
  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    image: String
    parent: Category
    productCount: Int!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CategoryList {
    items: [Category!]!
    pagination: PaginationInfo!
  }

  input CategoryInput {
    name: String!
    description: String
    image: String
    parent: ID
    isActive: Boolean
  }

  input CategoryUpdateInput {
    name: String
    description: String
    image: String
    parent: ID
    isActive: Boolean
  }

  extend type Query {
    categories(pagination: PaginationInput, onlyActive: Boolean): CategoryList!
    category(id: ID!): Category
    activeCategories: [Category!]!
  }

  extend type Mutation {
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryUpdateInput!): Category!
    deleteCategory(id: ID!): Boolean!
    toggleCategoryStatus(id: ID!, isActive: Boolean!): Category!
  }
`;