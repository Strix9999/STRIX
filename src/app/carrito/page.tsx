'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

export default function Carrito() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [processingOrder, setProcessingOrder] = useState(false);
  
  const handleCheckout = () => {
    // Simulación de procesamiento de pago
    setProcessingOrder(true);
    setTimeout(() => {
      clearCart();
      setProcessingOrder(false);
      // Redirigir a una página de confirmación (pendiente de implementar)
      router.push('/pedido-completado');
    }, 2000);
  };
  
  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
          padding: '2rem',
          maxWidth: 1200,
          margin: '0 auto',
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          textAlign: 'center'
        }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ color: 'var(--color-gray)' }}
          >
            <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
            <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
          </svg>
        </motion.div>
        
        <h1 style={{ 
          color: 'var(--color-white)',
          fontSize: '2rem',
          marginBottom: '0.5rem'
        }}>
          Tu carrito está vacío
        </h1>
        
        <p style={{ 
          color: 'var(--color-white)',
          opacity: 0.7,
          maxWidth: 500,
          marginBottom: '2rem'
        }}>
          Parece que aún no has añadido productos a tu carrito. 
          Explora nuestro catálogo para encontrar prendas que te encanten.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/catalogo')}
          style={{
            background: 'var(--color-purple)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: '2rem',
            padding: '1rem 2.5rem',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 12px 0 rgba(162,89,255,0.2)'
          }}
        >
          Ver Catálogo
        </motion.button>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        padding: '2rem',
        maxWidth: 1200,
        margin: '0 auto'
      }}
    >
      <h1 style={{ 
        color: 'var(--color-orange)', 
        fontSize: '2.2rem', 
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Tu Carrito
      </h1>
      
      <div style={{ 
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        gap: '2rem'
      }}>
        {/* Lista de productos */}
        <div style={{ flex: '1 1 65%' }}>
          {cartItems.map((item) => (
            <motion.div
              key={item.variantId}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                gap: '1.5rem',
                padding: '1.5rem',
                marginBottom: '1rem',
                background: 'rgba(26,26,26,0.6)',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              {/* Imagen por ahora simulada con un color */}
              <div style={{ 
                width: 100, 
                height: 120, 
                background: item.colorHex || '#333',
                borderRadius: '0.5rem',
                flexShrink: 0
              }} />
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ 
                      color: 'var(--color-white)',
                      fontSize: '1.2rem',
                      marginBottom: '0.2rem'
                    }}>
                      {item.nombre}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-white)', opacity: 0.8, fontSize: '0.9rem' }}>
                      <span>Talla: {item.talla}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        Color: 
                        <span style={{ 
                          width: 14, 
                          height: 14, 
                          borderRadius: '50%', 
                          background: item.colorHex,
                          display: 'inline-block',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }} />
                        {item.color}
                      </span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, color: 'var(--color-orange)' }}
                    onClick={() => removeFromCart(item.variantId)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-white)',
                      opacity: 0.6,
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    ×
                  </motion.button>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: 'auto'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.variantId, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: item.cantidad > 1 ? 'var(--color-purple)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: item.cantidad > 1 ? 'pointer' : 'not-allowed',
                        color: 'var(--color-white)',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}
                    >
                      −
                    </motion.button>
                    
                    <span style={{ 
                      color: 'var(--color-white)',
                      fontWeight: 600,
                      fontSize: '1rem',
                      width: 30,
                      textAlign: 'center'
                    }}>
                      {item.cantidad}
                    </span>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.variantId, item.cantidad + 1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--color-purple)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--color-white)',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}
                    >
                      +
                    </motion.button>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      color: 'var(--color-orange)',
                      fontWeight: 700,
                      fontSize: '1.2rem'
                    }}>
                      ${(item.precio * item.cantidad).toLocaleString()}
                    </span>
                    {item.cantidad > 1 && (
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--color-white)', 
                        opacity: 0.6 
                      }}>
                        (${item.precio.toLocaleString()} c/u)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Resumen del pedido */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ 
            flex: '1 1 35%',
            background: 'rgba(26,26,26,0.6)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.05)',
            height: 'fit-content',
            position: 'sticky',
            top: '5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <h2 style={{ 
            color: 'var(--color-white)',
            fontSize: '1.5rem',
            marginBottom: '1.5rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            Resumen del Pedido
          </h2>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.8rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-white)', opacity: 0.8 }}>Subtotal</span>
              <span style={{ color: 'var(--color-white)' }}>${getCartTotal().toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-white)', opacity: 0.8 }}>Envío</span>
              <span style={{ color: 'var(--color-white)' }}>Gratis</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              fontWeight: 700
            }}>
              <span style={{ color: 'var(--color-white)' }}>Total</span>
              <span style={{ color: 'var(--color-orange)', fontSize: '1.3rem' }}>
                ${getCartTotal().toLocaleString()}
              </span>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={processingOrder}
              onClick={handleCheckout}
              style={{
                width: '100%',
                background: processingOrder 
                  ? 'rgba(162,89,255,0.5)' 
                  : 'var(--color-purple)',
                color: 'var(--color-white)',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '1rem',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: processingOrder ? 'not-allowed' : 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {processingOrder ? 'Procesando...' : 'Finalizar Compra'}
              
              {processingOrder && (
                <motion.div
                  animate={{ x: ['0%', '100%'] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    ease: 'linear' 
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    zIndex: 1
                  }}
                />
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ opacity: 0.8 }}
              onClick={() => router.push('/catalogo')}
              style={{
                width: '100%',
                background: 'transparent',
                color: 'var(--color-white)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.5rem',
                padding: '0.8rem',
                fontWeight: 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Seguir Comprando
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 