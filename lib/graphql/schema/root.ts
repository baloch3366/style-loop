import { gql } from 'graphql-tag';

export const rootTypes = gql`
  type Query {
    _empty: String  
  }

  type Mutation {
    _empty: String
  }
`;