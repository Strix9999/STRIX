'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaLock, FaHome, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function AccesoDenegado() {
  const { user } = useAuth();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(22, 22, 22, 0.7)',
        borderRadius: '1.5rem',
        margin: '2rem auto',
        maxWidth: 800,
        overflow: 'hidden',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255, 76, 76, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem'
          }}
        >
          <FaLock style={{ fontSize: '2.5rem', color: '#ff4c4c' }} />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            color: '#ff4c4c',
            fontSize: '2.5rem',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            marginBottom: '1rem'
          }}
        >
          Acceso Denegado
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
            fontFamily: "'Poppins', sans-serif",
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: '0 auto 1.5rem'
          }}
        >
          No tienes permisos para acceder al panel de administración. Esta sección está reservada para los administradores del sitio.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            background: 'rgba(30, 30, 30, 0.6)',
            maxWidth: '600px',
            margin: '2rem auto',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <h2 style={{
            fontSize: '1.3rem',
            color: '#a259ff',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            ¿Qué puedo hacer?
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: "'Poppins', sans-serif",
            lineHeight: 1.6,
            marginBottom: '1rem'
          }}>
            {user ? 
              'Puedes seguir explorando nuestra tienda y disfrutar de todas las funciones disponibles para los usuarios.' : 
              'Si eres administrador, por favor inicia sesión con tus credenciales de administrador.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#b56fff' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.7rem',
                background: '#a259ff',
                color: 'white',
                border: 'none',
                padding: '0.9rem 1.8rem',
                borderRadius: '0.8rem',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(162, 89, 255, 0.2)'
              }}
            >
              <FaHome style={{ fontSize: '1.1rem' }} />
              Ir al inicio
            </motion.button>
          </Link>
          
          <Link href="/catalogo">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 106, 0, 0.9)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.7rem',
                background: '#ff6a00',
                color: 'white',
                border: 'none',
                padding: '0.9rem 1.8rem',
                borderRadius: '0.8rem',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 106, 0, 0.2)'
              }}
            >
              <FaArrowLeft style={{ fontSize: '1.1rem' }} />
              Ver productos
            </motion.button>
          </Link>
        </motion.div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
      `}</style>
    </motion.section>
  );
} 