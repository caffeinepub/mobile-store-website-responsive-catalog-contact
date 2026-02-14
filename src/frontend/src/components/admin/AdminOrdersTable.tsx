import { useState } from 'react';
import { ShieldAlert, Package, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useGetAllOrders } from '../../hooks/useQueries';
import { formatINR } from '../../utils/formatCurrency';
import AdminOrderDetailsDialog from './AdminOrderDetailsDialog';
import type { OrderInfo } from '../../backend';

export default function AdminOrdersTable() {
  const { data: orders, isLoading, isError, error } = useGetAllOrders();
  const [selectedOrder, setSelectedOrder] = useState<OrderInfo | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleViewDetails = (order: OrderInfo) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const isUnauthorized = isError && error?.message?.includes('Unauthorized');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Loading orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isUnauthorized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Customer orders and details</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Access Denied</p>
              <p className="text-sm">
                You do not have permission to view orders. Only authorized administrators can access this section.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Customer orders and details</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load orders. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Customer orders and details</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">No orders yet</p>
              <p className="text-sm text-muted-foreground">
                Orders placed by customers will appear here.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
          <CardDescription>Customer orders and details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const orderDate = new Date(Number(order.timestamp) / 1000000);
                  return (
                    <TableRow key={order.id.toString()}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">#{order.id.toString()}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerDetails.name}</p>
                          <p className="text-sm text-muted-foreground">{order.customerDetails.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatINR(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {orderDate.toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AdminOrderDetailsDialog
        order={selectedOrder}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </>
  );
}
