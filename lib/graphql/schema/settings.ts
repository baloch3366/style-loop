import { gql } from 'graphql-tag';

export const settingsTypes = gql`
  type StoreSettings {
    id: ID!
    storeName: String!
    storeEmail: String!
    storePhone: String!
    address: Address
    socialLinks: SocialLinks
    currency: String!
    taxRate: Float!
    freeShippingThreshold: Float!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Address {
    street: String
    city: String
    state: String
    zip: String
    country: String
  }

  type SocialLinks {
    facebook: String
    twitter: String
    instagram: String
    linkedin: String
  }

  input AddressInput {
    street: String
    city: String
    state: String
    zip: String
    country: String
  }

  input SocialLinksInput {
    facebook: String
    twitter: String
    instagram: String
    linkedin: String
  }

  input UpdateStoreSettingsInput {
    storeName: String
    storeEmail: String
    storePhone: String
    address: AddressInput
    socialLinks: SocialLinksInput
    currency: String
    taxRate: Float
    freeShippingThreshold: Float
  }

  extend type Query {
    storeSettings: StoreSettings!
  }

  extend type Mutation {
    updateStoreSettings(input: UpdateStoreSettingsInput!): StoreSettings!
  }
`;