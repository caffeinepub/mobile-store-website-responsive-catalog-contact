import { useParams, useNavigate } from '@tanstack/react-router';
import { CheckCircle, Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function OrderPlacedPage() {
  useDocumentTitle('Order Placed');
  const { orderId } = useParams({ from: '/order-placed/$orderId' });
  const navigate = useNavigate();

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="space-y-6 pb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-3xl mb-2">Order Placed Successfully!</CardTitle>
              <CardDescription className="text-base">
                Thank you for your order. We'll contact you shortly to confirm the details.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Order Reference</p>
              <p className="text-2xl font-bold font-mono">#{orderId}</p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                We've received your order and will process it shortly. Our team will reach out to you
                using the contact details you provided.
              </p>
              <p>
                Please keep your order reference number for future correspondence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="default"
                size="lg"
                className="flex-1"
                onClick={() => navigate({ to: '/products' })}
              >
                <Package className="h-5 w-5 mr-2" />
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => navigate({ to: '/' })}
              >
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
