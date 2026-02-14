import { Smartphone, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetAllProducts } from '../../hooks/useQueries';
import { sampleProducts } from '../../content/sampleContent';
import { formatINR } from '../../utils/formatCurrency';
import SampleCatalogNotice from '../catalog/SampleCatalogNotice';
import { useCart } from '../../cart/CartContext';
import { toast } from 'sonner';

export default function AppProductList() {
  const { data: backendProducts, isLoading, isError, refetch, isFetched } = useGetAllProducts();
  const { addItem } = useCart();

  const allProducts = isFetched && backendProducts && backendProducts.length > 0 
    ? backendProducts 
    : sampleProducts;

  const showingSampleData = isFetched && (!backendProducts || backendProducts.length === 0);

  const handleAddToCart = (product: typeof allProducts[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      unitPrice: product.price,
      quantity: 1,
      imageUrl: product.imageUrl ?? undefined,
    });

    toast.success('Added to cart', {
      description: product.name,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <div className="flex gap-4 p-4">
              <div className="w-20 h-20 bg-muted animate-pulse rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load products</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (allProducts.length === 0) {
    return (
      <div className="p-8 text-center">
        <Smartphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Products Available</h3>
        <p className="text-muted-foreground mb-4">
          No products are currently in the catalog.
        </p>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {showingSampleData && (
        <div className="mb-4">
          <SampleCatalogNotice />
        </div>
      )}

      {allProducts.map((product) => (
        <Card key={Number(product.id)} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex gap-4 p-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/5 to-primary/20 rounded flex items-center justify-center shrink-0">
              <Smartphone className="h-10 w-10 text-primary/40" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <Badge variant="outline" className="text-xs">{product.category}</Badge>
                <Badge variant="secondary" className="text-xs">{product.brand}</Badge>
              </div>
              <h3 className="font-semibold line-clamp-1 mb-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {product.description || 'Premium quality product'}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-bold text-primary">
                  {formatINR(product.price)}
                </span>
                <Button 
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
