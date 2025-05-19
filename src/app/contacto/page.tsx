'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaWhatsapp, FaArrowLeft } from 'react-icons/fa';

export default function Contacto() {
  const whatsappNumeros = [
    { numero: '+543854717831', display: '+54 3854717831' },
    { numero: '+543856188282', display: '+54 3856188282' }
  ];

  const abrirWhatsapp = (numero: string) => {
    const mensaje = encodeURIComponent('Hola, estoy interesado en los productos de Strix Clothes.');
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
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
        maxWidth: 800,
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
          Contacto
        </h1>
        <Link href="/">
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
            <FaArrowLeft style={{ fontSize: '0.9rem' }} />
            Volver
          </motion.button>
        </Link>
      </motion.div>

      <div style={{ padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginBottom: '2.5rem'
          }}
        >
          <h2 style={{
            color: 'white',
            fontSize: '1.4rem',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            ¿Tienes alguna duda sobre nuestros productos?
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '1rem',
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Contáctanos directamente a través de WhatsApp y estaremos encantados de ayudarte con cualquier consulta sobre nuestros productos, envíos o disponibilidad.
          </p>
        </motion.div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {whatsappNumeros.map((contacto, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => abrirWhatsapp(contacto.numero)}
              style={{
                background: 'rgba(30, 30, 30, 0.6)',
                borderRadius: '1rem',
                padding: '1.6rem',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem'
              }}>
                <div style={{
                  backgroundColor: 'rgba(37, 211, 102, 0.15)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaWhatsapp style={{ fontSize: '1.6rem', color: '#25D366' }} />
                </div>
                <div>
                  <h3 style={{
                    color: 'white',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    marginBottom: '0.3rem'
                  }}>
                    {index === 0 ? 'Atención al cliente' : 'Ventas mayoristas'}
                  </h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '0.95rem'
                  }}>
                    {contacto.display}
                  </p>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.1, x: -5 }}
                style={{
                  color: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1.1rem'
                }}
              >
                Chatear
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginLeft: '0.5rem' }}
                >
                  <path 
                    d="M14 16L18 12L14 8" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M6 12H18" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            background: 'rgba(162, 89, 255, 0.1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginTop: '2rem',
            border: '1px solid rgba(162, 89, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{
            minWidth: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(162, 89, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            💡
          </div>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.95rem',
            lineHeight: 1.6
          }}>
            Estamos disponibles de Lunes a Viernes de 9:00 a 18:00 hrs. Respondemos los mensajes dentro de las 24 horas.
          </p>
        </motion.div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
      `}</style>
    </motion.section>
  );
} 