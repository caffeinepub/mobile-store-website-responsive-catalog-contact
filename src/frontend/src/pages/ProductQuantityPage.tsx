import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Smartphone, Minus, Plus, ShoppingCart, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGetProduct } from '../hooks/useQueries';
import { formatINR } from '../utils/formatCurrency';
import { safeParseBigInt, isValidQuantity } from '../utils/safeParse';

export default function ProductQuantityPage() {
  const { productId } = useParams({ from: '/products/$productId' });
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const productIdBigInt = safeParseBigInt(productId);
  const { data: product, isLoading, isError } = useGetProduct(productIdBigInt);

  useDocumentTitle(product ? product.name : 'Product Details');

  useEffect(() => {
    if (!productIdBigInt) {
      navigate({ to: '/products' });
    }
  }, [productIdBigInt, navigate]);

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1) {
      setQuantity(num);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleProceedToCheckout = () => {
    if (!product || !isValidQuantity(quantity)) return;
    
    navigate({
      to: '/checkout',
      search: {
        productId: product.id.toString(),
        quantity: quantity.toString(),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <Card className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="aspect-square bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              <div className="h-12 bg-muted rounded animate-pulse" />
              <div className="h-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container py-12">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Product not found or failed to load.</span>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: '/products' })}>
              Back to Products
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const lineTotal = BigInt(quantity) * product.price;

  return (
    <div className="container py-12">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        onClick={() => navigate({ to: '/products' })}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <Card className="max-w-4xl mx-auto overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Product Image */}
          <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/20 rounded-lg flex items-center justify-center">
            <Smartphone className="h-48 w-48 text-primary/40" />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{product.category}</Badge>
                <Badge variant="secondary">{product.brand}</Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
              <p className="text-muted-foreground">
                {product.description || 'Premium quality product'}
              </p>
            </div>

            <div className="border-t pt-6">
              <div className="text-3xl font-bold text-primary mb-6">
                {formatINR(product.price)}
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-24 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Line Total */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatINR(lineTotal)}
                  </span>
                </div>
              </div>

              {/* Proceed Button */}
              <Button
                size="lg"
                className="w-full mt-6"
                onClick={handleProceedToCheckout}
                disabled={!isValidQuantity(quantity)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
