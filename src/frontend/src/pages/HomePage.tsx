import { Link } from '@tanstack/react-router';
import { Smartphone, Shield, Zap, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGetAllProducts } from '../hooks/useQueries';
import { storeInfo, sampleProducts } from '../content/sampleContent';
import { formatINR } from '../utils/formatCurrency';
import SampleCatalogNotice from '../components/catalog/SampleCatalogNotice';

export default function HomePage() {
  useDocumentTitle('Home');
  const { data: backendProducts, isLoading, isFetched } = useGetAllProducts();
  
  // Use backend products if available, otherwise use sample products
  const products = (isFetched && backendProducts && backendProducts.length > 0) ? backendProducts : sampleProducts;
  const featuredProducts = products.slice(0, 4);
  const showingSampleData = isFetched && (!backendProducts || backendProducts.length === 0);

  const features = [
    {
      icon: Shield,
      title: 'Warranty Protection',
      description: 'All products come with manufacturer warranty and our satisfaction guarantee',
    },
    {
      icon: Zap,
      title: 'Fast Service',
      description: 'Same-day repairs and quick turnaround on all services',
    },
    {
      icon: Award,
      title: 'Expert Support',
      description: 'Knowledgeable staff ready to help with all your mobile needs',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-[url('/assets/generated/mobile-store-hero.dim_1600x900.png')] bg-cover bg-center opacity-10" />
        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-1.5">
              Welcome to {storeInfo.name}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {storeInfo.tagline}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              {storeInfo.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-base px-8">
                <Link to="/products">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link to="/services">
                  Our Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Why Choose SISTER TELESYSTEM?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're committed to providing the best mobile shopping experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground text-lg">
                Check out our latest and most popular devices
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/products">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Sample Data Notice */}
          {showingSampleData && (
            <div className="mb-6">
              <SampleCatalogNotice />
            </div>
          )}
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardHeader>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={Number(product.id)} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center">
                    <Smartphone className="h-24 w-24 text-primary/40 group-hover:scale-110 transition-transform" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{product.description || product.brand}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{formatINR(product.price)}</span>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to Upgrade Your Mobile Experience?
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Visit our store today or browse our online catalog to find the perfect device for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="text-base px-8">
              <Link to="/products">
                Browse Products
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 border-primary-foreground/20 hover:bg-primary-foreground/10">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
