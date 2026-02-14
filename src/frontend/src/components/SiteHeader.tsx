import { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Menu, X, ShoppingCart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthControl from './auth/AuthControl';
import { useCart } from '../cart/CartContext';

export default function SiteHeader() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();

  const currentPath = routerState.location.pathname;

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavigation('/')}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">ST</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline-block">SISTER TELESYSTEM</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Button
              key={link.path}
              variant={currentPath === link.path ? 'default' : 'ghost'}
              onClick={() => handleNavigation(link.path)}
            >
              {link.label}
            </Button>
          ))}
          
          {/* Cart Button */}
          <Button
            variant={currentPath === '/cart' ? 'default' : 'ghost'}
            onClick={() => handleNavigation('/cart')}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {itemCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {itemCount}
              </Badge>
            )}
          </Button>

          {/* Admin Button */}
          <Button
            variant={currentPath === '/admin' ? 'default' : 'ghost'}
            onClick={() => handleNavigation('/admin')}
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin
          </Button>

          {/* Auth Control */}
          <AuthControl />
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant={currentPath === link.path ? 'default' : 'ghost'}
                onClick={() => handleNavigation(link.path)}
                className="justify-start"
              >
                {link.label}
              </Button>
            ))}
            
            {/* Cart Button */}
            <Button
              variant={currentPath === '/cart' ? 'default' : 'ghost'}
              onClick={() => handleNavigation('/cart')}
              className="justify-start relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {itemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 px-2 text-xs"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>

            {/* Admin Button */}
            <Button
              variant={currentPath === '/admin' ? 'default' : 'ghost'}
              onClick={() => handleNavigation('/admin')}
              className="justify-start"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>

            {/* Auth Control */}
            <div className="pt-2 border-t">
              <AuthControl />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
