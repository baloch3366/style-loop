import { orderResolvers } from './order-resolver';
import { DateTimeScalar, JSONScalar } from "./scalars";
import { authResolvers } from "./auth-resolvers";
import { productResolvers } from "./products-resolver";
import { categoryResolvers } from "./categories-resolvers";
import { analyticsResolvers } from './analytics-resolvers';
import { settingsResolvers } from './settings-resolvers';
import { cartResolvers } from './cart-resolvers';

export const resolvers = {
  DateTime: DateTimeScalar,
  JSON: JSONScalar,

  Query: {
    ...authResolvers.Query,
    ...productResolvers.Query,
    ...categoryResolvers.Query,
    ...orderResolvers.Query,
    ...analyticsResolvers.Query, 
    ...settingsResolvers.Query, 
    ...cartResolvers.Query,    
  },
  
  Mutation: {
    ...authResolvers.Mutation,
    ...productResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...settingsResolvers.Mutation,
    ...cartResolvers.Mutation,   
  },

  Order: orderResolvers.Order,  

};