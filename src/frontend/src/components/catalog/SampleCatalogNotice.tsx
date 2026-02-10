import { AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function SampleCatalogNotice() {
  return (
    <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
        <span className="text-amber-900 dark:text-amber-100">
          Showing sample products. Import your products from the admin dashboard to display your real catalog.
        </span>
        <Button asChild variant="outline" size="sm" className="border-amber-600 text-amber-700 hover:bg-amber-100 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-950">
          <Link to="/admin">
            Go to Admin
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
