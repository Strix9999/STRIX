import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Restaurar la exportación estática para GitHub Pages
  output: 'export',
  images: {
    unoptimized: true,
  },
  distDir: 'out',
  eslint: {
    // Ignorar errores de ESLint durante la compilación
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de TypeScript durante la compilación
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
