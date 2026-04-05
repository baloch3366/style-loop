import { gql } from '@apollo/client';

export const GET_STORE_SETTINGS = gql`
  query GetStoreSettings {
    storeSettings {
      id
      storeName
      storeEmail
      storePhone
      address {
        street
        city
        state
        zip
        country
      }
      socialLinks {
        facebook
        twitter
        instagram
        linkedin
      }
      currency
      taxRate
      freeShippingThreshold
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_STORE_SETTINGS = gql`
  mutation UpdateStoreSettings($input: UpdateStoreSettingsInput!) {
    updateStoreSettings(input: $input) {
      id
      storeName
      storeEmail
      storePhone
      address {
        street
        city
        state
        zip
        country
      }
      socialLinks {
        facebook
        twitter
        instagram
        linkedin
      }
      currency
      taxRate
      freeShippingThreshold
      updatedAt
    }
  }
`;