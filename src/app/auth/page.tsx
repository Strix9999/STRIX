'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  
  // Redirigir si ya está logueado
  useEffect(() => {
    if (user) {
      router.push('/perfil');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSuccess('¡Inicio de sesión exitoso!');
        setTimeout(() => router.push('/perfil'), 1000);
      } else {
        // Validaciones para registro
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`
          }
        });
        
        if (error) throw error;
        setSuccess('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      setError(error.message || (isLogin ? 'Error al iniciar sesión' : 'Error al registrarse'));
    } finally {
      setLoading(false);
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  const flipVariants = {
    front: { 
      rotateY: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    back: { 
      rotateY: 180,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const switchForm = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setConfirmPassword('');
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: '3rem auto',
      perspective: 1500, // Añade perspectiva para efecto 3D
    }}>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          padding: '2.5rem',
          background: 'rgba(25, 25, 25, 0.95)',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.05)',
          transformStyle: 'preserve-3d', // Mantiene el efecto 3D en elementos hijos
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isLogin ? (
            <motion.div
              key="login"
              variants={flipVariants}
              initial="back"
              animate="front"
              exit="back"
              style={{
                width: '100%',
                backfaceVisibility: 'hidden', // Esconde la parte trasera durante la animación
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Contenido del formulario de login */}
              <h1 style={{
                color: '#a259ff',
                fontSize: '2.2rem',
                marginBottom: '0.5rem',
                textAlign: 'center',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}>
                Bienvenido de vuelta
              </h1>
              
              <p style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '2rem',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.95rem'
              }}>
                Ingresa tus datos para acceder
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  <label
                    htmlFor="email-login"
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '0.9rem',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500
                    }}
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email-login"
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      padding: '1rem',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 16,
                      background: 'rgba(0,0,0,0.2)',
                      color: 'var(--color-white)',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  <label
                    htmlFor="password-login"
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '0.9rem',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500
                    }}
                  >
                    Contraseña
                  </label>
                  <input
                    id="password-login"
                    type="password"
                    required
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      padding: '1rem',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 16,
                      background: 'rgba(0,0,0,0.2)',
                      color: 'var(--color-white)',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                  />
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        color: '#ff4d4d',
                        padding: '0.7rem',
                        background: 'rgba(255,77,77,0.1)',
                        borderRadius: 10,
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        fontFamily: "'Poppins', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="currentColor" />
                      </svg>
                      {error}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        color: '#4caf50',
                        padding: '0.7rem',
                        background: 'rgba(76,175,80,0.1)',
                        borderRadius: 10,
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        fontFamily: "'Poppins', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11.003 16L6.76 11.757L8.174 10.343L11.003 13.172L16.659 7.515L18.074 8.929L11.003 16Z" fill="currentColor" />
                      </svg>
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#b56fff' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: '#a259ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.8rem',
                    padding: '1rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 12px 0 rgba(162,89,255,0.3)',
                    opacity: loading ? 0.7 : 1,
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: '0.2px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  disabled={loading}
                  type="submit"
                >
                  {loading && (
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" fill="white" />
                    </svg>
                  )}
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </motion.button>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  textAlign: 'center',
                  marginTop: '1.8rem',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  ¿No tienes una cuenta?{' '}
                  <motion.button
                    whileHover={{ color: '#b56fff' }}
                    onClick={switchForm}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a259ff',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      padding: 0,
                      fontFamily: "'Poppins', sans-serif"
                    }}
                  >
                    Regístrate
                  </motion.button>
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              variants={flipVariants}
              initial="back"
              animate="front"
              exit="back"
              style={{
                width: '100%',
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Contenido del formulario de registro */}
              <h1 style={{
                color: '#a259ff',
                fontSize: '2.2rem',
                marginBottom: '0.5rem',
                textAlign: 'center',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}>
                Crear cuenta
              </h1>
              
              <p style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '2rem',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.95rem'
              }}>
                Completa el formulario para registrarte
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  <label
                    htmlFor="email-register"
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '0.9rem',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500
                    }}
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email-register"
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      padding: '1rem',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 16,
                      background: 'rgba(0,0,0,0.2)',
                      color: 'var(--color-white)',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  <label
                    htmlFor="password-register"
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '0.9rem',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500
                    }}
                  >
                    Contraseña
                  </label>
                  <input
                    id="password-register"
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      padding: '1rem',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 16,
                      background: 'rgba(0,0,0,0.2)',
                      color: 'var(--color-white)',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  <label
                    htmlFor="confirmPassword"
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '0.9rem',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500
                    }}
                  >
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{
                      padding: '1rem',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 16,
                      background: 'rgba(0,0,0,0.2)',
                      color: 'var(--color-white)',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                  />
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        color: '#ff4d4d',
                        padding: '0.7rem',
                        background: 'rgba(255,77,77,0.1)',
                        borderRadius: 10,
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        fontFamily: "'Poppins', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="currentColor" />
                      </svg>
                      {error}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        color: '#4caf50',
                        padding: '0.7rem',
                        background: 'rgba(76,175,80,0.1)',
                        borderRadius: 10,
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        fontFamily: "'Poppins', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11.003 16L6.76 11.757L8.174 10.343L11.003 13.172L16.659 7.515L18.074 8.929L11.003 16Z" fill="currentColor" />
                      </svg>
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#b56fff' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: '#a259ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.8rem',
                    padding: '1rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 12px 0 rgba(162,89,255,0.3)',
                    opacity: loading ? 0.7 : 1,
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: '0.2px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  disabled={loading}
                  type="submit"
                >
                  {loading && (
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" fill="white" />
                    </svg>
                  )}
                  {loading ? 'Registrando...' : 'Crear cuenta'}
                </motion.button>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  textAlign: 'center',
                  marginTop: '1.8rem',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  ¿Ya tienes una cuenta?{' '}
                  <motion.button
                    whileHover={{ color: '#b56fff' }}
                    onClick={switchForm}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a259ff',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      padding: 0,
                      fontFamily: "'Poppins', sans-serif"
                    }}
                  >
                    Inicia sesión
                  </motion.button>
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          border-color: rgba(162, 89, 255, 0.5) !important;
          box-shadow: 0 0 0 2px rgba(162, 89, 255, 0.2) !important;
        }
      `}</style>
    </div>
  );
} 