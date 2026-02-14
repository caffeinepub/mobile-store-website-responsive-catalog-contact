import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Package, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import type { OrderInfo } from '../../backend';

interface AdminOrderDetailsDialogProps {
  order: OrderInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminOrderDetailsDialog({ order, open, onOpenChange }: AdminOrderDetailsDialogProps) {
  if (!order) return null;

  const orderDate = new Date(Number(order.timestamp) / 1000000); // Convert nanoseconds to milliseconds

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order #{order.id.toString()}
          </DialogTitle>
          <DialogDescription>
            Complete order details and customer information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Order Date</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {orderDate.toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>

          <Separator />

          {/* Customer Details */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{order.customerDetails.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{order.customerDetails.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{order.customerDetails.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Delivery Address</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {order.customerDetails.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <div key={index} className="flex items-start justify-between gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Product ID: {item.productId.toString()}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Quantity:</span>{' '}
                        <span className="font-medium">{item.quantity.toString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Unit Price:</span>{' '}
                        <span className="font-medium">{formatINR(item.price)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Line Total</p>
                      <p className="font-semibold text-primary">{formatINR(lineTotal)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Order Total */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <span className="text-lg font-semibold">Order Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatINR(order.totalAmount)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
