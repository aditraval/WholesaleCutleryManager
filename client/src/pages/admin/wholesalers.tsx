import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { User, WholesalerRequest } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, X, UserPlus, Phone, Mail, Globe, Building, 
  MapPin, ClipboardList, Calendar, Briefcase, Clock
} from "lucide-react";

export default function AdminWholesalers() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedRequest, setSelectedRequest] = useState<WholesalerRequest | null>(null);
  
  // Fetch wholesaler users
  const { data: wholesalers, isLoading: wholesalersLoading } = useQuery<User[]>({
    queryKey: ["/api/users", { role: "wholesaler" }],
  });
  
  // Fetch wholesaler requests
  const { data: requests, isLoading: requestsLoading } = useQuery<WholesalerRequest[]>({
    queryKey: ["/api/wholesaler-requests"],
  });
  
  // Update wholesaler request status mutation
  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/wholesaler-requests/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      // Close the dialog and refetch requests
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ["/api/wholesaler-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", { role: "wholesaler" }] });
      
      toast({
        title: "Request updated",
        description: "The wholesaler request has been processed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update request",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle request approve
  const handleApprove = (request: WholesalerRequest) => {
    updateRequestStatusMutation.mutate({ id: request.id, status: "approved" });
  };
  
  // Handle request reject
  const handleReject = (request: WholesalerRequest) => {
    updateRequestStatusMutation.mutate({ id: request.id, status: "rejected" });
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  
  // Filter pending requests
  const pendingRequests = requests?.filter(req => req.status === "pending") || [];
  
  // Filter approved requests
  const approvedRequests = requests?.filter(req => req.status === "approved") || [];
  
  // Filter rejected requests
  const rejectedRequests = requests?.filter(req => req.status === "rejected") || [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Wholesaler Management</h1>
        <p className="text-neutral-600">Manage wholesaler accounts and review wholesaler applications</p>
      </div>
      
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <TabsList>
            <TabsTrigger value="active">
              Active Wholesalers
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Requests {pendingRequests.length > 0 && 
                <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              }
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 md:mt-0">
            <div className="relative">
              <Input placeholder="Search wholesalers..." className="w-full md:w-64" />
            </div>
          </div>
        </div>
        
        {/* Active Wholesalers Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Wholesaler Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {wholesalersLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : wholesalers && wholesalers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Company</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Country</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {wholesalers.map((wholesaler) => (
                        <tr key={wholesaler.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            #{wholesaler.id}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                            {wholesaler.companyName || "N/A"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {wholesaler.contactName || wholesaler.username}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {wholesaler.email}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {wholesaler.country || "N/A"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              <Button variant="outline" size="sm">
                                Orders
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <UserPlus className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">No active wholesalers yet</h3>
                  <p className="text-neutral-600 max-w-md mx-auto mb-6">
                    When you approve wholesaler applications, they will appear here as active accounts.
                  </p>
                  <Button onClick={() => setActiveTab("pending")}>
                    Review Pending Applications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pending Requests Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Wholesaler Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <h3 className="font-medium text-neutral-800 text-lg">{request.companyName}</h3>
                            <span className="ml-3 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center text-sm text-neutral-600">
                              <Building className="h-4 w-4 mr-2 text-neutral-400" />
                              <span className="capitalize">{request.businessType} Business</span>
                            </div>
                            <div className="flex items-center text-sm text-neutral-600">
                              <MapPin className="h-4 w-4 mr-2 text-neutral-400" />
                              {request.country}
                            </div>
                            <div className="flex items-center text-sm text-neutral-600">
                              <Mail className="h-4 w-4 mr-2 text-neutral-400" />
                              {request.email}
                            </div>
                            <div className="flex items-center text-sm text-neutral-600">
                              <Phone className="h-4 w-4 mr-2 text-neutral-400" />
                              {request.phoneNumber}
                            </div>
                            <div className="flex items-center text-sm text-neutral-600">
                              <Calendar className="h-4 w-4 mr-2 text-neutral-400" />
                              Requested on {formatDate(request.createdAt)}
                            </div>
                            <div className="flex items-center text-sm text-neutral-600">
                              <Briefcase className="h-4 w-4 mr-2 text-neutral-400" />
                              Contact: {request.contactName}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4 md:mt-0">
                          <Button
                            onClick={() => handleApprove(request)}
                            className="bg-green-500 hover:bg-green-600"
                            size="sm"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(request)}
                            variant="outline"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => setSelectedRequest(request)}
                            variant="outline"
                            size="sm"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <ClipboardList className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">No pending applications</h3>
                  <p className="text-neutral-600 max-w-md mx-auto">
                    There are currently no pending wholesaler applications to review.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Approved Requests Tab */}
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : approvedRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Company</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Business Type</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Country</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Approved Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {approvedRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            #{request.id}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                            {request.companyName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {request.contactName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600 capitalize">
                            {request.businessType}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {request.country}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {request.updatedAt ? formatDate(request.updatedAt) : formatDate(request.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <Check className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">No approved applications</h3>
                  <p className="text-neutral-600 max-w-md mx-auto">
                    There are currently no approved wholesaler applications.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Rejected Requests Tab */}
        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : rejectedRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Company</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Business Type</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Country</th>
                        <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Rejected Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {rejectedRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            #{request.id}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                            {request.companyName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {request.contactName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600 capitalize">
                            {request.businessType}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {request.country}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {request.updatedAt ? formatDate(request.updatedAt) : formatDate(request.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <X className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">No rejected applications</h3>
                  <p className="text-neutral-600 max-w-md mx-auto">
                    There are currently no rejected wholesaler applications.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Wholesaler Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Wholesaler Application Details</DialogTitle>
              <DialogDescription>
                Review the details of this wholesaler application before making a decision.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Company Name</h4>
                  <p className="text-neutral-800">{selectedRequest.companyName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Business Type</h4>
                  <p className="text-neutral-800 capitalize">{selectedRequest.businessType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Contact Name</h4>
                  <p className="text-neutral-800">{selectedRequest.contactName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Phone Number</h4>
                  <p className="text-neutral-800">{selectedRequest.phoneNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Email</h4>
                  <p className="text-neutral-800">{selectedRequest.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Country</h4>
                  <p className="text-neutral-800">{selectedRequest.country}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Request Date</h4>
                  <p className="text-neutral-800">{formatDate(selectedRequest.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Status</h4>
                  <p className="text-neutral-800 capitalize">{selectedRequest.status}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Additional Information</h4>
                <p className="text-neutral-800">
                  {selectedRequest.additionalInfo || "No additional information provided."}
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleReject(selectedRequest)}
                variant="outline"
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(selectedRequest)}
                className="bg-green-500 hover:bg-green-600"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}