'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

interface AnimationContextType {
  prefersReducedMotion: boolean;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function useAnimation() {
  const ctx = useContext(AnimationContext);
  if (!ctx) throw new Error('useAnimation debe usarse dentro de AnimationProvider');
  return ctx;
}

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Solo ejecutar en el cliente
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Actualizar si cambia la preferencia
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <AnimationContext.Provider value={{ prefersReducedMotion }}>
      <LazyMotion features={domAnimation}>
        {children}
      </LazyMotion>
    </AnimationContext.Provider>
  );
} 