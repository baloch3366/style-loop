import { gql } from 'graphql-tag';

export const dashboardTypes = gql`
  type DashboardStats {
    totalProducts: Int!
    activeProducts: Int!
    featuredProducts: Int!
    lowInventory: Int!
    totalCategories: Int!
    recentProducts: [Product!]!
  }

  type RevenueStats {
    totalRevenue: Float!
    totalOrders: Int!
    averageOrderValue: Float!
    dailyRevenue: [DailyRevenue!]!
  }

  type DailyRevenue {
    date: String!
    amount: Float!
  }

  type TopProduct {
    id: ID!
    name: String!
    totalSold: Int!
    revenue: Float!
  }

  type CategoryRevenue {
    category: String!
    revenue: Float!
  }

  extend type Query {
    dashboardStats: DashboardStats!
    revenueStats(period: String): RevenueStats!
    topProducts(limit: Int): [TopProduct!]!
    salesByCategory: [CategoryRevenue!]!
  }
`;