import { useMemo } from 'react';
import { Package, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetAllOrders } from '../../hooks/useQueries';
import { formatINR } from '../../utils/formatCurrency';

export default function AdminOrdersTable() {
  const { data: orders, isLoading, isError } = useGetAllOrders();

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [orders]);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load orders. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground">
                Orders placed by customers will appear here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Customer Orders
        </CardTitle>
        <CardDescription>
          View and manage all customer orders ({orders.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.map((order) => (
                <TableRow key={order.id.toString()}>
                  <TableCell className="font-mono font-medium">
                    #{order.id.toString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(order.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerDetails.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customerDetails.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{order.customerDetails.phone}</div>
                      <div className="text-muted-foreground line-clamp-2">
                        {order.customerDetails.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          <Badge variant="secondary" className="mr-2">
                            {item.quantity.toString()}x
                          </Badge>
                          <span className="text-muted-foreground">
                            Product #{item.productId.toString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatINR(order.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
