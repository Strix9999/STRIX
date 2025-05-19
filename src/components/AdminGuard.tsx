'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
      return;
    }
    if (user) {
      (async () => {
        // Buscar si el usuario tiene el rol admin
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role_id, roles(nombre)')
          .eq('user_id', user.id);
        if (roles && roles.some((r: any) => r.roles?.nombre === 'admin')) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          // Redirigir a acceso denegado inmediatamente
          router.replace('/acceso-denegado');
        }
      })();
    }
  }, [user, loading, router]);

  if (loading || isAdmin === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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
            border: '3px solid rgba(255, 106, 0, 0.15)',
            borderTopColor: '#ff6a00',
            animation: 'spin 1s linear infinite'
          }}/>
          <p style={{ 
            color: '#ff6a00', 
            fontFamily: "'Poppins', sans-serif",
            fontSize: '1rem' 
          }}>
            Verificando acceso...
          </p>
        </motion.div>
      </div>
    );
  }

  // Esta condición casi nunca se activará por la redirección inmediata
  // pero la mantenemos como respaldo por si la redirección falla
  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            opacity: 1
          }}
          transition={{
            duration: 2,
            repeat: 0,
            ease: 'easeInOut'
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            textAlign: 'center'
          }}
        >
          <div style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'rgba(255, 76, 76, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            🔒
          </div>
          <h3 style={{ 
            color: '#ff4c4c', 
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '1.4rem',
            fontWeight: 700
          }}>
            Acceso Denegado
          </h3>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontFamily: "'Poppins', sans-serif",
            fontSize: '1rem',
            maxWidth: '350px',
            margin: '0 auto'
          }}>
            No tienes permisos de administrador para acceder a esta sección.
          </p>
          <div style={{
            marginTop: '1rem'
          }}>
            Redirigiendo...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {children}
    </>
  );
} 