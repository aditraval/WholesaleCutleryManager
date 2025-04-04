import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AdminLayout from "@/layouts/AdminLayout";
import StatsCard from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, DollarSign, Users, Clock, 
  ArrowRight, TrendingUp, ChartBarStacked
} from "lucide-react";
import { Order, WholesalerRequest, User } from "@shared/schema";

export default function AdminDashboard() {
  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Fetch wholesaler requests
  const { data: wholesalerRequests, isLoading: requestsLoading } = useQuery<WholesalerRequest[]>({
    queryKey: ["/api/wholesaler-requests"],
  });

  // Fetch users (wholesalers)
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users", { role: "wholesaler" }],
  });

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  // Calculate total revenue
  const totalRevenue = orders?.reduce((total, order) => 
    order.status !== "cancelled" ? total + parseFloat(order.totalAmount.toString()) : total
  , 0) || 0;

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    
    const statusKey = status.toLowerCase() as keyof typeof statusClasses;
    const className = statusClasses[statusKey] || "bg-gray-100 text-gray-800";
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Dashboard Overview</h1>
        <p className="text-neutral-600">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Orders"
          value={orders?.length ?? 0}
          icon={ShoppingCart}
          trend={{ value: "24%", isPositive: true, label: "from last month" }}
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          variant="success"
          trend={{ value: "12%", isPositive: true, label: "from last quarter" }}
        />
        <StatsCard
          title="Active Wholesalers"
          value={users?.length ?? 0}
          icon={Users}
          variant="info"
          trend={{ value: "8%", isPositive: true, label: "from last month" }}
        />
        <StatsCard
          title="Pending Requests"
          value={wholesalerRequests?.filter(r => r.status === "pending").length ?? 0}
          icon={Clock}
          variant="warning"
          trend={{ value: "6", isPositive: false, label: "new since yesterday" }}
        />
      </div>

      {/* Recent Orders & Wholesaler Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                <div className="flex items-center">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
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
                      <th className="px-4 py-2 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-2 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Wholesaler</th>
                      <th className="px-4 py-2 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {orders.slice(0, 4).map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-800">
                          #{order.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                          User #{order.userId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p>No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wholesaler Requests */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Wholesaler Requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/wholesalers">
                <div className="flex items-center">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : wholesalerRequests && wholesalerRequests.filter(req => req.status === "pending").length > 0 ? (
              <div className="space-y-4">
                {wholesalerRequests
                  .filter(req => req.status === "pending")
                  .slice(0, 3)
                  .map((request) => (
                    <div key={request.id} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-neutral-800">{request.companyName}</h3>
                          <p className="text-sm text-neutral-600 mt-1">
                            {request.businessType.charAt(0).toUpperCase() + request.businessType.slice(1)}, {request.country}
                          </p>
                          <p className="text-sm text-neutral-500 mt-1">
                            Requested: {formatDate(request.createdAt)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600">
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p>No pending wholesaler requests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-center text-neutral-500 space-y-4">
              <ChartBarStacked className="h-12 w-12 mx-auto text-neutral-300" />
              <p>Sales analytics and reporting features will be shown here</p>
              <Button variant="outline">Configure Analytics</Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-neutral-500">Last updated: Today</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Weekly
              </Button>
              <Button variant="outline" size="sm">
                Monthly
              </Button>
              <Button variant="outline" size="sm">
                Quarterly
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              Add new products, update inventory levels, or modify pricing tiers.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/products">Manage Products</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              Review and approve pending orders, generate invoices, and update shipping status.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/orders">Process Orders</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wholesaler Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              Approve new wholesaler requests, manage existing accounts, and assign pricing tiers.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/wholesalers">Manage Wholesalers</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
