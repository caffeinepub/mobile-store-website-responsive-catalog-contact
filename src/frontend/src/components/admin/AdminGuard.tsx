import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert, Loader2, LogIn, Copy, Check, Info, AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
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
    refetch
  } = useIsCallerAdmin();
  
  const {
    data: hasAnyAdmin,
    isLoading: hasAdminLoading,
    isFetched: hasAdminFetched,
    error: hasAdminError,
  } = useHasAnyAdmin();
  
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
            <CardDescription>
              Please log in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button size="lg" className="w-full admin-action-button" onClick={login}>
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

  // Show error if there was a problem checking admin status
  if (isError && error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isTimeout = errorMessage.includes('timed out');
    const isInterfaceMismatch = errorMessage.includes('interface mismatch') || errorMessage.includes('not available');

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
                  : 'There was an error verifying your admin permissions. This may indicate a backend configuration issue.'
                }
              </p>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mt-3 space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Error Details:</p>
                  <code className="text-xs bg-background/50 px-2 py-1.5 rounded block break-all">
                    {errorMessage}
                  </code>
                </div>
                
                <div className="bg-background/30 border border-destructive/20 rounded p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="text-xs space-y-2">
                      <p className="font-semibold">Possible causes:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {isTimeout && (
                          <>
                            <li>The backend canister is slow to respond</li>
                            <li>Network connectivity issues</li>
                            <li>The canister may be overloaded</li>
                          </>
                        )}
                        {isInterfaceMismatch && (
                          <>
                            <li>The backend canister may need to be redeployed</li>
                            <li>The canister bindings may be out of sync</li>
                            <li>Required admin check methods are missing from the backend</li>
                          </>
                        )}
                        {!isTimeout && !isInterfaceMismatch && (
                          <>
                            <li>The backend canister may need to be redeployed</li>
                            <li>There may be a network connectivity issue</li>
                            <li>The canister bindings may be out of sync</li>
                          </>
                        )}
                      </ul>
                      <p className="font-semibold mt-3">To resolve:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Try clicking "Retry" below</li>
                        <li>Verify the backend canister is running</li>
                        <li>Check that the latest backend code has been deployed</li>
                        <li>If the issue persists, try refreshing the page</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/' })}
              >
                Back to Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show access denied if authenticated but not admin (only after check is complete)
  if (isSuccess && isAdmin === false) {
    const principalString = getPrincipalString(identity);

    // Check if no admin exists - show setup flow
    if (hasAdminFetched && hasAnyAdmin === false) {
      return (
        <div className="container py-12">
          <Card className="max-w-3xl mx-auto admin-setup-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl admin-card-title">Admin Setup Required</CardTitle>
              <CardDescription>
                No administrator has been configured yet. You can claim admin access now.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="admin-info-alert">
                <Info className="h-5 w-5" />
                <AlertDescription>
                  <p className="font-semibold mb-2">First-time setup</p>
                  <p className="text-sm">
                    This is a one-time action. Once you claim admin access, you'll be able to manage products, 
                    view orders, and configure the system. Only the first person to claim this role will become 
                    the administrator.
                  </p>
                </AlertDescription>
              </Alert>

              {principalString && (
                <div className="bg-muted/50 border rounded-md p-4">
                  <p className="text-sm font-medium mb-2">Your Principal ID:</p>
                  <div className="flex items-start gap-2">
                    <code className="text-xs bg-background px-2 py-1.5 rounded flex-1 break-all font-mono leading-relaxed">
                      {principalString}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (principalString) {
                          try {
                            await navigator.clipboard.writeText(principalString);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          } catch (error) {
                            console.error('Failed to copy principal:', error);
                          }
                        }
                      }}
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

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full admin-action-button"
                  onClick={handleClaimAdmin}
                  disabled={claimInitialAdminMutation.isPending}
                >
                  {claimInitialAdminMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Setting up admin access...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5 mr-2" />
                      Set up admin access
                    </>
                  )}
                </Button>

                {claimInitialAdminMutation.isError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold">Failed to claim admin access</p>
                      <p className="text-sm mt-1">
                        {claimInitialAdminMutation.error instanceof Error
                          ? claimInitialAdminMutation.error.message
                          : 'An unexpected error occurred. Please try again.'}
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate({ to: '/' })}
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Admin exists but user is not admin - show access denied
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
        <Alert variant="destructive" className="max-w-3xl mx-auto admin-access-denied-alert">
          <ShieldAlert className="h-5 w-5" />
          <AlertDescription className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 admin-alert-title">Access Denied</h3>
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
                        Admin access is controlled by the backend authorization system. Your account is authenticated but does not have admin privileges.
                      </p>
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 mt-2">
                        <p className="font-semibold text-amber-700 dark:text-amber-400">⚠️ Draft vs Live Environment</p>
                        <p className="mt-1">
                          Draft and Live deployments run on <strong>different backend canisters</strong> with separate admin configurations. 
                          If you have admin access in Draft but not in Live (or vice versa), this is expected behavior. 
                          Each environment maintains its own independent admin state.
                        </p>
                        <p className="mt-1.5 font-medium">
                          When reporting access issues, please specify which environment (Draft or Live) you're trying to access.
                        </p>
                      </div>
                      <p className="font-semibold mt-3">How to get admin access:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Contact the system administrator for this environment</li>
                        <li>Provide them with your Principal ID (shown above)</li>
                        <li>They can grant you admin access through the backend</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking Again...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Again
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/' })}
              >
                Back to Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If we've successfully verified admin status and user is admin, show the dashboard
  if (isSuccess && isAdmin === true) {
    return <>{children}</>;
  }

  // Fallback: should not reach here, but show loading as safe default
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
