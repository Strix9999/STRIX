// Esta función le dice a Next.js qué rutas dinámicas generar durante la build
// Para una exportación estática, estamos dejándola vacía para que no genere ningún producto específico
// Los visitantes del sitio serán dirigidos a not-found.tsx cuando intenten acceder a un producto

export async function generateStaticParams() {
  // No generamos rutas para productos específicos en la versión estática
  return [];
} 