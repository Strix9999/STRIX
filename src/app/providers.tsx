'use client';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { AnimationProvider } from '../context/AnimationContext';
import Header from '../components/Header';
import { usePathname } from 'next/navigation';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <AuthProvider>
      <CartProvider>
        <AnimationProvider>
          {!isAdmin && <Header />}
          {children}
        </AnimationProvider>
      </CartProvider>
    </AuthProvider>
  );
} 