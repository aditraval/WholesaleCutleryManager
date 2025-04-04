import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order, OrderItem, Product, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import OrderTable from "@/components/order-table";
import { Filter, Eye, Printer, Truck, CheckCircle, Package, Ban } from "lucide-react";
import { formatDate, formatCurrency, getUserName, getProductName } from "@/lib/format-helpers";

export default function AdminOrders() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  // Fetch users (wholesalers)
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users", { role: "wholesaler" }],
  });
  
  // Fetch order items when an order is selected
  const { data: orderItems, isLoading: orderItemsLoading } = useQuery<OrderItem[]>({
    queryKey: ["/api/orders", selectedOrder?.id, "items"],
    enabled: !!selectedOrder,
  });
  
  // Fetch products for order items
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, { status });
      return await res.json();
    },
    onSuccess: (data) => {
      // Update selected order with new status
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: data.status });
      }
      
      // Refetch orders
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      toast({
        title: "Order updated",
        description: `Order #${data.id} status updated to ${data.status}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle order status update
  const handleStatusUpdate = (newStatus: string) => {
    if (!selectedOrder) return;
    
    updateOrderStatusMutation.mutate({
      id: selectedOrder.id,
      status: newStatus
    });
  };
  
  // Filter orders by status
  const filteredOrders = orders?.filter(order => 
    statusFilter === "all" ? true : order.status === statusFilter
  ) || [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Order Management</h1>
        <p className="text-neutral-600">View and manage customer orders</p>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between pt-6">
          <CardTitle>Orders</CardTitle>
          <div className="flex items-center space-x-4">
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
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : orders && orders.length > 0 ? (
            <OrderTable 
              orders={filteredOrders} 
              isAdmin={true} 
              onOrderSelect={(order) => setSelectedOrder(order)}
            />
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <p className="mb-2">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder.id.toString().padStart(4, '0')}</DialogTitle>
              <DialogDescription>
                Order details and management options
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Order Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Order Date</h4>
                  <p className="text-neutral-800">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Wholesaler</h4>
                  <p className="text-neutral-800">{getUserName(users, selectedOrder.userId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Total Amount</h4>
                  <p className="text-neutral-800 font-bold">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Status</h4>
                  <p className={`text-sm font-medium px-2 py-1 rounded-full inline-block 
                    ${selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                      selectedOrder.status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                      selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`
                  }>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </p>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium mb-3">Order Items</h3>
                {orderItemsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : orderItems && orderItems.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Product</th>
                          <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
                          <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-800">
                              {getProductName(products, item.productId)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                              {formatCurrency(parseFloat(item.price.toString()) * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-neutral-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-sm text-neutral-700 font-medium text-right">Total:</td>
                          <td className="px-4 py-3 text-sm text-neutral-700 font-bold">{formatCurrency(selectedOrder.totalAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-neutral-500 text-center py-4">No items found for this order</p>
                )}
              </div>
              
              {/* Order Actions */}
              <div>
                <h3 className="text-lg font-medium mb-3">Update Order Status</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status !== "approved" && (
                    <Button onClick={() => handleStatusUpdate("approved")} className="bg-blue-500 hover:bg-blue-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Order
                    </Button>
                  )}
                  
                  {selectedOrder.status !== "shipped" && selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                    <Button onClick={() => handleStatusUpdate("shipped")} className="bg-indigo-500 hover:bg-indigo-600">
                      <Truck className="h-4 w-4 mr-2" />
                      Mark as Shipped
                    </Button>
                  )}
                  
                  {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                    <Button onClick={() => handleStatusUpdate("delivered")} className="bg-green-500 hover:bg-green-600">
                      <Package className="h-4 w-4 mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                  
                  {selectedOrder.status !== "cancelled" && (
                    <Button onClick={() => handleStatusUpdate("cancelled")} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                      <Ban className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
              <Button>
                <Printer className="h-4 w-4 mr-2" />
                Print Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm mb-1">Pending Orders</p>
                <h3 className="text-2xl font-bold text-yellow-600">
                  {orders?.filter(o => o.status === "pending").length || 0}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm mb-1">Approved Orders</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {orders?.filter(o => o.status === "approved").length || 0}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm mb-1">Shipped Orders</p>
                <h3 className="text-2xl font-bold text-indigo-600">
                  {orders?.filter(o => o.status === "shipped").length || 0}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm mb-1">Delivered Orders</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {orders?.filter(o => o.status === "delivered").length || 0}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}