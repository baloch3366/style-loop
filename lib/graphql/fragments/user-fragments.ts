import { gql} from '@apollo/client';

export const USER_CORE_FRAGMENT = gql`
  fragment UserCoreFields on User {
    id
    name
    email
    role
    image
    isActive
    lastLogin
    createdAt
    updatedAt
  }
`;