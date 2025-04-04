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
import { UseMutationResult } from "@tanstack/react-query";
import { User } from "@shared/schema";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminAuthPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Using try-catch to handle cases where AuthProvider might not be available
  try {
    const { user, loginMutation } = useAuth();
    
    // Redirect if user is already logged in
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
        return null; // Return null to prevent rendering the rest of the component
      } else {
        toast({
          title: "Access Denied",
          description: "This login page is for administrators only.",
          variant: "destructive"
        });
        navigate("/");
        return null; // Return null to prevent rendering the rest of the component
      }
    }
  } catch (error) {
    // If useAuth throws an error, it means we're not within an AuthProvider
    // We'll continue rendering the login form
    console.error("Auth provider not available:", error);
  }

  // Create a variable to store loginMutation
  let loginMutation: UseMutationResult<User, Error, LoginFormValues> | undefined;
  try {
    // Try to get the loginMutation from useAuth
    const auth = useAuth();
    loginMutation = auth.loginMutation;
  } catch (error) {
    // If not available, we'll handle this in onLoginSubmit
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
    try {
      // If loginMutation was successfully initialized, use it
      if (loginMutation) {
        loginMutation.mutate(data, {
          onSuccess: (user: User) => {
            // Only redirect to admin dashboard if user is admin
            if (user.role === "admin") {
              navigate("/admin");
            } else {
              toast({
                title: "Access Denied",
                description: "This login page is for administrators only.",
                variant: "destructive"
              });
              navigate("/");
            }
          }
        });
      } else {
        // If not, we need to handle this - make a direct API call
        fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        .then(res => {
          if (!res.ok) {
            throw new Error("Login failed");
          }
          return res.json();
        })
        .then((user: User) => {
          if (user.role === "admin") {
            navigate("/admin");
          } else {
            toast({
              title: "Access Denied",
              description: "This login page is for administrators only.",
              variant: "destructive"
            });
            navigate("/");
          }
        })
        .catch(error => {
          toast({
            title: "Login failed",
            description: "Invalid username or password",
            variant: "destructive"
          });
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    }
  }

  return (
    <MainLayout>
      <div className="py-12 min-h-[80vh] bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Admin Auth Form Column */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">Admin Login</h2>
                <p className="text-neutral-600">Access the administrator dashboard</p>
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
                          <Input placeholder="Enter admin username" {...field} />
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
                          <Input type="password" placeholder="Enter admin password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation && loginMutation.isPending}
                  >
                    {loginMutation && loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In as Administrator"
                    )}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center">
                <p className="text-sm text-neutral-600">
                  Note: This login page is for administrators only.
                </p>
              </div>
            </div>

            {/* Hero Column */}
            <div className="hidden md:block">
              <div className="p-8 bg-primary-50 rounded-lg h-full">
                <div className="flex flex-col justify-center h-full">
                  <h2 className="text-3xl font-bold text-primary-800 mb-6">Administrator Portal</h2>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-primary-100 p-2 rounded-full mr-4">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-1">Comprehensive Analytics</h3>
                        <p className="text-neutral-600">Monitor all business operations with detailed dashboards.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary-100 p-2 rounded-full mr-4">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-1">Product Management</h3>
                        <p className="text-neutral-600">Add, edit, and manage your product catalog seamlessly.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary-100 p-2 rounded-full mr-4">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-1">Customer Management</h3>
                        <p className="text-neutral-600">Review wholesaler requests and manage wholesaler accounts.</p>
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