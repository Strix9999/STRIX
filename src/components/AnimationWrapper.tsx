'use client';
import { ReactNode, useEffect, useState } from 'react';
import { motion, TargetAndTransition, VariantLabels, Transition } from 'framer-motion';

interface AnimationWrapperProps {
  children: ReactNode;
  initial?: TargetAndTransition | VariantLabels;
  animate?: TargetAndTransition | VariantLabels;
  exit?: TargetAndTransition | VariantLabels;
  transition?: Transition;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimationWrapper({
  children,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  exit = { opacity: 0 },
  transition = { duration: 0.3 },
  className,
  style
}: AnimationWrapperProps) {
  // Determinar si el usuario prefiere animaciones reducidas
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

  if (prefersReducedMotion) {
    // Si se prefieren animaciones reducidas, no aplicamos animaciones
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Si no hay preferencia por reducir animaciones, aplicamos las animaciones
  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
} 