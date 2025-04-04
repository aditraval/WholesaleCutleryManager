import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import WholesalerLayout from "@/layouts/WholesalerLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Invoice } from "@shared/schema";
import { Download, Eye, Filter, Calendar, Clock, Check, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WholesalerInvoices() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch invoices
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  // Filter invoices by status
  const filteredInvoices = invoices?.filter(invoice => 
    statusFilter === "all" ? true : invoice.status === statusFilter
  ) || [];

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
        case 'paid': return <Check className="h-3 w-3 mr-1" />;
        case 'overdue': return <AlertCircle className="h-3 w-3 mr-1" />;
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

  // Format date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Calculate due date (14 days after issue date)
  const calculateDueDate = (issuedDate: Date) => {
    const date = new Date(issuedDate);
    date.setDate(date.getDate() + 14);
    return formatDate(date);
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
        <h1 className="text-2xl font-bold text-neutral-800">Invoices</h1>
        <p className="text-neutral-600">View and manage your invoices</p>
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between pt-6">
          <CardTitle>Invoice History</CardTitle>
          <div className="flex items-center space-x-2">
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-[8%]" />
                  <Skeleton className="h-12 w-[20%]" />
                  <Skeleton className="h-12 w-[15%]" />
                  <Skeleton className="h-12 w-[15%]" />
                  <Skeleton className="h-12 w-[15%]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Invoice ID</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Issue Date</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                          #INV-{invoice.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          #{invoice.orderId.toString().padStart(4, '0')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {formatDate(invoice.issuedDate)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {invoice.dueDate ? formatDate(invoice.dueDate) : calculateDueDate(invoice.issuedDate)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={invoice.status} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`/api/invoices/${invoice.id}/pdf?download=true`} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                        No invoices found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Guidelines */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-neutral-600">
              <p>
                All invoices are due within 14 days from the issue date unless otherwise specified. 
                We accept payments via bank transfer, credit card, or PayPal.
              </p>
              <div className="space-y-2">
                <h4 className="font-medium text-neutral-800">Bank Transfer Details:</h4>
                <p>Bank Name: Metropolis Bank</p>
                <p>Account Name: CutleryWholesale Inc.</p>
                <p>Account Number: XXXX-XXXX-4578</p>
                <p>Routing Number: 074521639</p>
              </div>
              <p>
                Please include your Invoice Number in the payment reference to ensure proper allocation.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pay Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                For your convenience, you can pay your invoices online using our secure payment portal.
              </p>
              
              <div className="bg-neutral-50 p-4 rounded-md">
                <h4 className="font-medium text-neutral-800 mb-2">Payment Steps:</h4>
                <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-1">
                  <li>Select the invoice you wish to pay</li>
                  <li>Click the "Pay Now" button</li>
                  <li>Choose your preferred payment method</li>
                  <li>Complete the payment process</li>
                  <li>You'll receive a payment confirmation email</li>
                </ol>
              </div>
              
              <Button className="w-full">
                Pay Selected Invoice
              </Button>
              
              <p className="text-xs text-neutral-500 text-center mt-2">
                Payments are securely processed by our payment gateway
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </WholesalerLayout>
  );
}
