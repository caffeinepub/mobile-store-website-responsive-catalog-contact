import type { OrderItem } from '../backend';

export interface CartItem {
  productId: bigint;
  name: string;
  brand: string;
  category: string;
  unitPrice: bigint;
  quantity: number;
  imageUrl?: string;
}

export interface CartState {
  items: CartItem[];
}

/**
 * Convert cart items to backend OrderItem format
 */
export function cartItemsToOrderItems(cartItems: CartItem[]): OrderItem[] {
  return cartItems.map(item => ({
    productId: item.productId,
    quantity: BigInt(item.quantity),
    price: item.unitPrice,
  }));
}

/**
 * Calculate total price for cart items
 */
export function calculateCartTotal(items: CartItem[]): bigint {
  return items.reduce((total, item) => {
    return total + (item.unitPrice * BigInt(item.quantity));
  }, BigInt(0));
}

/**
 * Calculate total item count in cart
 */
export function calculateCartCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
