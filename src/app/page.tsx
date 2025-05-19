'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Componente de partícula flotante
const FloatingParticle = ({ delay, size, left, top, color }: 
  { delay: number, size: number, left: string, top: string, color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: [0.2, 0.5, 0.2], 
      y: [0, -15, 0],
      x: [0, 5, 0, -5, 0]
    }}
    transition={{ 
      duration: 5,
      delay,
      repeat: Infinity,
      repeatType: 'reverse'
    }}
    style={{
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: color,
      filter: 'blur(4px)',
      left,
      top,
      zIndex: 1
    }}
  />
);

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Simular un tiempo de carga para mostrar animación inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Variantes para animaciones de contenido
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };
  
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--color-black)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Fondo con degradado */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(162,89,255,0.15) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0
        }} 
      />
      
      {/* Elementos de decoración con animación mejorada */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0.4, 0.6, 0.4], 
          scale: [0.95, 1, 0.95],
          rotate: [42, 47, 42] 
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '30%',
          background: 'linear-gradient(135deg, rgba(255,106,0,0.1), rgba(162,89,255,0.1))',
          filter: 'blur(60px)',
          top: '30%',
          left: '20%',
          zIndex: 1
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0.3, 0.5, 0.3], 
          scale: [0.95, 1, 0.95],
          rotate: [-27, -33, -27] 
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          borderRadius: '30%',
          background: 'linear-gradient(135deg, rgba(162,89,255,0.1), rgba(255,106,0,0.1))',
          filter: 'blur(50px)',
          bottom: '20%',
          right: '25%',
          zIndex: 1
        }}
      />
      
      {/* Partículas flotantes */}
      {isLoaded && (
        <>
          <FloatingParticle delay={0} size={8} left="25%" top="30%" color="rgba(255,106,0,0.6)" />
          <FloatingParticle delay={1.5} size={6} left="70%" top="25%" color="rgba(162,89,255,0.6)" />
          <FloatingParticle delay={0.8} size={10} left="40%" top="70%" color="rgba(162,89,255,0.5)" />
          <FloatingParticle delay={2.2} size={12} left="80%" top="60%" color="rgba(255,106,0,0.5)" />
          <FloatingParticle delay={1.2} size={5} left="20%" top="50%" color="rgba(255,255,255,0.5)" />
          <FloatingParticle delay={3} size={7} left="60%" top="40%" color="rgba(255,255,255,0.4)" />
          <FloatingParticle delay={0.5} size={4} left="85%" top="20%" color="rgba(162,89,255,0.7)" />
          <FloatingParticle delay={2.5} size={9} left="30%" top="80%" color="rgba(255,106,0,0.4)" />
        </>
      )}
      
      {/* Línea superior decorativa */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '40%', opacity: 0.3 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{
          position: 'absolute',
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(162,89,255,0.8), transparent)',
          top: '20%',
          zIndex: 1
        }}
      />
      
      {/* Línea inferior decorativa */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '30%', opacity: 0.3 }}
        transition={{ duration: 1, delay: 0.8 }}
        style={{
          position: 'absolute',
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(255,106,0,0.8), transparent)',
          bottom: '20%',
          zIndex: 1
        }}
      />
      
      {/* Contenido con animaciones secuenciales */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ 
          zIndex: 10, 
          textAlign: 'center', 
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Título principal integrado con animación sutil */}
        <motion.div
          variants={itemVariants}
          style={{
            position: 'relative',
            marginBottom: '2rem',
            padding: '0.5rem 1rem',
          }}
        >
          {/* Resplandor detrás del título */}
          <motion.div
            animate={{ 
              opacity: [0.5, 0.7, 0.5],
              scale: [1, 1.01, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(255,106,0,0.15), rgba(162,89,255,0.15), transparent 70%)',
              filter: 'blur(15px)',
              top: '0',
              left: '0',
              zIndex: 0,
              transform: 'translateZ(0)'
            }}
          />
          
          {/* Título con animación sutil */}
          <motion.h1
            animate={{ 
              opacity: [0.9, 1, 0.9],
              textShadow: [
                '0 0 15px rgba(255,106,0,0.3)',
                '0 0 20px rgba(162,89,255,0.3)',
                '0 0 15px rgba(255,106,0,0.3)'
              ]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
            style={{
              fontSize: '4.5rem',
              fontWeight: 800,
              lineHeight: '1.1',
              background: 'linear-gradient(135deg, var(--color-orange), var(--color-violet), var(--color-orange))',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 5px 30px rgba(0,0,0,0.5)',
              position: 'relative',
              zIndex: 2,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Strix Clothes
          </motion.h1>
        </motion.div>
        
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: '1.2rem',
            color: 'var(--color-white)',
            opacity: 0.8,
            marginBottom: '2.5rem',
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          La mejor ropa urbana nocturna
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 10px 30px rgba(255,106,0,0.3)',
              background: 'linear-gradient(135deg, #ff8c00, var(--color-orange))'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/catalogo')}
            style={{
              background: 'linear-gradient(135deg, var(--color-orange), #ff8c00)',
              color: 'var(--color-black)',
              border: 'none',
              borderRadius: '2rem',
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 5px 20px rgba(255,106,0,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            Ver Catálogo
          </motion.button>
        </motion.div>
        
        {/* Pequeño subtext animado */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2, duration: 1 }}
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-white)',
            marginTop: '2rem',
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          Diseños únicos con estilo urbano
        </motion.p>
      </motion.div>
    </div>
  );
}
