import { Wrench, Unlock, Battery, ShoppingBag, RefreshCw, Headphones } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { sampleServices } from '../content/sampleContent';

const iconMap = {
  repair: Wrench,
  unlock: Unlock,
  battery: Battery,
  accessories: ShoppingBag,
  trade: RefreshCw,
  support: Headphones,
};

export default function ServicesPage() {
  useDocumentTitle('Services');

  return (
    <div className="container py-12">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Our Services</h1>
        <p className="text-lg text-muted-foreground">
          Professional mobile services to keep your devices running smoothly. From repairs to upgrades, we've got you covered.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {sampleServices.map((service) => {
          const Icon = iconMap[service.icon as keyof typeof iconMap] || Wrench;
          
          return (
            <Card key={service.id} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Why Choose Our Services */}
      <section className="bg-muted/30 rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Why Choose Our Services?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Expert Technicians</h3>
              <p className="text-sm text-muted-foreground">
                Our certified technicians have years of experience with all major brands
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Quality Parts</h3>
              <p className="text-sm text-muted-foreground">
                We use only genuine or high-quality aftermarket parts for all repairs
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Fast Turnaround</h3>
              <p className="text-sm text-muted-foreground">
                Most repairs completed same-day, with a warranty on all work
              </p>
            </div>
          </div>
          <div className="pt-4">
            <Button asChild size="lg">
              <Link to="/contact">
                Get a Quote
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
