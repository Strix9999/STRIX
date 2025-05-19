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

interface FormData {
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  numeracion: string;
  localidad: string;
  provincia: string;
  codigo_postal: string;
}

export default function EditarPerfil() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    numeracion: '',
    localidad: '',
    provincia: '',
    codigo_postal: '',
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth');
    if (user) {
      (async () => {
        setCargando(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) {
          setForm({
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            telefono: data.telefono || '',
            direccion: data.direccion || '',
            numeracion: data.numeracion || '',
            localidad: data.localidad || '',
            provincia: data.provincia || '',
            codigo_postal: data.codigo_postal || '',
          });
        }
        setCargando(false);
      })();
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(false);
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(form)
        .eq('id', user.id);
        
      if (error) throw error;
      setExito(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setExito(false);
      }, 3000);
    } catch (err: any) {
      setError('No se pudo guardar el perfil. Intenta de nuevo.');
    } finally {
      setGuardando(false);
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
            Cargando perfil...
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
          Editar Perfil
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

      <div style={{ padding: '2rem' }}>
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <FormInput
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
              delay={0}
            />
            <FormInput
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Tu apellido"
              required
              delay={0.05}
            />
          </div>
          
          <FormInput
            label="Teléfono"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Tu número de teléfono"
            required
            delay={0.1}
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <h3 style={{ 
              color: '#a259ff', 
              fontSize: '1.1rem', 
              marginBottom: '1rem', 
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>📍</span>
              Dirección de entrega
            </h3>
          </motion.div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <FormInput
              label="Calle"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Nombre de calle"
              required
              delay={0.2}
            />
            <FormInput
              label="Numeración"
              name="numeracion"
              value={form.numeracion}
              onChange={handleChange}
              placeholder="Número"
              required
              delay={0.25}
            />
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <FormInput
              label="Localidad"
              name="localidad"
              value={form.localidad}
              onChange={handleChange}
              placeholder="Tu localidad"
              required
              delay={0.3}
            />
            <FormInput
              label="Provincia"
              name="provincia"
              value={form.provincia}
              onChange={handleChange}
              placeholder="Tu provincia"
              required
              delay={0.35}
            />
          </div>
          
          <FormInput
            label="Código Postal"
            name="codigo_postal"
            value={form.codigo_postal}
            onChange={handleChange}
            placeholder="Tu código postal"
            required
            delay={0.4}
          />
          
          <AnimatedFeedback error={error} success={exito ? '¡Perfil actualizado correctamente!' : null} />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            style={{ 
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '1rem'
            }}
          >
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: '#b56fff' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              type="submit"
              disabled={guardando}
              style={{
                background: '#a259ff',
                color: 'white',
                border: 'none',
                padding: '0.9rem 2.5rem',
                borderRadius: '0.8rem',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                cursor: guardando ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(162, 89, 255, 0.2)',
                opacity: guardando ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              {guardando && (
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" fill="white" />
                </svg>
              )}
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </motion.button>
          </motion.div>
        </motion.form>
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

type FormInputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  delay?: number;
};

const FormInput = ({ label, name, value, onChange, placeholder, required = false, delay = 0 }: FormInputProps) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
  >
    <label
      htmlFor={name}
      style={{
        color: 'var(--color-white)',
        fontSize: '0.9rem',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 500,
        color: 'rgba(255,255,255,0.8)'
      }}
    >
      {label} {required && <span style={{ color: '#a259ff' }}>*</span>}
    </label>
    <motion.input
      whileFocus={{ boxShadow: '0 0 0 2px rgba(162, 89, 255, 0.2)' }}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={{
        padding: '0.9rem 1rem',
        borderRadius: '0.8rem',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '0.95rem',
        fontFamily: "'Poppins', sans-serif",
        background: 'rgba(0,0,0,0.2)',
        color: 'var(--color-white)',
        transition: 'all 0.2s ease',
        outline: 'none'
      }}
    />
  </motion.div>
);

type AnimatedFeedbackProps = {
  error: string | null;
  success: string | null;
};

const AnimatedFeedback = ({ error, success }: AnimatedFeedbackProps) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ 
      opacity: error || success ? 1 : 0,
      height: error || success ? 'auto' : 0
    }}
    transition={{ duration: 0.3 }}
    style={{ overflow: 'hidden' }}
  >
    {error && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          color: '#ff4d4d',
          padding: '0.8rem 1rem',
          background: 'rgba(255,77,77,0.1)',
          borderRadius: '0.8rem',
          fontWeight: 500,
          fontSize: '0.9rem',
          fontFamily: "'Poppins', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '0.5rem'
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
        transition={{ duration: 0.3 }}
        style={{
          color: '#4caf50',
          padding: '0.8rem 1rem',
          background: 'rgba(76,175,80,0.1)',
          borderRadius: '0.8rem',
          fontWeight: 500,
          fontSize: '0.9rem',
          fontFamily: "'Poppins', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '0.5rem'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11.003 16L6.76 11.757L8.174 10.343L11.003 13.172L16.659 7.515L18.074 8.929L11.003 16Z" fill="currentColor" />
        </svg>
        {success}
      </motion.div>
    )}
  </motion.div>
); 