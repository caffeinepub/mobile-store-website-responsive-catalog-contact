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
      <div className="container py-12 admin-container">
        <div className="mb-8 admin-header">
          <h1 className="text-4xl font-bold tracking-tight mb-2 admin-title">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground admin-subtitle">Manage orders and products</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="admin-tabs">
          <TabsList className="mb-6 admin-tabs-list">
            <TabsTrigger value="orders" className="admin-tab-trigger">
              Orders
            </TabsTrigger>
            <TabsTrigger value="import" className="admin-tab-trigger">
              Import Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="admin-tab-content">
            <AdminOrdersTable />
          </TabsContent>

          <TabsContent value="import" className="admin-tab-content">
            <ProductImportPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}
