'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '@/app/context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { getItemsCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Detectar scroll para cambiar estilo de navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  // Enlaces de navegación
  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
    { name: 'Contacto', path: '/contacto' },
    { name: 'Perfil', path: '/perfil' }
  ];
  
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 100,
        background: 'rgba(17, 17, 17, 1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(25, 25, 25, 0.9)',
        padding: '1rem 2rem'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1300,
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Logo */}
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: '1.8rem',
              color: '#a259ff',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--color-violet), var(--color-orange))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            STRIX
          </motion.div>
        </Link>
        
        {/* Menú de navegación */}
        <nav
          className="desktop-menu"
          style={{
            display: 'flex',
            gap: '2.5rem',
            alignItems: 'center'
          }}
        >
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <motion.span
                whileHover={{ 
                  color: '#a259ff',
                  scale: 1.05
                }}
                style={{
                  color: pathname === link.path ? '#a259ff' : 'var(--color-white)',
                  fontSize: '1rem',
                  fontWeight: pathname === link.path ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  textTransform: 'capitalize',
                  transition: 'all 0.3s'
                }}
              >
                {link.name}
              </motion.span>
            </Link>
          ))}
        </nav>
        
        {/* Carrito */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/carrito')}
          style={{
            position: 'relative',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#a259ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ color: 'white' }}
            >
              <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
          </div>
            
          {getItemsCount() > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                color: '#a259ff',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              {getItemsCount()}
            </motion.div>
          )}
        </motion.div>
        
        {/* Botón de menú móvil */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            zIndex: 101
          }}
          className="mobile-menu-button"
        >
          <motion.div
            animate={{
              rotate: isMobileMenuOpen ? 45 : 0,
              y: isMobileMenuOpen ? 8 : 0
            }}
            style={{
              width: 24,
              height: 2,
              background: 'var(--color-white)',
              borderRadius: 2
            }}
          />
          <motion.div
            animate={{
              opacity: isMobileMenuOpen ? 0 : 1
            }}
            style={{
              width: 24,
              height: 2,
              background: 'var(--color-white)',
              borderRadius: 2
            }}
          />
          <motion.div
            animate={{
              rotate: isMobileMenuOpen ? -45 : 0,
              y: isMobileMenuOpen ? -8 : 0
            }}
            style={{
              width: 24,
              height: 2,
              background: 'var(--color-white)',
              borderRadius: 2
            }}
          />
        </motion.div>
      </div>
      
      {/* Menú móvil desplegable */}
      <motion.div
        className="mobile-menu"
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? 'auto' : 0
        }}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(17, 17, 17, 0.98)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid rgba(25, 25, 25, 0.9)',
          borderBottom: '1px solid rgba(25, 25, 25, 0.9)'
        }}
      >
        {navLinks.map((link) => (
          <Link key={link.path} href={link.path}>
            <motion.div
              whileHover={{ x: 5 }}
              style={{
                padding: '0.8rem 1rem',
                color: pathname === link.path ? '#a259ff' : 'var(--color-white)',
                fontWeight: pathname === link.path ? 600 : 400,
                borderLeft: pathname === link.path 
                  ? '3px solid #a259ff'
                  : '3px solid transparent',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '1rem'
              }}
            >
              {link.name}
            </motion.div>
          </Link>
        ))}
        
        <Link href="/carrito">
          <motion.div
            whileHover={{ x: 5 }}
            style={{
              padding: '0.8rem 1rem',
              color: pathname === '/carrito' ? '#a259ff' : 'var(--color-white)',
              fontWeight: pathname === '/carrito' ? 600 : 400,
              borderLeft: pathname === '/carrito' 
                ? '3px solid #a259ff'
                : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '1rem'
            }}
          >
            <span>Carrito</span>
            {getItemsCount() > 0 && (
              <span style={{
                background: '#a259ff',
                color: '#fff',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                {getItemsCount()}
              </span>
            )}
          </motion.div>
        </Link>
      </motion.div>
      
      {/* Estilos específicos para responsive */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-button {
            display: flex !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
          .mobile-menu-button {
            display: none !important;
          }
        }
      `}</style>
    </motion.header>
  );
} 