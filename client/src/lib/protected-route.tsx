import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  role,
}: {
  path: string;
  component: () => React.JSX.Element;
  role?: string;
}) {
  // TEMPORARY: Direct access for development - comment this out when auth is ready
  return <Route path={path} component={Component} />;
  
  /* ORIGINAL IMPLEMENTATION - Uncomment when auth is ready
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (role && user.role !== role) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
  */
}

export function AdminRoute({
  path,
  component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return <ProtectedRoute path={path} component={component} role="admin" />;
}

export function WholesalerRoute({
  path,
  component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return <ProtectedRoute path={path} component={component} role="wholesaler" />;
}
