import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Smartphone, Search, Filter, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGetAllProducts } from '../hooks/useQueries';
import { sampleProducts } from '../content/sampleContent';
import { formatINR } from '../utils/formatCurrency';
import SampleCatalogNotice from '../components/catalog/SampleCatalogNotice';
import { useCart } from '../cart/CartContext';
import { toast } from 'sonner';

export default function ProductsPage() {
  useDocumentTitle('Products');
  const navigate = useNavigate();
  const { data: backendProducts, isLoading, isError, refetch, isFetched } = useGetAllProducts();
  const { addItem } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Use backend products if fetched and available, otherwise fall back to sample products
  const allProducts = useMemo(() => {
    if (isFetched && backendProducts && backendProducts.length > 0) {
      return backendProducts;
    }
    return sampleProducts;
  }, [backendProducts, isFetched]);

  const showingSampleData = isFetched && (!backendProducts || backendProducts.length === 0);

  // Extract unique categories and brands
  const categories = useMemo(() => {
    const cats = new Set(allProducts.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [allProducts]);

  const brands = useMemo(() => {
    const brds = new Set(allProducts.map(p => p.brand));
    return ['all', ...Array.from(brds)];
  }, [allProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
      
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [allProducts, searchQuery, selectedCategory, selectedBrand]);

  const handleProductClick = (productId: bigint) => {
    navigate({ to: '/products/$productId/quantity', params: { productId: productId.toString() } });
  };

  const handleQuickAddToCart = (e: React.MouseEvent, product: typeof allProducts[0]) => {
    e.stopPropagation();
    
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

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Our Products</h1>
        <p className="text-lg text-muted-foreground">
          Browse our complete collection of smartphones and accessories
        </p>
      </div>

      {/* Sample Data Notice */}
      {showingSampleData && (
        <div className="mb-6">
          <SampleCatalogNotice />
        </div>
      )}

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          <span>Filter Products</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger id="brand">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>
                    {brand === 'all' ? 'All Brands' : brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || selectedCategory !== 'all' || selectedBrand !== 'all') && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary">
                Search: {searchQuery}
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary">
                Category: {selectedCategory}
              </Badge>
            )}
            {selectedBrand !== 'all' && (
              <Badge variant="secondary">
                Brand: {selectedBrand}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedBrand('all');
              }}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load products. Please try again.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="product-grid">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {allProducts.length === 0 
                  ? 'No products are currently available. Please refresh or check back later.'
                  : 'Try adjusting your filters or search query'}
              </p>
              {allProducts.length === 0 ? (
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Products
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <Card key={Number(product.id)} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div 
                    className="aspect-square bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <Smartphone className="h-24 w-24 text-primary/40 group-hover:scale-110 transition-transform" />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline">{product.category}</Badge>
                      <Badge variant="secondary">{product.brand}</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description || 'Premium quality product'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-primary">
                        {formatINR(product.price)}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleProductClick(product.id)}
                        >
                          Details
                        </Button>
                        <Button 
                          size="sm"
                          className="flex-1"
                          onClick={(e) => handleQuickAddToCart(e, product)}
                        >
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
