import { gql } from '@apollo/client';

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalProducts
      activeProducts
      featuredProducts
      lowInventory
      totalCategories
      recentProducts {
        id
        name
        price
        description       
        shortDescription 
        sku
        inventory
        status
        featured
        createdAt
        category {
          id
          name
        }
        images {
         main
        thumbnail
        gallery
        }
      }
    }
  }
`;
 
// Get revenue stats (total, daily, etc.)
export const GET_REVENUE_STATS = gql`
  query GetRevenueStats($period: String) {
    revenueStats(period: $period) {
      totalRevenue
      totalOrders
      averageOrderValue
      dailyRevenue {
        date
        amount
      }
    }
  }
`;

// Get sales analytics (product performance, etc.)
export const GET_SALES_ANALYTICS = gql`
  query GetSalesAnalytics {
    topProducts(limit: 10) {
      id
      name
      totalSold
      revenue
    }
    salesByCategory {
      category
      revenue
    }
  }
`;