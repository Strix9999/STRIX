'use client';
import { createContext, useContext, useState, useMemo } from 'react';

export interface CartItem {
  variantId: number;
  productId: number;
  nombre: string;
  precio: number;
  talla: string;
  color: string;
  colorHex: string;
  cantidad: number;
}

export interface Coupon {
  codigo: string;
  descuento: number; // Porcentaje de descuento (0-100)
  tipo: 'porcentaje' | 'monto';
  minimo?: number; // Monto mínimo de compra para aplicar (opcional)
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, cantidad: number) => void;
  coupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.variantId === item.variantId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].cantidad += item.cantidad;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (variantId: number) => {
    setCart(prev => prev.filter(i => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: number, cantidad: number) => {
    if (cantidad < 1) return;
    setCart(prev => 
      prev.map(item => 
        item.variantId === variantId ? { ...item, cantidad } : item
      )
    );
  };

  const applyCoupon = (newCoupon: Coupon) => {
    setCoupon(newCoupon);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const value = useMemo(() => ({ 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart
  }), [cart, coupon]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
} 