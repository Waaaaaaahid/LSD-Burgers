import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, MenuItem, CustomizationGroup } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: MenuItem, quantity: number, customizations: CustomizationGroup[]) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'lsd-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue['addItem'] = (item, quantity, customizations) => {
    const cartItemId = `${item.id}-${JSON.stringify(customizations)}`;
    const itemTotal = (item.price + customizations.reduce((sum, g) => {
      return sum + g.options.reduce((s, o) => s + o.price, 0);
    }, 0)) * quantity;

    setItems((prev) => {
      const existing = prev.find((ci) => ci.id === cartItemId);
      if (existing) {
        return prev.map((ci) =>
          ci.id === cartItemId
            ? { ...ci, quantity: ci.quantity + quantity, item_total: ci.item_total + itemTotal }
            : ci
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          menu_item_id: item.id,
          name: item.name,
          image_url: item.image_url,
          price: item.price,
          quantity,
          customizations,
          item_total: itemTotal,
        },
      ];
    });
  };

  const removeItem: CartContextValue['removeItem'] = (cartItemId) => {
    setItems((prev) => prev.filter((ci) => ci.id !== cartItemId));
  };

  const updateQuantity: CartContextValue['updateQuantity'] = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((ci) => {
        if (ci.id !== cartItemId) return ci;
        const unitPrice = ci.price + ci.customizations.reduce((sum, g) => {
          return sum + g.options.reduce((s, o) => s + o.price, 0);
        }, 0);
        return { ...ci, quantity, item_total: unitPrice * quantity };
      })
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, ci) => sum + ci.item_total, 0);
  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
