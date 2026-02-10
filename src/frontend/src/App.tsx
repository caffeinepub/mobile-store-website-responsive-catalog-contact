import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AppPage from './pages/AppPage';
import ProductQuantityPage from './pages/ProductQuantityPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderPlacedPage from './pages/OrderPlacedPage';
import AdminPage from './pages/AdminPage';

// Layout component with header, footer, and watermark
function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 relative">
        <div className="watermark-overlay" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

// Define routes
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsPage,
});

const productQuantityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$productId',
  component: ProductQuantityPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const orderPlacedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-placed/$orderId',
  component: OrderPlacedPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services',
  component: ServicesPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: AppPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  productQuantityRoute,
  checkoutRoute,
  orderPlacedRoute,
  servicesRoute,
  aboutRoute,
  contactRoute,
  appRoute,
  adminRoute,
]);

// Create router
const router = createRouter({ routeTree });

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
