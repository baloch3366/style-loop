import { gql } from 'graphql-tag';

export const paginationTypes = gql`
  type PaginationInfo {
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input PaginationInput {
    page: Int
    limit: Int
  }
`;