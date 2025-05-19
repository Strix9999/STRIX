'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Perfil() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
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
            Cargando perfil...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  const UserInfo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        width: '100%',
        padding: '2rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a259ff, #4b00b2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: '#fff',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            boxShadow: '0 10px 20px rgba(162, 89, 255, 0.2)'
          }}
        >
          {user.email ? user.email[0].toUpperCase() : 'U'}
        </motion.div>
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            color: '#fff', 
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '1.8rem', 
            marginBottom: '0.5rem' 
          }}>
            Bienvenido
          </h2>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '1.1rem',
            fontFamily: "'Poppins', sans-serif",
            maxWidth: 400 
          }}>
            {user.email}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const Dashboard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        width: '100%',
        padding: '0 2rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem'
      }}
    >
      <StatsCard 
        title="Pedidos" 
        value="0" 
        icon="📦" 
        color="#9747FF"
        delay={0}
      />
      <StatsCard 
        title="Favoritos" 
        value="0" 
        icon="❤️" 
        color="#FF4D76"
        delay={0.1}
      />
      <StatsCard 
        title="Reseñas" 
        value="0" 
        icon="⭐" 
        color="#FFB547"
        delay={0.2}
      />
    </motion.div>
  );

  const StatsCard = ({ title, value, icon, color, delay }: { 
    title: string; 
    value: string; 
    icon: string; 
    color: string; 
    delay: number 
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: `0 8px 25px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)` 
      }}
      style={{
        background: 'rgba(30, 30, 30, 0.6)',
        borderRadius: '1rem',
        padding: '1.5rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05)',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ 
          fontSize: '1rem', 
          color: 'rgba(255,255,255,0.7)',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 500
        }}>
          {title}
        </span>
        <span style={{ 
          width: 40, 
          height: 40, 
          borderRadius: '12px', 
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem'
        }}>
          {icon}
        </span>
      </div>
      <div>
        <h3 style={{ 
          fontSize: '2rem', 
          fontWeight: 700, 
          color: '#fff',
          fontFamily: "'Montserrat', sans-serif",
          marginBottom: '0.25rem'
        }}>
          {value}
        </h3>
        <div style={{ 
          width: '100%', 
          height: 3, 
          background: `${color}40`,
          borderRadius: 10,
          marginTop: '0.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '30%' }}
            transition={{ duration: 1, delay: delay + 0.3 }}
            style={{ 
              height: '100%', 
              background: color,
              borderRadius: 10
            }}
          />
        </div>
      </div>
    </motion.div>
  );

  const Actions = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      style={{
        width: '100%',
        padding: '0 2rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}
    >
      <ActionButton 
        text="Historial de pedidos"
        icon="📋"
        href="/perfil/historial"
        color="#a259ff"
        delay={0}
      />
      <ActionButton 
        text="Editar perfil"
        icon="✏️"
        href="/perfil/editar"
        color="#a259ff"
        delay={0.1}
      />
      <ActionButton 
        text="Cerrar sesión"
        icon="🚪"
        onClick={handleLogout}
        color="#ff4d4d"
        delay={0.2}
      />
    </motion.div>
  );

  const ActionButton = ({ text, icon, href, onClick, color, delay }: { 
    text: string; 
    icon: string; 
    href?: string; 
    onClick?: () => void; 
    color: string; 
    delay: number 
  }) => {
    const ButtonContent = () => (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        whileHover={{ 
          scale: 1.03,
          backgroundColor: `${color}20`
        }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(25, 25, 25, 0.6)',
          backdropFilter: 'blur(8px)',
          padding: '1rem 1.25rem',
          borderRadius: '0.8rem',
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ 
          width: 36, 
          height: 36, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: `${color}20`, 
          borderRadius: '0.7rem',
          fontSize: '1.2rem'
        }}>
          {icon}
        </span>
        <span style={{ 
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 500,
          fontSize: '0.95rem',
          color: '#fff'
        }}>
          {text}
        </span>
      </motion.div>
    );

    return href ? (
      <Link href={href} style={{ textDecoration: 'none' }}>
        <ButtonContent />
      </Link>
    ) : (
      <div onClick={onClick}>
        <ButtonContent />
      </div>
    );
  };

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
        transition={{ duration: 0.5, delay: 0.1 }}
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
          Mi Cuenta
      </h1>
        <div style={{
          display: 'flex',
          gap: '1rem'
        }}>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: activeTab === 'resumen' ? '#a259ff' : 'rgba(162, 89, 255, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: activeTab === 'resumen' ? '#a259ff' : 'transparent',
              border: `1px solid ${activeTab === 'resumen' ? '#a259ff' : 'rgba(162, 89, 255, 0.2)'}`,
              color: activeTab === 'resumen' ? 'white' : '#a259ff',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.7rem',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('resumen')}
          >
            Resumen
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: activeTab === 'pedidos' ? '#a259ff' : 'rgba(162, 89, 255, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: activeTab === 'pedidos' ? '#a259ff' : 'transparent',
              border: `1px solid ${activeTab === 'pedidos' ? '#a259ff' : 'rgba(162, 89, 255, 0.2)'}`,
              color: activeTab === 'pedidos' ? 'white' : '#a259ff',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.7rem',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('pedidos')}
          >
            Pedidos
          </motion.button>
        </div>
      </motion.div>

      <div style={{ padding: '1rem 0' }}>
        {activeTab === 'resumen' && (
          <>
            <UserInfo />
            <Dashboard />
            <Actions />
          </>
        )}
        
        {activeTab === 'pedidos' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                width: '100%',
                maxWidth: 500,
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
                  Cuando realices compras, podrás ver aquí el estado de tus pedidos y seguir su entrega.
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
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.section>
  );
} 