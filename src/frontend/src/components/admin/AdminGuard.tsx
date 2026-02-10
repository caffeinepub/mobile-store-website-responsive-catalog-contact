import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert, Loader2, LogIn, Copy, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { getPrincipalString } from '../../utils/principalFormat';
import { useState } from 'react';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminCheckLoading, refetch } = useIsCallerAdmin();
  const [copied, setCopied] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Refetch admin status when identity changes to ensure fresh data
  useEffect(() => {
    if (isAuthenticated && !adminCheckLoading) {
      refetch();
    }
  }, [isAuthenticated, refetch, adminCheckLoading]);

  // Show loading state while checking authentication or admin status
  if (isLoggingIn || adminCheckLoading) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button size="lg" className="w-full" onClick={login}>
              <LogIn className="h-5 w-5 mr-2" />
              Log In
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate({ to: '/' })}
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if authenticated but not admin
  if (!isAdmin) {
    const principalString = getPrincipalString(identity);

    const handleCopyPrincipal = async () => {
      if (principalString) {
        try {
          await navigator.clipboard.writeText(principalString);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error('Failed to copy principal:', error);
        }
      }
    };

    return (
      <div className="container py-12">
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <ShieldAlert className="h-5 w-5" />
          <AlertDescription className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Access Denied</h3>
              <p className="mb-3">You do not have permission to access the admin dashboard.</p>
              
              {/* Authentication Status */}
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mt-3 space-y-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Authentication Status:</p>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    ✓ Authenticated
                  </span>
                </div>
                
                {principalString && (
                  <div>
                    <p className="text-sm font-medium mb-2">Your Principal ID:</p>
                    <div className="flex items-start gap-2">
                      <code className="text-xs bg-background/50 px-2 py-1.5 rounded flex-1 break-all font-mono leading-relaxed">
                        {principalString}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyPrincipal}
                        className="shrink-0 h-8 w-8 p-0"
                        title="Copy Principal ID to clipboard"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Detailed explanation */}
                <div className="bg-background/30 border border-destructive/20 rounded p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="text-xs space-y-2">
                      <p className="font-semibold">Why am I seeing this?</p>
                      <p>
                        Admin access is controlled by the backend canister's admin allowlist. 
                        The backend method <code className="bg-background/50 px-1 py-0.5 rounded">isCallerAdmin()</code> checks 
                        if your Principal ID has been granted admin permissions.
                      </p>
                      <p>
                        Currently, <code className="bg-background/50 px-1 py-0.5 rounded">isCallerAdmin()</code> is 
                        returning <span className="font-semibold text-destructive">false</span> for your Principal ID, 
                        which means the backend has not granted admin rights to this Principal.
                      </p>
                      <p className="font-semibold mt-3">To gain access:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Copy your Principal ID above (using the copy button)</li>
                        <li>Contact the system administrator or backend developer</li>
                        <li>Request that your Principal ID be added to the admin allowlist in the backend canister</li>
                        <li>After the backend grants admin permissions, refresh this page</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/' })}
              className="self-start"
            >
              Back to Home
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render protected content if admin
  return <>{children}</>;
}
