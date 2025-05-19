'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  category_id: number;
}

interface ProductImage {
  id: number;
  url: string;
  es_principal: boolean;
}

interface ProductVariant {
  id: number;
  product_id: number;
  size_id: number;
  color_id: number;
  stock: number;
}

interface Size { id: number; nombre: string; }
interface Color { id: number; nombre: string; codigo_hex: string; }
interface Category { id: number; nombre: string; }

export default function DetalleProducto() {
  const router = useRouter();
  const { id } = useParams();
  const [producto, setProducto] = useState<Product | null>(null);
  const [categoria, setCategoria] = useState<Category | null>(null);
  const [imagenes, setImagenes] = useState<ProductImage[]>([]);
  const [imagenPrincipal, setImagenPrincipal] = useState<ProductImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [mostrarTablaStock, setMostrarTablaStock] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { addToCart } = useCart();
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      
      return () => {
        window.removeEventListener('resize', checkIfMobile);
      };
    }
  }, []);

  useEffect(() => {
    async function fetchProducto() {
      if (!id) return;
      
      // Asegurar que id sea un string
      const productId = Array.isArray(id) ? id[0] : id;
      
      setLoading(true);
      
      // Datos del producto
      const { data, error } = await supabase
        .from('products')
        .select('id, nombre, descripcion, precio, category_id')
        .eq('id', productId)
        .single();
        
      if (error || !data) {
        setLoading(false);
        return;
      }
      
      // Convertir tipos explícitamente para evitar errores de tipado
      const typedProduct: Product = {
        id: Number(data.id),
        nombre: String(data.nombre),
        descripcion: String(data.descripcion),
        precio: Number(data.precio),
        category_id: Number(data.category_id)
      };
      
      setProducto(typedProduct);
      
      // Categoría
      if (typedProduct.category_id) {
        const { data: catData } = await supabase
          .from('categories')
          .select('id, nombre')
          .eq('id', typedProduct.category_id)
          .single();
          
        if (catData) {
          const typedCategory: Category = {
            id: Number(catData.id),
            nombre: String(catData.nombre)
          };
          setCategoria(typedCategory);
        }
      }
      
      // Imágenes
      const { data: imgs } = await supabase
        .from('product_images')
        .select('id, url, es_principal')
        .eq('product_id', productId);
        
      if (imgs && imgs.length > 0) {
        const typedImages: ProductImage[] = imgs.map(img => ({
          id: Number(img.id),
          url: String(img.url),
          es_principal: Boolean(img.es_principal)
        }));
        
        setImagenes(typedImages);
        
        // Establecer imagen principal
        const principal = typedImages.find(img => img.es_principal) || typedImages[0];
        setImagenPrincipal(principal);
      }
      
      // Variantes
      const { data: vars } = await supabase
        .from('product_variants')
        .select('id, product_id, size_id, color_id, stock')
        .eq('product_id', productId);
        
      if (vars) {
        const typedVariants: ProductVariant[] = vars.map(v => ({
          id: Number(v.id),
          product_id: Number(v.product_id),
          size_id: Number(v.size_id),
          color_id: Number(v.color_id),
          stock: Number(v.stock)
        }));
        setVariants(typedVariants);
      }
      
      // Talles
      const { data: szs } = await supabase
        .from('sizes')
        .select('id, nombre');
        
      if (szs) {
        const typedSizes: Size[] = szs.map(s => ({
          id: Number(s.id),
          nombre: String(s.nombre)
        }));
        setSizes(typedSizes);
      }
      
      // Colores
      const { data: cols } = await supabase
        .from('colors')
        .select('id, nombre, codigo_hex');
        
      if (cols) {
        const typedColors: Color[] = cols.map(c => ({
          id: Number(c.id),
          nombre: String(c.nombre),
          codigo_hex: String(c.codigo_hex)
        }));
        setColors(typedColors);
      }
      
      setLoading(false);
    }
    
    fetchProducto();
  }, [id]);

  // Cambiar imagen principal
  const handleImageClick = (img: ProductImage) => {
    setImagenPrincipal(img);
  };

  // Incrementar/decrementar cantidad
  const incrementarCantidad = () => {
    if (selectedVariant && cantidad < selectedVariant.stock) {
      setCantidad(prev => prev + 1);
    }
  };
  
  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(prev => prev - 1);
    }
  };

  // Filtrar variantes válidas según selección
  const availableSizes = Array.from(new Set(variants.map(v => v.size_id)));
  const getAvailableColors = (sizeId: number | null) => {
    if (!sizeId) return Array.from(new Set(variants.map(v => v.color_id)));
    return Array.from(new Set(variants.filter(v => v.size_id === sizeId).map(v => v.color_id)));
  };
  
  const availableColors = getAvailableColors(selectedSize);
  const selectedVariant = variants.find(v => v.size_id === selectedSize && v.color_id === selectedColor);

  // Matriz de disponibilidad para la tabla
  const stockMatrix = sizes
    .filter(s => availableSizes.includes(s.id))
    .map(size => ({
      size,
      variants: colors
        .filter(c => getAvailableColors(size.id).includes(c.id))
        .map(color => {
          const variant = variants.find(v => v.size_id === size.id && v.color_id === color.id);
          return {
            color,
            variant,
            stock: variant?.stock || 0
          };
        })
    }));

  // Regresar al catálogo con un producto similar (filtrado por categoría)
  const volverACatalogo = () => {
    if (categoria) {
      router.push(`/catalogo?categoria=${categoria.id}`);
    } else {
      router.push('/catalogo');
    }
  };

  // Función para añadir al carrito con notificación
  const handleAddToCart = () => {
    if (!producto || !selectedSize || !selectedColor || !selectedVariant) {
      // Mostrar mensaje de alerta si no se seleccionó talla o color
      alert("Por favor, selecciona una talla y un color antes de añadir al carrito");
      return;
    }

    if (selectedVariant.stock <= 0) {
      alert("Este producto está agotado en la variante seleccionada");
      return;
    }

    const colorNombre = colors.find(c => c.id === selectedColor)?.nombre || '';
    const colorHex = colors.find(c => c.id === selectedColor)?.codigo_hex || '';
    const tallaNombre = sizes.find(s => s.id === selectedSize)?.nombre || '';
    
    addToCart({
      variantId: selectedVariant.id,
      productId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      talla: tallaNombre,
      color: colorNombre,
      colorHex: colorHex,
      cantidad: cantidad
    });
    
    // Mostrar notificación
    setMostrarNotificacion(true);
    
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      setMostrarNotificacion(false);
    }, 3000);
  };

  // Estados de carga y error
  if (loading) {
  return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '70vh' 
      }}>
        <motion.div
          animate={{ 
            rotate: 360, 
            borderRadius: ['20%', '30%', '50%', '30%', '20%'] 
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      style={{
            width: 50,
            height: 50,
            marginBottom: 20,
            border: '3px solid',
            borderColor: 'var(--color-orange) transparent var(--color-orange) transparent',
            borderRadius: '50%'
          }}
        />
        <p style={{ color: 'var(--color-white)', textAlign: 'center' }}>Cargando detalles del producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '70vh',
          gap: 20
        }}
      >
        <p style={{ color: 'var(--color-orange)', fontSize: '1.5rem', textAlign: 'center' }}>
          Producto no encontrado
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/catalogo')}
          style={{
            background: 'var(--color-orange)',
            color: 'var(--color-black)',
            border: 'none',
            borderRadius: '2rem',
            padding: '0.8rem 2rem',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 12px 0 rgba(255,106,0,0.25)',
          }}
        >
          Volver al catálogo
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        padding: '2rem',
        maxWidth: 1200,
        margin: '0 auto'
      }}
    >
      {/* Ruta de navegación */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        color: 'var(--color-white)',
        opacity: 0.7
      }}>
        <Link href="/catalogo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ cursor: 'pointer' }}>Catálogo</span>
        </Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        {categoria && (
          <>
            <Link href={`/catalogo?categoria=${categoria.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <span style={{ cursor: 'pointer' }}>{categoria.nombre}</span>
            </Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
          </>
        )}
        <span style={{ color: 'var(--color-orange)' }}>{producto.nombre}</span>
      </div>
      
      {/* Contenido principal */}
      <div style={{ 
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '2rem'
      }}>
        {/* Galería de imágenes */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ 
            flex: '1 1 55%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* Imagen principal */}
          <div style={{ 
            position: 'relative',
            borderRadius: '1rem',
            overflow: 'hidden',
            aspectRatio: '3/4',
            background: '#161616',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {imagenPrincipal && (
              <img 
                src={imagenPrincipal.url} 
                alt={producto.nombre}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>
          
          {/* Galería de miniaturas */}
          {imagenes.length > 1 && (
            <div style={{ 
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              padding: '0.5rem 0',
              scrollbarWidth: 'thin',
            }}>
              {imagenes.map((img) => (
                <motion.div
                  key={img.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleImageClick(img)}
                  style={{ 
                    width: 80,
                    height: 80,
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: img.id === imagenPrincipal?.id 
                      ? '2px solid var(--color-orange)' 
                      : '2px solid transparent',
                    opacity: img.id === imagenPrincipal?.id ? 1 : 0.7,
                    background: '#161616',
                    flexShrink: 0
                  }}
                >
                  <img 
                    src={img.url} 
                    alt={producto.nombre}
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        
        {/* Información del producto */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ 
            flex: '1 1 45%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          <div>
            {categoria && (
              <Link href={`/catalogo?categoria=${categoria.id}`} style={{ textDecoration: 'none' }}>
                <span style={{ 
                  display: 'inline-block',
                  background: 'rgba(162,89,255,0.1)',
                  color: 'var(--color-purple)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '1rem',
                  fontSize: '0.8rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(162,89,255,0.2)'
                }}>
                  {categoria.nombre}
                </span>
              </Link>
            )}
            
            <h1 style={{ 
              color: 'var(--color-white)',
              fontSize: '2rem',
              marginBottom: '0.5rem',
              lineHeight: 1.2
            }}>
              {producto.nombre}
            </h1>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'baseline',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <span style={{ 
                color: 'var(--color-orange)',
                fontSize: '1.8rem',
                fontWeight: 700
              }}>
                ${producto.precio.toLocaleString()}
              </span>
              
              {/* Badge de stock */}
              {variants.reduce((total, v) => total + v.stock, 0) > 0 ? (
                <span style={{ 
                  background: 'rgba(0,200,83,0.15)',
                  color: '#00c853',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: '1px solid rgba(0,200,83,0.2)'
                }}>
                  En stock
                </span>
              ) : (
                <span style={{ 
                  background: 'rgba(255,50,50,0.15)',
                  color: '#ff5555',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255,50,50,0.2)'
                }}>
                  Agotado
                </span>
              )}
            </div>
            
            <p style={{ 
              color: 'var(--color-white)',
              opacity: 0.8,
              lineHeight: 1.6,
              fontSize: '1rem',
              marginBottom: '1.5rem',
              whiteSpace: 'pre-line'
            }}>
              {producto.descripcion}
            </p>
          </div>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            {/* Selector de talla */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.8rem'
              }}>
                <h3 style={{ 
                  color: 'var(--color-white)',
                  fontSize: '1rem',
                  fontWeight: 600
                }}>
                  Talla
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setMostrarTablaStock(!mostrarTablaStock)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-purple)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {mostrarTablaStock ? 'Ocultar guía de stock' : 'Ver guía de stock'}
                </motion.button>
              </div>
              
              <div style={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {sizes
                  .filter(s => availableSizes.includes(s.id))
                  .map(size => {
                    const available = getAvailableColors(size.id).length > 0;
                    const isSelected = selectedSize === size.id;
                    
                    return (
                      <motion.button
                        key={size.id}
                        whileHover={{ scale: available ? 1.05 : 1 }}
                        whileTap={{ scale: available ? 0.95 : 1 }}
                        onClick={() => {
                          if (available) {
                            setSelectedSize(size.id);
                            setSelectedColor(null); // Resetear color al cambiar talla
                          }
                        }}
                        style={{
                          minWidth: 45,
                          height: 45,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '0.5rem',
                          border: isSelected
                            ? '2px solid var(--color-orange)'
                            : '1px solid rgba(255,255,255,0.1)',
                          background: isSelected
                            ? 'rgba(255,106,0,0.1)'
                            : 'rgba(0,0,0,0.2)',
                          color: isSelected
                            ? 'var(--color-orange)'
                            : available
                              ? 'var(--color-white)'
                              : 'rgba(255,255,255,0.3)',
                          fontWeight: 600,
                          cursor: available ? 'pointer' : 'not-allowed',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {size.nombre}
                        
                        {!available && (
                          <div style={{
                            position: 'absolute',
                            width: '140%',
                            height: 2,
                            background: 'rgba(255,255,255,0.3)',
                            transform: 'rotate(-45deg)',
                            top: '50%',
                            left: '-20%'
                          }} />
                        )}
                      </motion.button>
                    );
                  })}
              </div>
            </div>
            
            {/* Selector de color */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                color: 'var(--color-white)',
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '0.8rem'
              }}>
                Color
              </h3>
              
              <div style={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.8rem'
              }}>
                {colors
                  .filter(c => selectedSize ? availableColors.includes(c.id) : false)
                  .map(color => {
                    const stockVariant = variants.find(
                      v => v.color_id === color.id && v.size_id === selectedSize
                    );
                    const available = (stockVariant?.stock || 0) > 0;
                    const isSelected = selectedColor === color.id;
                    
                    return (
                      <motion.div
                        key={color.id}
                        whileHover={{ scale: available ? 1.05 : 1 }}
                        whileTap={{ scale: available ? 0.95 : 1 }}
                        onClick={() => {
                          if (available) {
                            setSelectedColor(color.id);
                            setCantidad(1); // Resetear cantidad al cambiar color
                          }
                        }}
                        style={{
                          width: 35,
                          height: 35,
                          borderRadius: '50%',
                          background: color.codigo_hex,
                          cursor: available ? 'pointer' : 'not-allowed',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          border: isSelected
                            ? '2px solid var(--color-orange)'
                            : '2px solid transparent',
                          opacity: available ? 1 : 0.5,
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={`${color.nombre}${available ? '' : ' (Agotado)'}`}
                      >
                        {isSelected && (
                          <span style={{
                            fontSize: 14,
                            color: getContrastColor(color.codigo_hex)
                          }}>
                            ✓
                          </span>
                        )}
                        
                        {!available && (
                          <div style={{
                            position: 'absolute',
                            width: '140%',
                            height: 2,
                            background: 'rgba(0,0,0,0.5)',
                            transform: 'rotate(-45deg)',
                            top: '50%',
                            left: '-20%'
                          }} />
                        )}
                      </motion.div>
                    );
                  })}
              </div>
              
              {selectedSize && selectedColor && (
                <div style={{
                  marginTop: '0.8rem',
                  fontSize: '0.9rem',
                  color: 'var(--color-white)',
                  opacity: 0.8
                }}>
                  <span>
                    Stock disponible: <strong>{selectedVariant?.stock || 0}</strong> unidades
                  </span>
                </div>
              )}
            </div>
            
            {/* Tabla de stock */}
            <AnimatePresence>
              {mostrarTablaStock && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    overflow: 'hidden',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <h4 style={{ 
                      color: 'var(--color-white)',
                      fontSize: '0.9rem',
                      marginBottom: '0.8rem',
                      textAlign: 'center'
                    }}>
                      Guía de disponibilidad
                    </h4>
                    
                    <div style={{ 
                      overflowX: 'auto',
                      scrollbarWidth: 'thin',
                    }}>
                      <table style={{ 
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.85rem'
                      }}>
                        <thead>
                          <tr>
                            <th style={{ 
                              padding: '0.5rem',
                              textAlign: 'left',
                              color: 'var(--color-white)',
                              borderBottom: '1px solid rgba(255,255,255,0.1)'
                            }}>
                              Talla
                            </th>
                            {colors.filter(c => variants.some(v => v.color_id === c.id)).map(color => (
                              <th 
                                key={color.id}
                                style={{ 
                                  padding: '0.5rem',
                                  textAlign: 'center',
                                  color: 'var(--color-white)',
                                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                                }}
                              >
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}>
                                  <span style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: color.codigo_hex,
                                    display: 'inline-block'
                                  }} />
                                  <span>{color.nombre}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {stockMatrix.map(({size, variants}) => (
                            <tr key={size.id}>
                              <td style={{ 
                                padding: '0.5rem',
                                color: 'var(--color-white)',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                              }}>
                                {size.nombre}
                              </td>
                              {variants.map(({color, stock}) => (
                                <td 
                                  key={color.id}
                                  style={{ 
                                    padding: '0.5rem',
                                    textAlign: 'center',
                                    color: stock > 0 ? '#00c853' : '#ff5555',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                  }}
                                >
                                  {stock > 0 ? stock : '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Cantidad y botón de añadir al carrito */}
            <div style={{ 
              marginTop: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {selectedSize && selectedColor && selectedVariant && selectedVariant.stock > 0 && (
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <span style={{ 
                    color: 'var(--color-white)',
                    fontSize: '0.95rem'
                  }}>
                    Cantidad:
                  </span>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <motion.button
                      whileHover={{ scale: cantidad > 1 ? 1.1 : 1 }}
                      whileTap={{ scale: cantidad > 1 ? 0.9 : 1 }}
                      onClick={decrementarCantidad}
                      disabled={cantidad <= 1}
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: '50%',
                        background: cantidad > 1 ? 'var(--color-orange)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: cantidad > 1 ? 'pointer' : 'not-allowed',
                        color: cantidad > 1 ? 'var(--color-black)' : 'rgba(255,255,255,0.3)',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}
                    >
                      −
                    </motion.button>
                    
                    <span style={{ 
                      color: 'var(--color-white)',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      width: 30,
                      textAlign: 'center'
                    }}>
                      {cantidad}
                    </span>
                    
                    <motion.button
                      whileHover={{ scale: cantidad < selectedVariant.stock ? 1.1 : 1 }}
                      whileTap={{ scale: cantidad < selectedVariant.stock ? 0.9 : 1 }}
                      onClick={incrementarCantidad}
                      disabled={cantidad >= selectedVariant.stock}
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: '50%',
                        background: cantidad < selectedVariant.stock ? 'var(--color-orange)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: cantidad < selectedVariant.stock ? 'pointer' : 'not-allowed',
                        color: cantidad < selectedVariant.stock ? 'var(--color-black)' : 'rgba(255,255,255,0.3)',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}
                    >
                      +
                    </motion.button>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <motion.button
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: '0 5px 25px rgba(162, 89, 255, 0.4)' 
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    background: !selectedSize || !selectedColor || (selectedVariant && selectedVariant.stock <= 0)
                      ? 'rgba(162,89,255,0.3)' 
                      : 'linear-gradient(135deg, var(--color-purple), var(--color-purple-dark, #5e17eb))',
                    color: 'var(--color-white)',
                    border: 'none',
                    borderRadius: '2rem',
                    padding: '1.2rem 1rem',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.8rem',
                    boxShadow: '0 4px 15px 0 rgba(162,89,255,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                    <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                  Añadir al carrito
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={volverACatalogo}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--color-white)',
                    transition: 'all 0.2s ease'
                  }}
                  title="Volver al catálogo"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Notificación de producto añadido */}
      <AnimatePresence>
        {mostrarNotificacion && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,200,83,0.95)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '2rem',
              boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              zIndex: 1000
            }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span style={{ fontWeight: 600 }}>
              Producto añadido al carrito
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Función para determinar el color de texto según el fondo
function getContrastColor(hexColor: string): string {
  // Convertir hex a RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  // Calcular luminosidad
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Retornar blanco o negro dependiendo de la luminosidad
  return (yiq >= 128) ? '#000' : '#fff';
} 