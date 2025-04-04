import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import WholesalerLayout from "@/layouts/WholesalerLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order } from "@shared/schema";
import { Eye, Download, Filter, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WholesalerOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Fetch orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Filter orders by status
  const filteredOrders = orders?.filter(order => 
    statusFilter === "all" ? true : order.status === statusFilter
  ) || [];

  // Paginate orders
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };

    const statusKey = status.toLowerCase() as keyof typeof statusStyles;
    const className = statusStyles[statusKey] || "bg-gray-100 text-gray-800";

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

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  return (
    <WholesalerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">My Orders</h1>
        <p className="text-neutral-600">View and manage all your orders</p>
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between pt-6">
          <CardTitle>Order History</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-neutral-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button asChild>
              <Link href="/wholesaler/catalog">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-[8%]" />
                  <Skeleton className="h-12 w-[15%]" />
                  <Skeleton className="h-12 w-[12%]" />
                  <Skeleton className="h-12 w-[12%]" />
                  <Skeleton className="h-12 w-[15%]" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {currentOrders.length > 0 ? (
                      currentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                            #{order.id.toString().padStart(4, '0')}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <StatusBadge status={order.status} />
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredOrders.length > ordersPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-neutral-500">
                    Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    {totalPages > 3 && <span className="px-2">...</span>}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Tips */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ordering Process</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-2">
              <li>Browse our catalog and select products</li>
              <li>Review your order details before submission</li>
              <li>Wait for admin approval</li>
              <li>Make payment through invoice</li>
              <li>Track your shipment status</li>
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">
              Orders typically ship within 2-3 business days after approval. 
              Large orders may require additional processing time. 
              Shipping is handled through our trusted logistics partners.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Need Assistance?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-3">
              Our customer service team is available Monday-Friday, 9AM-5PM EST.
            </p>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </WholesalerLayout>
  );
}
