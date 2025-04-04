import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ListOrdered, 
  ShoppingBag, 
  FileText, 
  User,
  Bell,
  Menu,
  LogOut,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type WholesalerLayoutProps = {
  children: React.ReactNode;
};

export function WholesalerLayout({ children }: WholesalerLayoutProps) {
  // TEMPORARY - Mock user for development
  const user = { id: 2, username: "wholesaler", companyName: "Acme Supplies", role: "wholesaler" };
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // TEMPORARY: Mock logout - just log to console
    console.log("Logout clicked");
  };

  // Navigation items
  const navigationItems = [
    { name: "Dashboard", href: "/wholesaler", icon: LayoutDashboard },
    { name: "My Orders", href: "/wholesaler/orders", icon: ListOrdered },
    { name: "Browse Catalog", href: "/wholesaler/catalog", icon: ShoppingBag },
    { name: "Invoices", href: "/wholesaler/invoices", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Wholesaler Dashboard Header */}
      <header className="bg-white border-b border-neutral-200 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mr-2 p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link href="/wholesaler">
                <a className="flex items-center space-x-2">
                  <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.92 11H18V13H13.92C13.8 13.84 13.4 14.59 12.79 15.17C12.19 15.79 11.41 16.13 10.54 16.13C9.46 16.13 8.53 15.67 7.92 14.92C7.33 14.21 7 13.39 7 12.46C7 11.54 7.33 10.71 7.92 10C8.54 9.25 9.46 8.79 10.54 8.79C11.41 8.79 12.2 9.13 12.79 9.75C13.4 10.33 13.8 11.09 13.92 11Z"/>
                  </svg>
                  <h1 className="text-2xl font-bold text-neutral-800 hidden sm:block">Wholesaler Dashboard</h1>
                </a>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigationItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <a className={`flex items-center px-1 py-2 text-sm font-medium ${
                      isActive ? 'text-primary-600 border-b-2 border-primary-600' : 'text-neutral-600 hover:text-neutral-900'
                    }`}>
                      <item.icon className="h-5 w-5 sm:mr-1" />
                      <span className="hidden sm:inline">{item.name}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs flex items-center justify-center rounded-full">3</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium">Your order #ORD-7629 has been delivered</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium">Invoice #INV-8934 has been generated</span>
                      <span className="text-xs text-muted-foreground">Yesterday at 10:20 AM</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium">Your order #ORD-7589 has been shipped</span>
                      <span className="text-xs text-muted-foreground">Nov 5, 2023 at 4:12 PM</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center">
                    <span className="text-sm text-primary-600 font-medium">View all notifications</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://randomuser.me/api/portraits/men/42.jpg" alt="User" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-neutral-700 hidden sm:block">{user?.companyName || user?.username || "User"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Home className="h-4 w-4 mr-2" />
                    <Link href="/">
                      <a className="w-full">Back to website</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="pt-5 pb-4">
              <div className="px-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.92 11H18V13H13.92C13.8 13.84 13.4 14.59 12.79 15.17C12.19 15.79 11.41 16.13 10.54 16.13C9.46 16.13 8.53 15.67 7.92 14.92C7.33 14.21 7 13.39 7 12.46C7 11.54 7.33 10.71 7.92 10C8.54 9.25 9.46 8.79 10.54 8.79C11.41 8.79 12.2 9.13 12.79 9.75C13.4 10.33 13.8 11.09 13.92 11Z"/>
                  </svg>
                  <span className="font-bold text-lg">Wholesaler Portal</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-5 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive ? 'bg-primary-100 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }`}>
                        <item.icon className="mr-4 h-6 w-6" />
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
                
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="px-2 space-y-1">
                    <Link href="/">
                      <a className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">
                        <Home className="mr-4 h-6 w-6" />
                        Back to website
                      </a>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 w-full"
                    >
                      <LogOut className="mr-4 h-6 w-6" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

export default WholesalerLayout;
