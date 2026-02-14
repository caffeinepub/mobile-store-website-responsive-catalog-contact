import { ArrowLeft, Package, MessageSquare, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

interface AppShellProps {
  children: React.ReactNode;
  activeSection: 'catalog' | 'inquiry' | 'cart';
  onSectionChange: (section: 'catalog' | 'inquiry' | 'cart') => void;
}

export default function AppShell({ children, activeSection, onSectionChange }: AppShellProps) {
  const navigate = useNavigate();

  const sections = [
    { id: 'catalog' as const, label: 'Catalog', icon: Package },
    { id: 'cart' as const, label: 'Cart', icon: ShoppingCart },
    { id: 'inquiry' as const, label: 'Inquiry', icon: MessageSquare },
  ];

  const handleSectionChange = (section: 'catalog' | 'inquiry' | 'cart') => {
    if (section === 'cart') {
      navigate({ to: '/cart' });
    } else {
      onSectionChange(section);
    }
  };

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <div className="app-top-bar">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/mobile-store-logo.dim_512x512.png" 
              alt="SISTER TELESYSTEM" 
              className="h-8 w-8 rounded-lg"
            />
            <span className="font-bold text-lg">SISTER TELESYSTEM</span>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Site</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="app-content">
        {children}
      </div>

      {/* Bottom Navigation */}
      <nav className="app-bottom-nav">
        <div className="container flex items-center justify-around h-16">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`app-nav-button ${isActive ? 'active' : ''}`}
                aria-label={section.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium mt-1">{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
