import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  TrendingUp,
  Star,
  AlertTriangle,
  Layers,
  Users,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStatsProps {
  stats: {
    totalProducts: number;
    activeProducts: number;
    featuredProducts: number;
    lowInventory: number;
    totalCategories: number;
    totalUsers: number;
    revenue: number;
    recentProducts: any[];
  } | null;
  loading?: boolean;
}

export default function DashboardStats({ stats, loading = false }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-blue-500",
      description: "All products in store",
      change: "+12%",
    },
    {
      title: "Active Products",
      value: stats?.activeProducts || 0,
      icon: TrendingUp,
      color: "bg-green-500",
      description: "Currently available",
      change: "+8%",
    },
    {
      title: "Featured",
      value: stats?.featuredProducts || 0,
      icon: Star,
      color: "bg-yellow-500",
      description: "Featured products",
      change: "+5%",
    },
    {
      title: "Low Inventory",
      value: stats?.lowInventory || 0,
      icon: AlertTriangle,
      color: "bg-red-500",
      description: "Below 10 units",
      change: "-3%",
    },
    {
      title: "Categories",
      value: stats?.totalCategories || 0,
      icon: Layers,
      color: "bg-purple-500",
      description: "Product categories",
      change: "+2",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-pink-500",
      description: "Registered users",
      change: "+23",
    },
    {
      title: "Revenue",
      value: `$${stats?.revenue.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      description: "Monthly revenue",
      change: "+18%",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`${stat.color} p-2 rounded-md`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            {stat.change && (
              <div className="flex items-center mt-2">
                <span className={`text-xs font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground ml-2">from last month</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}