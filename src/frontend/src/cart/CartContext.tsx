import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem, CartState } from './cartTypes';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: bigint, quantity: number) => void;
  removeItem: (productId: bigint) => void;
  clearCart: () => void;
  getItem: (productId: bigint) => CartItem | undefined;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'sister-telesystem-cart';

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Convert string productId and unitPrice back to bigint
    return parsed.map((item: any) => ({
      ...item,
      productId: BigInt(item.productId),
      unitPrice: BigInt(item.unitPrice),
    }));
  } catch (error) {
    console.error('Failed to load cart from storage:', error);
    return [];
  }
}

function saveCartToStorage(items: CartItem[]): void {
  try {
    // Convert bigint to string for JSON serialization
    const serializable = items.map(item => ({
      ...item,
      productId: item.productId.toString(),
      unitPrice: item.unitPrice.toString(),
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Failed to save cart to storage:', error);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());

  // Persist to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const addItem = (newItem: CartItem) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.productId === newItem.productId
      );

      if (existingIndex >= 0) {
        // Item exists, update quantity
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + newItem.quantity,
        };
        return updated;
      } else {
        // New item
        return [...prevItems, newItem];
      }
    });
  };

  const updateQuantity = (productId: bigint, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeItem = (productId: bigint) => {
    setItems(prevItems =>
      prevItems.filter(item => item.productId !== productId)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItem = (productId: bigint): CartItem | undefined => {
    return items.find(item => item.productId === productId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
