'use client';
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Interfaces
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

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, cantidad: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemsCount: () => number;
}

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}

// Proveedor del contexto
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('strixCart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error al cargar el carrito:', error);
          localStorage.removeItem('strixCart');
        }
      }
    }
  }, []);
  
  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (typeof window !== 'undefined' && cartItems.length > 0) {
      localStorage.setItem('strixCart', JSON.stringify(cartItems));
    }
  }, [cartItems]);
  
  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      // Verificar si el item ya existe en el carrito
      const existingItemIndex = prevItems.findIndex(i => i.variantId === item.variantId);
      
      if (existingItemIndex !== -1) {
        // Si existe, actualizar la cantidad
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].cantidad += item.cantidad;
        return updatedItems;
      } else {
        // Si no existe, agregar nuevo item
        return [...prevItems, item];
      }
    });
  };
  
  const removeFromCart = (variantId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
    
    // Si el carrito queda vacío, eliminar del localStorage
    if (cartItems.length === 1 && typeof window !== 'undefined') {
      localStorage.removeItem('strixCart');
    }
  };
  
  const updateQuantity = (variantId: number, cantidad: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.variantId === variantId 
          ? { ...item, cantidad: Math.max(1, cantidad) } 
          : item
      )
    );
  };
  
  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('strixCart');
    }
  };
  
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };
  
  const getItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.cantidad, 0);
  };
  
  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getCartTotal,
      getItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider; 