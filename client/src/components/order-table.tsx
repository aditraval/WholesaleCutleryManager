import { Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-helpers";

interface OrderTableProps {
  orders: Order[];
  isAdmin?: boolean;
  className?: string;
  onOrderSelect?: (order: Order) => void;
}

export function OrderTable({ orders, isAdmin = false, className, onOrderSelect }: OrderTableProps) {
  // Function to format the order status
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
      <span className={cn("px-2 py-1 text-xs font-medium rounded-full", className)}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-neutral-200">
        <thead>
          <tr>
            <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
            <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
            {isAdmin && (
              <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Wholesaler</th>
            )}
            <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
            <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                  #{order.id.toString().padStart(4, '0')}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                  {formatDate(order.createdAt)}
                </td>
                {isAdmin && (
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {/* This would normally pull the user's name from a joined table */}
                    User #{order.userId}
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                  ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                  <div className="flex space-x-2">
                    {onOrderSelect ? (
                      <Button variant="ghost" size="icon" onClick={() => onOrderSelect(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/${isAdmin ? 'admin' : 'wholesaler'}/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-neutral-500">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrderTable;
