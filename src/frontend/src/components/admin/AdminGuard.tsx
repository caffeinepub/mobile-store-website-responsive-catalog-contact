import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert, Loader2, LogIn, Copy, Check, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin, useHasAnyAdmin, useClaimInitialAdmin } from '../../hooks/useQueries';
import { getPrincipalString } from '../../utils/principalFormat';
import { useState } from 'react';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const {
    data: isAdmin,
    isLoading: adminCheckLoading,
    isFetched,
    error,
    isActorReady,
    isSuccess,
    isError,
    refetch,
  } = useIsCallerAdmin();

  const { data: hasAnyAdmin, isLoading: hasAdminLoading, isFetched: hasAdminFetched } = useHasAnyAdmin();

  const claimInitialAdminMutation = useClaimInitialAdmin();

  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Determine if we should show loading state
  const shouldShowLoading =
    isLoggingIn ||
    (isAuthenticated && !isActorReady) ||
    (isAuthenticated && isActorReady && (adminCheckLoading || hasAdminLoading) && (!isFetched || !hasAdminFetched));

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleClaimAdmin = async () => {
    try {
      await claimInitialAdminMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to claim initial admin:', error);
    }
  };

  const handleCopyPrincipal = () => {
    const principalId = getPrincipalString(identity || null);
    if (principalId) {
      navigator.clipboard.writeText(principalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (shouldShowLoading) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto admin-loading-card">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
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
        <Card className="max-w-2xl mx-auto admin-auth-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl admin-card-title">Authentication Required</CardTitle>
            <CardDescription>Please log in to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button size="lg" className="w-full admin-action-button" onClick={login}>
              <LogIn className="h-5 w-5 mr-2" />
              Log In
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => navigate({ to: '/' })}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if there was a problem checking admin status
  if (isError && error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isTimeout = errorMessage.includes('timed out');
    const isAdminCheckUnavailable = errorMessage.includes('ADMIN_CHECK_UNAVAILABLE');

    return (
      <div className="container py-12">
        <Alert variant="destructive" className="max-w-3xl mx-auto admin-error-alert">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 admin-alert-title">
                {isTimeout ? 'Request Timed Out' : 'Error Checking Admin Status'}
              </h3>
              <p className="mb-3">
                {isTimeout
                  ? 'The admin verification request took too long to complete. This may indicate a backend connectivity issue.'
                  : isAdminCheckUnavailable
                    ? 'The backend does not provide the required admin check methods. The canister may need to be redeployed with the correct interface.'
                    : 'An unexpected error occurred while verifying your admin status.'}
              </p>
              <p className="text-sm opacity-90 font-mono bg-background/50 p-2 rounded">{errorMessage}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRetry} disabled={isRetrying} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
              <Button onClick={() => navigate({ to: '/' })} variant="outline" size="sm">
                Back to Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If admin check succeeded but user is not admin, show access denied
  if (isSuccess && !isAdmin) {
    const principalId = getPrincipalString(identity || null);
    const bootstrappingNotSupported =
      claimInitialAdminMutation.isError &&
      claimInitialAdminMutation.error instanceof Error &&
      claimInitialAdminMutation.error.message.includes('BOOTSTRAPPING_NOT_SUPPORTED');

    return (
      <div className="container py-12">
        <Card className="max-w-3xl mx-auto admin-access-denied-alert border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl admin-card-title">Access Denied</CardTitle>
            <CardDescription>Admin access is controlled by the backend authorization system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="admin-info-alert">
              <Info className="h-5 w-5" />
              <AlertDescription>
                <h4 className="font-semibold mb-2">Why am I seeing this?</h4>
                <p>
                  Admin access is controlled by the backend authorization system. Your account is authenticated but does
                  not have admin privileges.
                </p>
              </AlertDescription>
            </Alert>

            {bootstrappingNotSupported && (
              <Alert className="admin-info-alert border-accent">
                <Info className="h-5 w-5 text-accent" />
                <AlertDescription>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-accent">🔧</span> For Developers
                  </h4>
                  <p className="mb-3">
                    Admin principals are configured in the backend's <code className="text-sm">authorization/access-control</code> module. To grant admin access in the Live environment, you need to update the hardcoded admin list in the backend code and redeploy.
                  </p>
                  <div className="bg-background/50 p-3 rounded-md border border-border">
                    <p className="font-semibold text-sm mb-2">How to get admin access:</p>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Contact the system administrator for this environment</li>
                      <li>Provide them with your Principal ID (shown below)</li>
                      <li>They can grant you admin access through the backend</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">Authentication Status:</p>
                  <p className="text-sm text-success flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Authenticated
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-semibold mb-2">Your Principal ID:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background p-2 rounded border border-border break-all">
                    {principalId || 'Unable to retrieve'}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPrincipal}
                    disabled={!principalId}
                    className="shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => navigate({ to: '/' })}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If admin check succeeded and user is admin, render children
  if (isSuccess && isAdmin) {
    return <>{children}</>;
  }

  // Fallback: should not reach here, but show loading as safe default
  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto admin-loading-card">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
