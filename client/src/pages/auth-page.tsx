import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Login form schema
const loginSchema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(2, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  businessType: z.string().min(1, "Business type is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Redirect if user is already logged in
  if (user) {
    if (user.role === "admin") {
      navigate("/admin");
    } else if (user.role === "wholesaler") {
      navigate("/wholesaler");
    } else {
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

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      companyName: "",
      contactName: "",
      phoneNumber: "",
      country: "",
      businessType: "",
    },
  });

  // Submit login form
  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  // Submit registration form
  function onRegisterSubmit(data: RegisterFormValues) {
    // Add role as "wholesaler" for registration
    registerMutation.mutate({
      ...data,
      role: "wholesaler",
    });
  }

  return (
    <MainLayout>
      <div className="py-12 min-h-[80vh] bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Auth Form Column */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">Welcome to CutleryWholesale</h2>
                <p className="text-neutral-600">Login or register to access the wholesaler portal</p>
              </div>

              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
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
                              <Input type="password" placeholder="Enter your password" {...field} />
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
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </Form>
                  <p className="text-sm text-center mt-4 text-neutral-600">
                    Don't have an account yet?{" "}
                    <Button 
                      variant="link" 
                      className="p-0" 
                      onClick={() => setActiveTab("register")}
                    >
                      Register now
                    </Button>
                  </p>
                </TabsContent>

                {/* Registration Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      {/* Account Information */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-neutral-800">Account Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Choose a username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create a password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Business Information */}
                      <div className="space-y-4 pt-2">
                        <h3 className="font-medium text-neutral-800">Business Information</h3>
                        <FormField
                          control={registerForm.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter company name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="contactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter contact name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter country" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="businessType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Type</FormLabel>
                                <select 
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  {...field}
                                >
                                  <option value="">Select business type</option>
                                  <option value="restaurant">Restaurant</option>
                                  <option value="hotel">Hotel</option>
                                  <option value="retailer">Retailer</option>
                                  <option value="distributor">Distributor</option>
                                  <option value="other">Other</option>
                                </select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </form>
                  </Form>
                  <p className="text-sm text-center mt-4 text-neutral-600">
                    Already have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0" 
                      onClick={() => setActiveTab("login")}
                    >
                      Login now
                    </Button>
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Hero Column */}
            <div className="hidden md:block">
              <div className="p-8 bg-primary-50 rounded-lg h-full">
                <div className="flex flex-col justify-center h-full">
                  <h2 className="text-3xl font-bold text-primary-800 mb-6">Premium Wholesale Cutlery Platform</h2>
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-1">Comprehensive Management</h3>
                        <p className="text-neutral-600">View and download invoices, track shipments, and manage your profile.</p>
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
