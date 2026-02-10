import { Smartphone, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetAllProducts } from '../../hooks/useQueries';
import { sampleProducts } from '../../content/sampleContent';
import { formatINR } from '../../utils/formatCurrency';
import SampleCatalogNotice from '../catalog/SampleCatalogNotice';

export default function AppProductList() {
  const { data: backendProducts, isLoading, isError, refetch, isFetched } = useGetAllProducts();

  // Use backend products if fetched and available, otherwise fall back to sample products
  const products = (isFetched && backendProducts && backendProducts.length > 0) ? backendProducts : sampleProducts;
  const showingSampleData = isFetched && (!backendProducts || backendProducts.length === 0);

  // Error State
  if (isError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load products. Please try again.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="flex gap-4 p-4">
              <div className="w-20 h-20 bg-muted rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-6 bg-muted rounded animate-pulse w-1/3 mt-2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty State (only when both backend and sample products are empty)
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <Smartphone className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Products Available</h3>
        <p className="text-muted-foreground mb-4">
          No products are currently available. Please refresh or check back later.
        </p>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Products
        </Button>
      </div>
    );
  }

  // Products List
  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Product Catalog</h2>
        <Badge variant="secondary">{products.length} items</Badge>
      </div>

      {showingSampleData && (
        <div className="mb-4">
          <SampleCatalogNotice />
        </div>
      )}

      {products.map((product) => (
        <Card 
          key={Number(product.id)} 
          className="overflow-hidden hover:shadow-md transition-shadow"
          tabIndex={0}
        >
          <div className="flex gap-4 p-4">
            {/* Product Image Placeholder */}
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-10 w-10 text-primary/60" />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-xs">{product.category}</Badge>
                <Badge variant="secondary" className="text-xs">{product.brand}</Badge>
              </div>
              <h3 className="font-semibold text-base line-clamp-1 mb-1">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {product.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-bold text-primary">
                  {formatINR(product.price)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
