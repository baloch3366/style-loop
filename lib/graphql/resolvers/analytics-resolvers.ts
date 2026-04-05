import Order from '@/lib/models/order-model';
import Product from '@/lib/models/products-model';

export const analyticsResolvers = {
  Query: {
    revenueStats: async (_: any, { period }: { period: string }) => {
      // Compute start date based on period
      let startDate = new Date();
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Aggregate daily revenue
      const dailyRevenue = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: 'PAID' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            amount: { $sum: '$total' },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', amount: 1, _id: 0 } },
      ]);

      // Total revenue and orders
      const [totalStats] = await Order.aggregate([
        { $match: { status: 'PAID' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
          },
        },
      ]);

      const averageOrderValue = totalStats?.totalOrders
        ? totalStats.totalRevenue / totalStats.totalOrders
        : 0;

      return {
        totalRevenue: totalStats?.totalRevenue || 0,
        totalOrders: totalStats?.totalOrders || 0,
        averageOrderValue,
        dailyRevenue,
      };
    },

      topProducts: async (_: any, { limit = 10 }: { limit?: number }) => {
        const products = await Product.find({})
          .sort({ totalSold: -1 })
          .limit(limit)
          .select('name totalSold price')
          .lean();

        return products.map((p:any) => ({
          id: p._id.toString(),
          name: p.name,
          totalSold: p.totalSold ?? 0,      // 👈 default 0
          revenue: (p.totalSold ?? 0) * (p.price ?? 0), // 👈 safe calculation
        }));
      },

    salesByCategory: async () => {
      // Aggregate revenue by category from paid orders
      const result = await Order.aggregate([
        { $match: { status: 'PAID' } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.category',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        { $project: { category: '$category.name', revenue: 1 } },
        { $sort: { revenue: -1 } },
      ]);
      return result;
    },
  },
};