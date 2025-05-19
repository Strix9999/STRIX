'use client';
import { FaShoppingCart } from 'react-icons/fa';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <header style={{
      width: '100%',
      background: 'var(--color-black)',
      borderBottom: '2px solid var(--color-purple)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <nav style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
      }}>
        <a href="/" style={{
          color: 'var(--color-orange)',
          fontWeight: 900,
          fontSize: '1.5rem',
          letterSpacing: '2px',
          textDecoration: 'none',
        }}>
          STRIX
        </a>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="/catalogo" style={{ color: 'var(--color-white)', fontWeight: 600, fontSize: '1.1rem' }}>Catálogo</a>
          <a href="/perfil" style={{ color: 'var(--color-white)', fontWeight: 600, fontSize: '1.1rem' }}>Perfil</a>
          <Link href="/carrito" style={{ position: 'relative', color: 'var(--color-white)' }}>
            <FaShoppingCart size={24} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: 'var(--color-orange)',
                color: 'var(--color-black)',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                boxShadow: '0 2px 8px 0 rgba(255,106,0,0.2)',
              }}>{cartCount}</span>
            )}
          </Link>
          {user ? (
            <>
              <span style={{ color: 'var(--color-white)', fontSize: 15, fontWeight: 600, marginLeft: 12 }}>{user.email}</span>
              <button onClick={logout} style={{ background: 'var(--color-orange)', color: 'var(--color-black)', border: 'none', borderRadius: 8, padding: '0.4rem 1.2rem', fontWeight: 700, marginLeft: 8, cursor: 'pointer' }}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link href="/auth" style={{ color: 'var(--color-orange)', fontWeight: 700, fontSize: 15, marginLeft: 12 }}>
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
} 