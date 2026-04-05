import { gql } from '@apollo/client';
import { USER_CORE_FRAGMENT } from '../fragments/user-fragments';

/* =========================
   GET ME
========================= */
export const GET_ME = gql`
  ${USER_CORE_FRAGMENT}
  query GetMe {
    me {
      ...UserCoreFields
    }
  }
`;

/* =========================
   GET USERS (LIST)
========================= */
export const GET_USERS = gql`
  ${USER_CORE_FRAGMENT}
  query GetUsers(
    $role: UserRole
    $isActive: Boolean
    $pagination: PaginationInput
  ) {
    users(role: $role, isActive: $isActive, pagination: $pagination) {
      items {
        ...UserCoreFields
      }
      pagination {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

/* =========================
   GET SINGLE USER
========================= */
export const GET_USER = gql`
  ${USER_CORE_FRAGMENT}
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserCoreFields
    }
  }
`;

/* =========================
   REGISTER
========================= */
export const REGISTER = gql`
  ${USER_CORE_FRAGMENT}
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      user {
        ...UserCoreFields
      }
    }
  }
`;

/* =========================
   UPDATE PROFILE
========================= */
export const UPDATE_PROFILE = gql`
  ${USER_CORE_FRAGMENT}
  mutation UpdateProfile($input: UserUpdateInput!) {
    updateProfile(input: $input) {
      ...UserCoreFields
    }
  }
`;

/* =========================
   UPDATE USER ROLE
========================= */
export const UPDATE_USER_ROLE = gql`
  ${USER_CORE_FRAGMENT}
  mutation UpdateUserRole($userId: ID!, $role: UserRole!) {
    updateUserRole(userId: $userId, role: $role) {
      ...UserCoreFields
    }
  }
`;

/* =========================
   DELETE USER
========================= */
export const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;

/* =========================
   TOGGLE USER STATUS
========================= */
export const TOGGLE_USER_STATUS = gql`
  ${USER_CORE_FRAGMENT}
  mutation ToggleUserStatus($userId: ID!, $isActive: Boolean!) {
    toggleUserStatus(userId: $userId, isActive: $isActive) {
      ...UserCoreFields
    }
  }
`;