import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function WholesalerAuthPage() {
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  
  const [, navigate] = useLocation();

  // Redirect if user is already logged in
  if (user) {
    if (user.role === "wholesaler") {
      navigate("/wholesaler");
    } else {
      toast({
        title: "Access Denied",
        description: "This login page is for wholesalers only.",
        variant: "destructive"
      });
      navigate("/");
    }
  }

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Submit login form using real authentication
  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data, {
      onSuccess: (user) => {
        // Only redirect to wholesaler dashboard if user is wholesaler
        if (user.role === "wholesaler") {
          navigate("/wholesaler");
        } else {
          toast({
            title: "Access Denied",
            description: "This login page is for wholesalers only.",
            variant: "destructive"
          });
          navigate("/");
        }
      }
    });
  }

  return (
    <MainLayout>
      <div className="py-12 min-h-[80vh] bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Wholesaler Auth Form Column */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">Wholesaler Login</h2>
                <p className="text-neutral-600">Access your wholesaler account</p>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter wholesaler username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter wholesaler password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In as Wholesaler"
                    )}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center">
                <p className="text-sm text-neutral-600">
                  Don't have a wholesaler account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0" 
                    onClick={() => navigate("/")}
                  >
                    Apply here
                  </Button>
                </p>
              </div>
            </div>

            {/* Hero Column */}
            <div className="hidden md:block">
              <div className="p-8 bg-primary-50 rounded-lg h-full">
                <div className="flex flex-col justify-center h-full">
                  <h2 className="text-3xl font-bold text-primary-800 mb-6">Wholesaler Portal</h2>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-primary-100 p-2 rounded-full mr-4">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-1">Exclusive Wholesale Pricing</h3>
                        <p className="text-neutral-600">Access special pricing tiers based on your order volume.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary-100 p-2 rounded-full mr-4">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-1">Streamlined Ordering</h3>
                        <p className="text-neutral-600">Easily place and track bulk orders through your dashboard.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary-100 p-2 rounded-full mr-4">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-1">Invoice Management</h3>
                        <p className="text-neutral-600">View and download invoices, track payments, and manage your account.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 bg-white rounded-lg p-4 border border-primary-100">
                    <p className="text-neutral-600 text-sm italic">
                      "CutleryWholesale has been an essential partner for our restaurant supply business. The platform is intuitive and their products are of exceptional quality."
                    </p>
                    <div className="mt-2 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden mr-2">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Testimonial" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">Michael Rodriguez</p>
                        <p className="text-xs text-neutral-500">Coastal Kitchen Supplies</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}