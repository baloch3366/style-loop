import { gql } from 'graphql-tag';

export const userTypes = gql`
  enum UserRole {
    USER
    ADMIN
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    image: String
    isActive: Boolean!
    lastLogin: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UserList {
    items: [User!]!
    pagination: PaginationInfo!
  }

  type AuthResponse {
    success: Boolean!
    message: String!
    user: User!
  }

  input UserUpdateInput {
    name: String
    email: String
    image: String
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  extend type Query {
    me: User
    users(role: UserRole, isActive: Boolean, pagination: PaginationInput): UserList!
    user(id: ID!): User
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthResponse!
    updateProfile(input: UserUpdateInput!): User!
    updateUserRole(userId: ID!, role: UserRole!): User!
    deleteUser(userId: ID!): Boolean!
    toggleUserStatus(userId: ID!, isActive: Boolean!): User!
    requestPasswordReset(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
  }
`;