import { useState } from 'react';
import { Copy, Check, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { getPrincipalString, truncatePrincipal } from '../../utils/principalFormat';

export default function AuthControl() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const principalString = isAuthenticated ? getPrincipalString(identity) : null;
  const truncatedPrincipal = principalString ? truncatePrincipal(principalString) : null;

  const handleCopyPrincipal = async () => {
    if (!principalString) return;
    
    try {
      await navigator.clipboard.writeText(principalString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy principal:', error);
    }
  };

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      // Clear all cached application data on logout to prevent stale authorization state
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          queryClient.clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
          <span className="text-xs text-muted-foreground">Principal:</span>
          <code className="text-xs font-mono">{truncatedPrincipal}</code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCopyPrincipal}
            title="Copy full principal ID"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAuth}
          disabled={isLoggingIn}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleAuth}
      disabled={isLoggingIn}
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Logging in...
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4 mr-2" />
          Log In
        </>
      )}
    </Button>
  );
}
