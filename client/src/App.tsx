import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminAuthPage from "@/pages/auth-admin";
import WholesalerAuthPage from "@/pages/auth-wholesaler";
import { ProtectedRoute, AdminRoute, WholesalerRoute } from "./lib/protected-route";
import AdminDashboard from "@/pages/admin/dashboard";
import WholesalerDashboard from "@/pages/wholesaler/dashboard";
import WholesalerOrders from "@/pages/wholesaler/orders";
import WholesalerCatalog from "@/pages/wholesaler/catalog";
import WholesalerInvoices from "@/pages/wholesaler/invoices";
import AdminWholesalers from "@/pages/admin/wholesalers";
import Landing from "./pages/landing";

// Direct imports for the admin pages to fix module not found errors
import AdminOrders from "./pages/admin/orders";
import AdminProducts from "./pages/admin/products";
import AdminInvoices from "./pages/admin/invoices";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} /> {/* Keeping the old auth page for backward compatibility */}
      <Route path="/auth-admin" component={AdminAuthPage} />
      <Route path="/auth-wholesaler" component={WholesalerAuthPage} />
      
      {/* Wholesaler routes */}
      <WholesalerRoute path="/wholesaler" component={WholesalerDashboard} />
      <WholesalerRoute path="/wholesaler/orders" component={WholesalerOrders} />
      <WholesalerRoute path="/wholesaler/catalog" component={WholesalerCatalog} />
      <WholesalerRoute path="/wholesaler/invoices" component={WholesalerInvoices} />
      
      {/* Admin routes */}
      <AdminRoute path="/admin" component={AdminDashboard} />
      <AdminRoute path="/admin/wholesalers" component={AdminWholesalers} />
      <AdminRoute path="/admin/orders" component={AdminOrders} />
      <AdminRoute path="/admin/products" component={AdminProducts} />
      <AdminRoute path="/admin/invoices" component={AdminInvoices} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// App component is now simplified since providers are in main.tsx
function App() {
  return <Router />;
}

export default App;
