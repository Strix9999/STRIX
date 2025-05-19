'use client';

import './globals.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="es">
      <body style={{ margin: 0, background: 'var(--color-black)', minHeight: '100vh' }}>
        <AuthProvider>
          <CartProvider>
            {!isAdminRoute && <Navbar />}
            <main style={{ 
              minHeight: '100vh', 
              background: 'var(--color-black)', 
              color: 'var(--color-white)', 
              fontFamily: 'Inter, Arial, Helvetica, sans-serif',
              paddingTop: isAdminRoute ? 0 : undefined
            }}>
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
