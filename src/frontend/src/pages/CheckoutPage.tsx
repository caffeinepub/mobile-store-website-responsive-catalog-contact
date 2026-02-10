import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ShoppingCart, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGetProduct, usePlaceOrder } from '../hooks/useQueries';
import { formatINR } from '../utils/formatCurrency';
import { safeParseBigInt, safeParsePositiveInt } from '../utils/safeParse';
import type { CustomerDetails, OrderItem } from '../backend';

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const navigate = useNavigate();
  const search = useSearch({ from: '/checkout' }) as { productId?: string; quantity?: string };
  
  const [formData, setFormData] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<CustomerDetails>>({});

  const productId = safeParseBigInt(search.productId);
  const quantity = safeParsePositiveInt(search.quantity);

  const { data: product, isLoading: productLoading, isError: productError } = useGetProduct(productId);
  const placeOrderMutation = usePlaceOrder();

  useEffect(() => {
    if (!productId || !quantity) {
      navigate({ to: '/products' });
    }
  }, [productId, quantity, navigate]);

  const validateForm = (): boolean => {
    const errors: Partial<CustomerDetails> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !product || !quantity) return;

    const orderItems: OrderItem[] = [
      {
        productId: product.id,
        quantity: BigInt(quantity),
        price: product.price,
      },
    ];

    try {
      const orderId = await placeOrderMutation.mutateAsync({
        customerDetails: formData,
        items: orderItems,
      });

      navigate({
        to: '/order-placed/$orderId',
        params: { orderId: orderId.toString() },
      });
    } catch (error) {
      console.error('Order placement failed:', error);
    }
  };

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (productLoading) {
    return (
      <div className="container py-12">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading product details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (productError || !product || !quantity) {
    return (
      <div className="container py-12">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Invalid checkout parameters. Please select a product first.</span>
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
        onClick={() => navigate({ to: '/products/$productId', params: { productId: product.id.toString() } })}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>
                  Please provide your contact information to complete the order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className={formErrors.name ? 'border-destructive' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-destructive">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 9937070901"
                      className={formErrors.phone ? 'border-destructive' : ''}
                    />
                    {formErrors.phone && (
                      <p className="text-sm text-destructive">{formErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className={formErrors.email ? 'border-destructive' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-destructive">{formErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      className={formErrors.address ? 'border-destructive' : ''}
                    />
                    {formErrors.address && (
                      <p className="text-sm text-destructive">{formErrors.address}</p>
                    )}
                  </div>

                  {placeOrderMutation.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to place order. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={placeOrderMutation.isPending}
                  >
                    {placeOrderMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/5 to-primary/20 rounded flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="h-8 w-8 text-primary/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">{formatINR(product.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatINR(lineTotal)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
