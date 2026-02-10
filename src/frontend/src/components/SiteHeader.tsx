import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, Smartphone, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import AuthControl from './auth/AuthControl';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'App', href: '/app', icon: Smartphone },
  { name: 'Admin', href: '/admin', icon: Shield },
];

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (href: string) => {
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img 
            src="/assets/generated/mobile-store-logo.dim_512x512.png" 
            alt="SISTER TELESYSTEM Logo" 
            className="h-10 w-10 rounded-lg"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">SISTER TELESYSTEM</span>
            <span className="text-xs text-muted-foreground">Your Mobile Store</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-2 ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.name}
            </Link>
          ))}
          <div className="ml-2 pl-2 border-l">
            <AuthControl />
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <AuthControl />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <img 
                    src="/assets/generated/mobile-store-logo.dim_512x512.png" 
                    alt="SISTER TELESYSTEM Logo" 
                    className="h-12 w-12 rounded-lg"
                  />
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">SISTER TELESYSTEM</span>
                    <span className="text-xs text-muted-foreground">Your Mobile Store</span>
                  </div>
                </div>
                
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 text-base font-medium transition-colors rounded-md flex items-center gap-2 ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    {item.name}
                  </Link>
                ))}
                
                <Separator className="my-2" />
                
                <div className="px-4">
                  <AuthControl />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
