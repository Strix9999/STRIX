'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';

export interface ProductCardProps {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl: string;
  categoria?: string;
  subcategoria?: string | null;
  colores: { id: number; nombre: string; codigo_hex: string }[];
  tallas?: { id: number; nombre: string }[];
  onQuickView?: () => void;
}

export default function ProductCard({ 
  id, 
  nombre, 
  precio, 
  imagenUrl, 
  categoria,
  subcategoria,
  colores,
  tallas,
  onQuickView
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  // Navegar a la página de detalle al hacer clic en la tarjeta
  const irADetalle = () => {
    router.push(`/catalogo/${id}`);
  };

  // Agregar al carrito con configuración predeterminada (primera variante disponible)
  const agregarAlCarrito = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegar a la página de detalle
    
    // Añadir con configuración básica (el usuario podrá personalizar luego)
    addToCart({
      variantId: id * 100, // ID temporal, se recomienda que el usuario vaya a detalles para elegir variante específica
      productId: id,
      nombre: nombre,
      precio: precio,
      talla: "Única", // Simplificado - el usuario debería ir a la página de detalle para seleccionar talla
      color: colores.length > 0 ? colores[0].nombre : "Estándar",
      colorHex: colores.length > 0 ? colores[0].codigo_hex : "#000000",
      cantidad: 1
    });
    
    // Mostrar algún feedback (podría implementarse un toast/notificación)
    alert("¡Producto añadido al carrito!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      style={{ 
        borderRadius: '1rem',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, rgba(30,30,30,0.6), rgba(20,20,20,0.8))',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={irADetalle}
    >
      {/* Imagen */}
      <div style={{ 
        position: 'relative',
        paddingBottom: '130%',
        background: '#161616',
        overflow: 'hidden'
      }}>
        <img 
          src={imagenUrl} 
          alt={nombre}
          style={{ 
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
        />
        
        {categoria && (
          <div style={{
            position: 'absolute',
            top: '0.8rem',
            left: '0.8rem',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(5px)',
            color: 'var(--color-orange)',
            padding: '0.3rem 0.7rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            zIndex: 2
          }}>
            {categoria}
          </div>
        )}
        
        {/* Colores disponibles */}
        {colores.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '0.8rem',
            left: '0.8rem',
            display: 'flex',
            gap: '0.3rem',
            zIndex: 2
          }}>
            {colores.slice(0, 4).map(color => (
              <div 
                key={color.id}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: color.codigo_hex,
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
                title={color.nombre}
              />
            ))}
            {colores.length > 4 && (
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                border: '2px solid rgba(255,255,255,0.2)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                fontWeight: 'bold'
              }}>
                +{colores.length - 4}
              </div>
            )}
          </div>
        )}
        
        {/* Botón de vista rápida */}
        {onQuickView && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ 
              opacity: 1,
              scale: 1.05,
              backgroundColor: 'var(--color-orange)',
              color: 'var(--color-black)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
            style={{
              position: 'absolute',
              bottom: '0.8rem',
              right: '0.8rem',
              background: 'var(--color-purple)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.4rem 0.8rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              zIndex: 2
            }}
          >
            Vista Rápida
          </motion.button>
        )}
      </div>
      
      {/* Información */}
      <div style={{ 
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flexGrow: 1
      }}>
        <div style={{ marginBottom: 8 }}>
          {categoria && (
            <span className="card-tag">{categoria}</span>
          )}
          {subcategoria && (
            <span className="card-tag" style={{ 
              marginLeft: 8,
              background: 'rgba(139, 92, 246, 0.2)',
              color: '#8b5cf6'
            }}>
              {subcategoria}
            </span>
          )}
        </div>
        
        <Link href={`/catalogo/${id}`} passHref style={{ textDecoration: 'none' }}>
          <h3 className="card-title" style={{ 
            color: 'var(--color-white)',
            fontSize: '1rem',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.3
          }}>
            {nombre}
          </h3>
        </Link>
        
        <p className="card-price">
          ${precio.toLocaleString()}
        </p>
        
        {tallas && tallas.length > 0 && (
          <div className="card-sizes">
            {tallas.slice(0, 5).map(talla => (
              <div key={talla.id} className="card-size" title={`Talla ${talla.nombre}`}>
                {talla.nombre}
              </div>
            ))}
            {tallas.length > 5 && (
              <div className="card-size" style={{ 
                background: 'var(--color-violet)',
                color: '#fff',
                fontSize: 9
              }}>
                +{tallas.length - 5}
              </div>
            )}
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: 16
        }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="card-btn"
            onClick={agregarAlCarrito}
          >
            Agregar
          </motion.button>
          
          <Link href={`/catalogo/${id}`} passHref>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'transparent',
                color: '#ddd',
                border: '1px solid rgba(162, 89, 255, 0.3)',
                borderRadius: 8,
                padding: '8px 12px',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              Ver más
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 