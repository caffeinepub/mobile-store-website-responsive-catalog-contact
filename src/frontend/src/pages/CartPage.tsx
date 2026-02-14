import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart, ArrowLeft, Minus, Plus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '../cart/CartContext';
import { calculateCartTotal } from '../cart/cartTypes';
import { formatINR } from '../utils/formatCurrency';

export default function CartPage() {
  useDocumentTitle('Cart');
  const navigate = useNavigate();
  const { items, itemCount, updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (productId: bigint, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 999) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleQuantityInput = (productId: bigint, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1) {
      updateQuantity(productId, num);
    }
  };

  const handleProceedToCheckout = () => {
    navigate({ to: '/checkout' });
  };

  if (items.length === 0) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Your Cart</CardTitle>
            <CardDescription>
              Review your items before checkout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <ShoppingCart className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">
                  Browse our products and add items to your cart to get started.
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => navigate({ to: '/products' })}
              >
                Browse Products
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => navigate({ to: '/' })}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cartTotal = calculateCartTotal(items);

  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const lineTotal = item.unitPrice * BigInt(item.quantity);
              
              return (
                <Card key={item.productId.toString()}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/5 to-primary/20 rounded-lg flex items-center justify-center shrink-0">
                        <Package className="h-10 w-10 text-primary/40" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.brand} • {item.category}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.productId)}
                            className="shrink-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between gap-4 mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max="999"
                              value={item.quantity}
                              onChange={(e) => handleQuantityInput(item.productId, e.target.value)}
                              className="w-16 h-8 text-center"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= 999}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {formatINR(item.unitPrice)} each
                            </div>
                            <div className="font-semibold text-primary">
                              {formatINR(lineTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{formatINR(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-medium">{itemCount}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatINR(cartTotal)}
                  </span>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleProceedToCheckout}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate({ to: '/products' })}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
