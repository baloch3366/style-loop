import { gql } from 'graphql-tag';

// Import all domain‑specific type definitions
import { rootTypes } from './root';
import { scalars } from './scalars';
import { paginationTypes } from './pagination';
import { userTypes } from './auth';
import { productTypes } from './product';
import { categoryTypes } from './category';
import { orderTypes } from './order';
import { dashboardTypes } from './dashboard';
import { settingsTypes } from './settings';
import { cartTypes } from './cart';

// Combine all into one type definition
export const typeDefs = gql`
  ${rootTypes}
  ${scalars}
  ${paginationTypes}
  ${userTypes}
  ${productTypes}
  ${cartTypes}
  ${categoryTypes}
  ${orderTypes}
  ${dashboardTypes}
  ${settingsTypes}
`;