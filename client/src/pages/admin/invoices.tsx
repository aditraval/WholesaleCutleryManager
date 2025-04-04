import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Invoice, Order, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Filter, Eye, Printer, Download, Plus, Clock, CheckCircle, 
  DollarSign, FileText, AlertTriangle, Receipt
} from "lucide-react";

export default function AdminInvoices() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });
  
  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  // Fetch users (wholesalers)
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users", { role: "wholesaler" }],
  });
  
  // Update invoice status mutation
  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/invoices/${id}`, { status });
      return await res.json();
    },
    onSuccess: (data) => {
      // Update selected invoice with new status
      if (selectedInvoice) {
        setSelectedInvoice({ ...selectedInvoice, status: data.status });
      }
      
      // Refetch invoices
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      
      toast({
        title: "Invoice updated",
        description: `Invoice #${data.id} status updated to ${data.status}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Generate invoice mutation
  const generateInvoiceMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("POST", "/api/invoices", { orderId });
      return await res.json();
    },
    onSuccess: () => {
      // Refetch invoices
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      
      toast({
        title: "Invoice generated",
        description: "The invoice has been generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle invoice status update
  const handleStatusUpdate = (newStatus: string) => {
    if (!selectedInvoice) return;
    
    updateInvoiceStatusMutation.mutate({
      id: selectedInvoice.id,
      status: newStatus
    });
  };
  
  // Filter invoices by status and search query
  const filteredInvoices = invoices?.filter(invoice => {
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      invoice.id.toString().includes(searchQuery) || 
      invoice.orderId.toString().includes(searchQuery);
    
    return matchesStatus && matchesSearch;
  }) || [];
  
  // Get orders without invoices
  const ordersWithoutInvoices = orders?.filter(order => 
    order.status === "approved" || order.status === "shipped" || order.status === "delivered"
  ).filter(order => 
    !invoices?.some(invoice => invoice.orderId === order.id)
  ) || [];
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
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
  
  // Get user name by ID
  const getUserName = (userId: number) => {
    const user = users?.find(u => u.id === userId);
    return user ? 
      user.companyName || user.contactName || user.username : 
      `User #${userId}`;
  };
  
  // Get order by ID
  const getOrder = (orderId: number) => {
    return orders?.find(order => order.id === orderId);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles = {
      unpaid: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-neutral-100 text-neutral-800"
    };

    const statusKey = status.toLowerCase() as keyof typeof statusStyles;
    const className = statusStyles[statusKey] || "bg-gray-100 text-gray-800";

    const StatusIcon = () => {
      switch (status.toLowerCase()) {
        case 'unpaid': return <Clock className="h-3 w-3 mr-1" />;
        case 'paid': return <CheckCircle className="h-3 w-3 mr-1" />;
        case 'overdue': return <AlertTriangle className="h-3 w-3 mr-1" />;
        default: return null;
      }
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${className}`}>
        <StatusIcon />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Invoice Management</h1>
        <p className="text-neutral-600">Generate and manage customer invoices</p>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between pt-6">
          <CardTitle>Invoices</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input 
                placeholder="Search by ID..." 
                className="w-64 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-neutral-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Invoices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Invoices</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Printer className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Invoice ID</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Wholesaler</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Issue Date</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredInvoices.map((invoice) => {
                    const order = getOrder(invoice.orderId);
                    return (
                      <tr key={invoice.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                          #INV-{invoice.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          #{invoice.orderId.toString().padStart(4, '0')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {order ? getUserName(order.userId) : "Unknown"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {formatDate(invoice.issuedDate)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={invoice.status} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(invoice)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <p className="mb-2">No invoices found</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Generate Invoice Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate New Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : ordersWithoutInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Wholesaler</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order Date</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {ordersWithoutInvoices.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                        #{order.id.toString().padStart(4, '0')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {getUserName(order.userId)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full 
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                            'bg-neutral-100 text-neutral-800'}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                        <Button 
                          size="sm"
                          onClick={() => generateInvoiceMutation.mutate(order.id)}
                          disabled={generateInvoiceMutation.isPending && generateInvoiceMutation.variables === order.id}
                        >
                          {generateInvoiceMutation.isPending && generateInvoiceMutation.variables === order.id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating...
                            </span>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Generate Invoice
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <Receipt className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 mb-2">No pending orders to invoice</h3>
              <p className="text-neutral-600 max-w-md mx-auto mb-6">
                All eligible orders have been invoiced. When new orders are approved, they will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Invoice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-neutral-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm mb-1">Unpaid Invoices</p>
                <h3 className="text-2xl font-bold text-yellow-600">
                  {invoices?.filter(i => i.status === "unpaid").length || 0}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm mb-1">Paid Invoices</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {invoices?.filter(i => i.status === "paid").length || 0}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-primary-600">
                  {formatCurrency(
                    invoices
                      ?.filter(i => i.status === "paid")
                      .reduce((total, invoice) => total + parseFloat(invoice.amount.toString()), 0) || 0
                  )}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Invoice Details Dialog */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Invoice #INV-{selectedInvoice.id.toString().padStart(4, '0')}</DialogTitle>
              <DialogDescription>
                Review invoice details and update status
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Invoice Information */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Issue Date</h4>
                  <p className="text-neutral-800">{formatDate(selectedInvoice.issuedDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Due Date</h4>
                  <p className="text-neutral-800">
                    {selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : "Net 14 days"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Status</h4>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Order ID</h4>
                  <p className="text-neutral-800">#{selectedInvoice.orderId.toString().padStart(4, '0')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Amount</h4>
                  <p className="text-neutral-800 font-bold">{formatCurrency(selectedInvoice.amount)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Wholesaler</h4>
                  <p className="text-neutral-800">
                    {(() => {
                      const order = getOrder(selectedInvoice.orderId);
                      return order ? getUserName(order.userId) : "Unknown";
                    })()}
                  </p>
                </div>
              </div>
              
              {/* Update Invoice Status */}
              <div>
                <h3 className="text-lg font-medium mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInvoice.status !== "paid" && (
                    <Button onClick={() => handleStatusUpdate("paid")} className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Paid
                    </Button>
                  )}
                  
                  {selectedInvoice.status !== "unpaid" && (
                    <Button onClick={() => handleStatusUpdate("unpaid")} variant="outline">
                      <Clock className="h-4 w-4 mr-2" />
                      Mark as Unpaid
                    </Button>
                  )}
                  
                  {selectedInvoice.status !== "overdue" && (
                    <Button onClick={() => handleStatusUpdate("overdue")} className="bg-red-500 hover:bg-red-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Mark as Overdue
                    </Button>
                  )}
                  
                  {selectedInvoice.status !== "cancelled" && (
                    <Button onClick={() => handleStatusUpdate("cancelled")} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                      <X className="h-4 w-4 mr-2" />
                      Cancel Invoice
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                View PDF
              </Button>
              <Button>
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}