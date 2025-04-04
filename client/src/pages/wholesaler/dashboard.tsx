import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import WholesalerLayout from "@/layouts/WholesalerLayout";
import StatsCard from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, DollarSign, Tag, 
  TrendingUp, ChevronRight, Eye, Download,
  FileText, Truck, Check, Clock
} from "lucide-react";
import { Order } from "@shared/schema";

export default function WholesalerDashboard() {
  // Fetch recent orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Format date for activity items
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  // Get order status badge
  const getOrderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <Check className="h-5 w-5" />
        </div>;
      case 'shipped':
        return <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <Truck className="h-5 w-5" />
        </div>;
      case 'pending':
      case 'processing':
        return <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
          <Clock className="h-5 w-5" />
        </div>;
      case 'invoice':
        return <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
          <FileText className="h-5 w-5" />
        </div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
          <ShoppingCart className="h-5 w-5" />
        </div>;
    }
  };

  // Generate recent activities based on orders
  const recentActivities = orders?.slice(0, 4).map(order => ({
    id: order.id,
    type: order.status === 'delivered' ? 'delivered' :
          order.status === 'shipped' ? 'shipped' :
          'pending',
    message: order.status === 'delivered' 
      ? `Your order #ORD-${order.id.toString().padStart(4, '0')} has been delivered.`
      : order.status === 'shipped'
      ? `Your order #ORD-${order.id.toString().padStart(4, '0')} has been shipped.`
      : `Your order #ORD-${order.id.toString().padStart(4, '0')} is being processed.`,
    date: formatDate(order.createdAt)
  }));

  return (
    <WholesalerLayout>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Orders"
          value={orders?.length ?? 0}
          icon={ShoppingCart}
          trend={{ value: "12%", isPositive: true, label: "from last month" }}
        />
        <StatsCard
          title="Pending Orders"
          value={orders?.filter(o => o.status === "pending").length ?? 0}
          icon={Clock}
          variant="warning"
          trend={{ label: "awaiting approval" }}
        />
        <StatsCard
          title="Total Spent"
          value={formatCurrency(orders?.reduce((acc, order) => acc + parseFloat(order.totalAmount.toString()), 0) ?? 0)}
          icon={DollarSign}
          variant="success"
          trend={{ value: "18%", isPositive: true, label: "from last quarter" }}
        />
        <StatsCard
          title="Pricing Tier"
          value="Premium"
          icon={Tag}
          variant="info"
          trend={{ label: "15% discount on all orders" }}
        />
      </div>

      {/* Orders and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/wholesaler/orders">
                <div className="flex items-center">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {orders.slice(0, 4).map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                          #{order.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full 
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-neutral-100 text-neutral-800'}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/wholesaler/orders/${order.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p className="mb-2">No orders found</p>
                <Button asChild>
                  <Link href="/wholesaler/catalog">
                    Browse Catalog
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-6">
                {recentActivities.map((activity, index) => (
                  <div className="flex" key={activity.id || index}>
                    <div className="flex-shrink-0 mr-4">
                      {getOrderStatusIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-neutral-800 mb-1">{activity.message}</p>
                      <p className="text-sm text-neutral-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-1 flex items-center">
                <Check className="h-5 w-5 mr-2" />
                Delivered
              </h3>
              <p className="text-2xl font-bold text-green-900">
                {orders?.filter(o => o.status === "delivered").length ?? 0}
              </p>
              <p className="text-sm text-green-700 mt-1">Complete orders</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-1 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Shipped
              </h3>
              <p className="text-2xl font-bold text-blue-900">
                {orders?.filter(o => o.status === "shipped").length ?? 0}
              </p>
              <p className="text-sm text-blue-700 mt-1">Orders in transit</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-800 mb-1 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Processing
              </h3>
              <p className="text-2xl font-bold text-yellow-900">
                {orders?.filter(o => o.status === "pending" || o.status === "approved").length ?? 0}
              </p>
              <p className="text-sm text-yellow-700 mt-1">Pending orders</p>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button size="lg" asChild>
              <Link href="/wholesaler/catalog">
                Place New Order
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </WholesalerLayout>
  );
}
