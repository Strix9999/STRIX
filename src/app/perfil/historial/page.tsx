'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Pedido {
  id: number;
  estado: string;
  total: number;
  created_at: string;
}
interface Item {
  id: number;
  order_id: number;
  product_id: number;
  cantidad: number;
  precio_unitario: number;
  product_nombre?: string;
}

export default function HistorialPedidos() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [cargando, setCargando] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth');
    if (user) {
      (async () => {
        setCargando(true);
        // Traer pedidos del usuario
        const { data: pedidosData } = await supabase
          .from('orders')
          .select('id, estado, total, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setPedidos(pedidosData || []);
        // Traer items de los pedidos
        if (pedidosData && pedidosData.length > 0) {
          const pedidosIds = pedidosData.map(p => p.id);
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('id, order_id, product_id, cantidad, precio_unitario, products(nombre)')
            .in('order_id', pedidosIds);
          setItems((itemsData || []).map(i => ({ ...i, product_nombre: Array.isArray(i.products) ? i.products[0]?.nombre : i.products?.nombre })));
        } else {
          setItems([]);
        }
        setCargando(false);
      })();
    }
  }, [user, loading, router]);

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return '#FFB547';
      case 'procesando':
        return '#2196F3';
      case 'enviado':
        return '#4CAF50';
      case 'entregado':
        return '#8BC34A';
      case 'cancelado':
        return '#FF5252';
      default:
        return '#a259ff';
    }
  };

  if (loading || cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: '3px solid rgba(162, 89, 255, 0.15)',
            borderTopColor: '#a259ff',
            animation: 'spin 1s linear infinite'
          }}/>
          <p style={{ 
            color: '#a259ff', 
            fontFamily: "'Poppins', sans-serif",
            fontSize: '1rem' 
          }}>
            Cargando historial...
          </p>
        </motion.div>
      </div>
    ); 
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(22, 22, 22, 0.7)',
        borderRadius: '1.5rem',
        margin: '2rem auto',
        maxWidth: 900,
        overflow: 'hidden',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <h1 style={{ 
          color: '#a259ff', 
          fontSize: '1.8rem', 
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700
        }}>
          Historial de Pedidos
        </h1>
        <Link href="/perfil">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(162, 89, 255, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(162, 89, 255, 0.2)',
              color: '#a259ff',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.7rem',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>←</span>
            Volver
          </motion.button>
        </Link>
      </motion.div>

      <div style={{ padding: '1.5rem 2rem' }}>
        {pedidos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              width: '100%',
              background: 'rgba(30, 30, 30, 0.6)',
              borderRadius: '1rem',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(162, 89, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              📦
            </div>
            <div>
              <h3 style={{ 
                color: '#fff', 
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '1.3rem', 
                marginBottom: '0.8rem' 
              }}>
                No hay pedidos todavía
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontFamily: "'Poppins', sans-serif", 
                fontSize: '0.95rem', 
                lineHeight: 1.6,
                maxWidth: 400
              }}>
                Cuando realices compras, podrás ver aquí el historial de tus pedidos y seguir su entrega.
              </p>
            </div>
            <Link href="/catalogo" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#b56fff' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: '#a259ff',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 2rem',
                  borderRadius: '0.8rem',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(162, 89, 255, 0.2)'
                }}
              >
                Ir a comprar
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {pedidos.map((pedido, index) => (
              <motion.div 
                key={pedido.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.01,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.07)' 
                }}
                style={{ 
                  background: 'rgba(30, 30, 30, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div 
                  onClick={() => setExpandedOrder(expandedOrder === pedido.id ? null : pedido.id)}
                  style={{ 
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    borderBottom: expandedOrder === pedido.id ? '1px solid rgba(255,255,255,0.08)' : 'none'
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#fff',
                        fontFamily: "'Montserrat', sans-serif",
                        marginBottom: '0.25rem'
                      }}>
                        Pedido #{pedido.id}
                      </h3>
                      <p style={{ 
                        color: 'rgba(255,255,255,0.6)', 
                        fontSize: '0.9rem',
                        fontFamily: "'Poppins', sans-serif"
                      }}>
                        {new Date(pedido.created_at).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ 
                        padding: '0.4rem 0.8rem',
                        borderRadius: '2rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'white',
                        background: getStatusColor(pedido.estado),
                        fontFamily: "'Poppins', sans-serif",
                        letterSpacing: '0.3px'
                      }}>
                        {pedido.estado}
                      </span>
                      <motion.div
                        animate={{ 
                          rotate: expandedOrder === pedido.id ? 180 : 0 
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 10L12 15L17 10" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '0.9rem'
                    }}>
                      {items.filter(i => i.order_id === pedido.id).length} productos
                    </span>
                    <span style={{ 
                      color: '#a259ff',
                      fontWeight: 700,
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '1.1rem'
                    }}>
                      ${pedido.total}
                    </span>
                  </div>
                </div>

                {expandedOrder === pedido.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ 
                      padding: '0 1.5rem 1.25rem',
                      background: 'rgba(20, 20, 20, 0.3)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      padding: '1rem 0'
                    }}>
                      {items.filter(i => i.order_id === pedido.id).map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.6rem 0.8rem',
                            borderRadius: '0.5rem',
                            background: 'rgba(0,0,0,0.2)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                              width: 36,
                              height: 36,
                              borderRadius: '0.5rem',
                              background: 'rgba(162, 89, 255, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem'
                            }}>
                              🛍️
                            </div>
                            <div>
                              <h4 style={{ 
                                color: '#fff',
                                fontSize: '0.95rem',
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 500,
                                marginBottom: '0.2rem'
                              }}>
                                {item.product_nombre || 'Producto'}
                              </h4>
                              <span style={{ 
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '0.85rem',
                                fontFamily: "'Poppins', sans-serif"
                              }}>
                                {item.cantidad} × ${item.precio_unitario}
                              </span>
                            </div>
                          </div>
                          <span style={{ 
                            color: '#a259ff',
                            fontWeight: 600,
                            fontFamily: "'Montserrat', sans-serif"
                          }}>
                            ${(item.precio_unitario * item.cantidad).toFixed(2)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    <div style={{ 
                      marginTop: '0.75rem',
                      padding: '0.75rem 0',
                      borderTop: '1px dashed rgba(255,255,255,0.1)',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ 
                        color: 'rgba(255,255,255,0.7)',
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      }}>
                        Total del pedido
                      </span>
                      <span style={{ 
                        color: '#a259ff',
                        fontWeight: 700,
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: '1.1rem'
                      }}>
                        ${pedido.total}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.section>
  );
} 