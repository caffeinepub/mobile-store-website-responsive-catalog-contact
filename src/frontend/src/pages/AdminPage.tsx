import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import AdminGuard from '../components/admin/AdminGuard';
import AdminOrdersTable from '../components/admin/AdminOrdersTable';
import ProductImportPanel from '../components/admin/ProductImportPanel';

export default function AdminPage() {
  useDocumentTitle('Admin Dashboard');
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <AdminGuard>
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage orders and products
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="import">Import Products</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <AdminOrdersTable />
          </TabsContent>

          <TabsContent value="import">
            <ProductImportPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}
