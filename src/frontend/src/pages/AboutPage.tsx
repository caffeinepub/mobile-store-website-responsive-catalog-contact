import { Award, Users, Clock, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function AboutPage() {
  useDocumentTitle('About Us');

  const values = [
    {
      icon: Award,
      title: 'Quality First',
      description: 'We never compromise on the quality of our products and services',
    },
    {
      icon: Users,
      title: 'Customer Focus',
      description: 'Your satisfaction is our top priority in everything we do',
    },
    {
      icon: Clock,
      title: 'Reliability',
      description: 'Count on us for consistent, dependable service every time',
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'We love what we do and it shows in our work',
    },
  ];

  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">About SISTER TELESYSTEM</h1>
        <p className="text-lg text-muted-foreground">
          Your trusted partner for all things mobile since 2015
        </p>
      </div>

      {/* Story Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                SISTER TELESYSTEM was founded with a simple mission: to provide customers with the best mobile devices and services at competitive prices, backed by exceptional customer support.
              </p>
              <p>
                What started as a small local shop has grown into a trusted destination for mobile enthusiasts and everyday users alike. We've built our reputation on honesty, expertise, and a genuine commitment to helping our customers find the perfect mobile solutions.
              </p>
              <p>
                Today, we continue to evolve with the rapidly changing mobile technology landscape, always staying ahead of the curve to bring you the latest and greatest devices, accessories, and services.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <img 
                src="/assets/generated/mobile-store-logo.dim_512x512.png" 
                alt="SISTER TELESYSTEM" 
                className="h-48 w-48 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Our Values</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            These core principles guide everything we do
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="text-center border-2">
              <CardHeader>
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-lg">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-16 bg-primary text-primary-foreground rounded-2xl p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold">10,000+</div>
            <div className="text-sm opacity-90">Happy Customers</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold">500+</div>
            <div className="text-sm opacity-90">Products Available</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold">9+ Years</div>
            <div className="text-sm opacity-90">In Business</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Ready to Experience the Difference?</h2>
        <p className="text-lg text-muted-foreground">
          Visit us today or get in touch to learn more about how we can help with your mobile needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/products">
              Shop Products
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/contact">
              Contact Us
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
