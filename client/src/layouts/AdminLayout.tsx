import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  FileText, 
  Settings,
  Tag,
  RefreshCw,
  Menu,
  Bell,
  LogOut
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

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  // TEMPORARY - Mock user for development
  const user = { id: 1, username: "admin", role: "admin" };
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // TEMPORARY: Mock logout - just log to console
    console.log("Logout clicked");
  };

  // Navigation items
  const navigationItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Wholesalers", href: "/admin/wholesalers", icon: Users },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Invoices", href: "/admin/invoices", icon: FileText },
  ];

  const settingsItems = [
    { name: "General Settings", href: "/admin/settings", icon: Settings },
    { name: "Pricing Tiers", href: "/admin/pricing-tiers", icon: Tag },
    { name: "HubSpot Integration", href: "/admin/hubspot", icon: RefreshCw },
  ];

  return (
    <div className="bg-neutral-100 min-h-screen flex">
      {/* Sidebar */}
      <div className={`bg-neutral-800 text-white w-64 fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-200 ease-in-out z-30`}>
        <div className="p-4 border-b border-neutral-700">
          <div className="flex items-center space-x-2">
            <svg className="h-6 w-6 text-primary-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.92 11H18V13H13.92C13.8 13.84 13.4 14.59 12.79 15.17C12.19 15.79 11.41 16.13 10.54 16.13C9.46 16.13 8.53 15.67 7.92 14.92C7.33 14.21 7 13.39 7 12.46C7 11.54 7.33 10.71 7.92 10C8.54 9.25 9.46 8.79 10.54 8.79C11.41 8.79 12.2 9.13 12.79 9.75C13.4 10.33 13.8 11.09 13.92 11Z"/>
            </svg>
            <span className="font-bold text-lg">Admin Portal</span>
          </div>
        </div>
        <nav className="py-4">
          <div className="px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Main
          </div>
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a 
                  className={`flex items-center px-4 py-2 text-sm ${
                    isActive ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </a>
              </Link>
            );
          })}

          <div className="px-4 py-2 mt-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Settings
          </div>
          {settingsItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a 
                  className={`flex items-center px-4 py-2 text-sm ${
                    isActive ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </a>
              </Link>
            );
          })}
          
          <div className="px-4 py-2 mt-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Account
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Link href="/">
              <a className="flex items-center text-sm text-neutral-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Website
              </a>
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-neutral-200 py-4 px-6 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-600 hover:text-neutral-900 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex items-center ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-xs flex items-center justify-center rounded-full">7</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">New wholesaler request</span>
                    <span className="text-xs text-muted-foreground">Urban Kitchen Supplies - 2 mins ago</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">Order #7642 needs approval</span>
                    <span className="text-xs text-muted-foreground">From Seattle Restaurants Inc. - 15 mins ago</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">Low stock alert</span>
                    <span className="text-xs text-muted-foreground">Premium Flatware Set (24 pcs) - 1 hour ago</span>
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
                <Button variant="ghost" className="ml-4 flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://randomuser.me/api/portraits/women/56.jpg" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-neutral-800">{user?.username || "Admin User"}</p>
                    <p className="text-xs text-neutral-500">Super Admin</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminLayout;
