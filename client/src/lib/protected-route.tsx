import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

export function ProtectedRoute({
  path,
  component: Component,
  role,
}: {
  path: string;
  component: () => React.JSX.Element;
  role?: string;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/user')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(userData => {
        setUser(userData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Authentication error:', error);
        setHasError(true);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (hasError || !user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (role && user.role !== role) {
    // Use the appropriate redirect based on role
    const redirectPath = role === 'admin' ? '/auth-admin' : '/auth-wholesaler';
    
    toast({
      title: "Access Denied",
      description: `You need ${role} permissions to access this page`,
      variant: "destructive"
    });

    return (
      <Route path={path}>
        <Redirect to={redirectPath} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
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