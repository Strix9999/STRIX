'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  category_id: number;
  subcategory_id?: number;
}

interface ProductWithImages extends Product {
  imagenes: { id: number; url: string; es_principal: boolean }[];
  variantes: { color_id: number; size_id: number; stock: number }[];
}

interface Category {
  id: number;
  nombre: string;
}

interface Subcategory {
  id: number; 
  nombre: string;
  category_id: number;
}

interface Color {
  id: number;
  nombre: string;
  codigo_hex: string;
}

interface Size {
  id: number;
  nombre: string;
  conteo?: number;
}

export default function Catalogo() {
  const [productos, setProductos] = useState<ProductWithImages[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<ProductWithImages[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategory[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [tallas, setTallas] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'large' | 'small'>('grid');
  const [filtroCategoria, setFiltroCategoria] = useState<number | null>(null);
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<number | null>(null);
  const [filtroColor, setFiltroColor] = useState<number | null>(null);
  const [filtroTalla, setFiltroTalla] = useState<number | null>(null);
  const [filtroPrecio, setFiltroPrecio] = useState<[number, number]>([0, 50000]);
  const [precioMaximo, setPrecioMaximo] = useState(50000);
  const [mostrarFiltrosMobile, setMostrarFiltrosMobile] = useState(false);
  const { getItemsCount } = useCart();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Primero, recopilar todos los datos necesarios
        
        // 1. Productos
        const { data: prods, error } = await supabase
        .from('products')
          .select('id, nombre, descripcion, precio, category_id, subcategory_id');
        
        if (error || !prods) {
          console.error('Error al cargar productos:', error);
          setLoading(false);
          return;
        }
        
        // Convertir explícitamente los tipos
        const tiposProductos = prods.map(p => ({
          id: Number(p.id),
          nombre: String(p.nombre),
          descripcion: String(p.descripcion),
          precio: Number(p.precio),
          category_id: Number(p.category_id),
          subcategory_id: p.subcategory_id ? Number(p.subcategory_id) : undefined
        }));
        
        // Encontrar el precio máximo para el rango del slider
        const maxPrecio = Math.max(...tiposProductos.map(p => p.precio));
        setPrecioMaximo(maxPrecio > 0 ? maxPrecio : 50000);
        setFiltroPrecio([0, maxPrecio > 0 ? maxPrecio : 50000]);
        
        // Extraer IDs para consultas relacionadas
        const ids = tiposProductos.map(p => p.id);
        
        // 2. Imágenes
        const { data: imgs } = await supabase
          .from('product_images')
          .select('id, url, es_principal, product_id')
          .in('product_id', ids);
        
        // 3. Variantes
        const { data: vars } = await supabase
          .from('product_variants')
          .select('product_id, color_id, size_id, stock');
        
        // 4. Categorías
        const { data: cats } = await supabase
          .from('categories')
          .select('id, nombre');
        
        // 5. Subcategorías
        const { data: subcats } = await supabase
          .from('subcategories')
          .select('id, nombre, category_id');
          
        // 6. Colores
        const { data: cols } = await supabase
          .from('colors')
          .select('id, nombre, codigo_hex');
          
        // 7. Tallas
        const { data: sizes } = await supabase
          .from('sizes')
          .select('id, nombre');
        
        // Procesar datos una vez que todos están disponibles
        if (imgs && vars && cats && subcats && cols && sizes) {
          // Convertir tipos
          const tiposCategorias: Category[] = cats.map(cat => ({
            id: Number(cat.id),
            nombre: String(cat.nombre)
          }));
          
          const tiposSubcategorias: Subcategory[] = subcats.map(subcat => ({
            id: Number(subcat.id),
            nombre: String(subcat.nombre),
            category_id: Number(subcat.category_id)
          }));
          
          const tiposTallas: Size[] = sizes.map(size => ({
            id: Number(size.id),
            nombre: String(size.nombre)
          }));
          
          // Crear productos con imágenes y variantes
          const productosConImgs: ProductWithImages[] = tiposProductos.map(p => ({
            ...p,
            imagenes: Array.isArray(imgs) 
              ? imgs
                  .filter((img) => img.product_id === p.id)
                  .map(img => ({
                    id: Number(img.id), 
                    url: String(img.url), 
                    es_principal: Boolean(img.es_principal)
                  }))
              : [],
            variantes: Array.isArray(vars) 
              ? vars
                  .filter((v) => v.product_id === p.id)
                  .map(v => ({
                    color_id: Number(v.color_id),
                    size_id: Number(v.size_id),
                    stock: Number(v.stock)
                  }))
              : [],
          }));
          
          // Filtrar colores realmente usados y contar productos
          const usadosColores = new Set();
          const conteoColores = new Map();
          
          // Filtrar tallas realmente usadas y contar productos
          const usadasTallas = new Set();
          const conteoTallas = new Map();
          
          productosConImgs.forEach(p => {
            p.variantes.forEach(v => {
              if (v.stock > 0) {
                // Contar colores
                usadosColores.add(v.color_id);
                conteoColores.set(v.color_id, (conteoColores.get(v.color_id) || 0) + 1);
                
                // Contar tallas
                usadasTallas.add(v.size_id);
                conteoTallas.set(v.size_id, (conteoTallas.get(v.size_id) || 0) + 1);
              }
            });
          });
          
          // Colores con conteo
          const coloresConConteo: Color[] = cols
            .filter(c => usadosColores.has(c.id))
            .map(c => ({ 
              id: Number(c.id), 
              nombre: String(c.nombre), 
              codigo_hex: String(c.codigo_hex),
              conteo: conteoColores.get(Number(c.id)) || 0 
            }));
            
            // Tallas con conteo
            const tallasConConteo: Size[] = sizes
              .filter(s => usadasTallas.has(s.id))
              .map(s => ({ 
                id: Number(s.id), 
                nombre: String(s.nombre),
                conteo: conteoTallas.get(Number(s.id)) || 0 
              }));
          
          // Actualizar todos los estados juntos
          setCategorias(tiposCategorias);
          setSubcategorias(tiposSubcategorias);
          setColores(coloresConConteo);
          setTallas(tallasConConteo);
          setProductos(productosConImgs);
          setProductosFiltrados(productosConImgs);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
      setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Filtrado reactivo
  useEffect(() => {
    let filtrados = [...productos];
    
    // Filtro por categoría
    if (filtroCategoria) {
      filtrados = filtrados.filter((p) => p.category_id === filtroCategoria);
      
      // Resetear filtro de subcategoría si cambia la categoría
      if (filtroSubcategoria) {
        const subCatBelongsToSelectedCat = subcategorias.some(
          sc => sc.id === filtroSubcategoria && sc.category_id === filtroCategoria
        );
        
        if (!subCatBelongsToSelectedCat) {
          setFiltroSubcategoria(null);
        }
      }
    }
    
    // Filtro por subcategoría
    if (filtroSubcategoria) {
      filtrados = filtrados.filter((p) => p.subcategory_id === filtroSubcategoria);
    }
    
    // Filtro por color
    if (filtroColor) {
      filtrados = filtrados.filter((p) => 
        p.variantes.some((v) => v.color_id === filtroColor && v.stock > 0)
      );
    }
    
    // Filtro por talla
    if (filtroTalla) {
      filtrados = filtrados.filter((p) => 
        p.variantes.some((v) => v.size_id === filtroTalla && v.stock > 0)
      );
    }
    
    // Filtro por precio
    filtrados = filtrados.filter(
      (p) => p.precio >= filtroPrecio[0] && p.precio <= filtroPrecio[1]
    );
    
    setProductosFiltrados(filtrados);
  }, [filtroCategoria, filtroSubcategoria, filtroColor, filtroTalla, filtroPrecio, productos, subcategorias]);

  // Calcular conteo de productos por categoría
  const conteoCategorias = categorias.map(cat => ({
    ...cat,
    conteo: productos.filter(p => p.category_id === cat.id).length
  }));
  
  // Calcular conteo de productos por subcategoría
  const conteoSubcategorias = subcategorias.map(subcat => ({
    ...subcat,
    conteo: productos.filter(p => p.subcategory_id === subcat.id).length
  }));

  // Obtener subcategorías filtradas por categoría seleccionada
  const subcategoriasFiltradas = filtroCategoria 
    ? subcategorias.filter(subcat => subcat.category_id === filtroCategoria)
    : subcategorias;

  // Configurar número de columnas según la vista
  const getColumnas = () => {
    switch (view) {
      case 'small': return 4;
      case 'large': return 2;
      default: return 3;
    }
  };

  // Obtener color de texto contrastante para un fondo
  const getContrastColor = (hexColor: string): string => {
    // Convertir hex a RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calcular luminosidad
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Retornar blanco o negro dependiendo de la luminosidad
    return (yiq >= 128) ? '#000' : '#fff';
  };

  // Barra lateral de filtros (componente)
  const SidebarFiltros = () => (
    <motion.aside 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="filtros-sidebar"
      style={{
        width: 240,
        minWidth: 240,
        background: 'linear-gradient(145deg, #1a1a1a, #232323)',
        borderRadius: 12,
        padding: '1.5rem 1rem',
        height: 'fit-content',
        position: 'sticky',
        top: 20,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2), inset 1px 1px 1px rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(162, 89, 255, 0.15)'
      }}
    >
      {/* Filtro por precio */}
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ 
          color: 'var(--color-violet)', 
          fontSize: 16, 
          fontWeight: 600, 
          marginBottom: 16,
          textTransform: 'uppercase',
          borderBottom: '1px solid rgba(162, 89, 255, 0.3)',
          paddingBottom: 8,
          letterSpacing: '0.5px',
          fontFamily: "'Montserrat', sans-serif"
        }}>
          Filtrar por precio
        </h3>
        
        <div style={{ padding: '0 8px' }}>
          <input 
            type="range" 
            min="0" 
            max={precioMaximo} 
            value={filtroPrecio[1]} 
            onChange={(e) => setFiltroPrecio([filtroPrecio[0], parseInt(e.target.value)])}
            style={{ 
              width: '100%', 
              marginBottom: 10,
              accentColor: 'var(--color-violet)',
              cursor: 'pointer'
            }}
          />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            color: '#aaa', 
            fontSize: 14,
            fontFamily: "'Poppins', sans-serif",
          }}>
            <span>${filtroPrecio[0].toLocaleString()}</span>
            <span>${filtroPrecio[1].toLocaleString()}</span>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ 
            background: 'linear-gradient(135deg, #a259ff, #7e22ce)',
            scale: 1.03,
            boxShadow: '0 0 15px rgba(162, 89, 255, 0.4)'
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFiltroPrecio([0, precioMaximo])}
          style={{
            background: 'var(--color-violet)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
            marginTop: 10,
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.3s',
            fontWeight: 600,
            fontFamily: "'Poppins', sans-serif",
            boxShadow: '0 4px 12px rgba(162, 89, 255, 0.2)'
          }}
        >
          Aplicar rango
        </motion.button>
      </div>
      
      {/* Filtro por categoría */}
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ 
          color: 'var(--color-violet)', 
          fontSize: 16, 
          fontWeight: 600, 
          marginBottom: 16,
          textTransform: 'uppercase',
          borderBottom: '1px solid rgba(162, 89, 255, 0.3)',
          paddingBottom: 8,
          letterSpacing: '0.5px',
          fontFamily: "'Montserrat', sans-serif"
        }}>
          Categorías
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {conteoCategorias.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setFiltroCategoria(
                filtroCategoria === cat.id ? null : cat.id
              )}
              whileHover={{ 
                color: 'var(--color-violet)',
                paddingLeft: 5,
                background: 'rgba(162, 89, 255, 0.08)'
              }}
              style={{
                background: 'transparent',
                color: filtroCategoria === cat.id ? 'var(--color-violet)' : '#ddd',
                border: 'none',
                textAlign: 'left',
                padding: '10px 2px',
                fontSize: 15,
                cursor: 'pointer',
                fontWeight: filtroCategoria === cat.id ? 600 : 400,
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid #2a2a2a',
                transition: 'all 0.2s',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <span style={{ textTransform: 'uppercase' }}>{cat.nombre}</span>
              <span
                style={{
                  background: filtroCategoria === cat.id ? 'var(--color-violet)' : 'rgba(255,255,255,0.1)',
                  color: filtroCategoria === cat.id ? '#fff' : '#aaa',
                  borderRadius: 20,
                  padding: '2px 8px',
                  fontSize: 13,
                  minWidth: 24,
                  textAlign: 'center',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {cat.conteo}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Filtro por subcategoría (solo se muestra si hay una categoría seleccionada) */}
      {filtroCategoria && subcategoriasFiltradas.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ 
            color: 'var(--color-violet)', 
            fontSize: 16, 
            fontWeight: 600, 
            marginBottom: 16,
            textTransform: 'uppercase',
            borderBottom: '1px solid rgba(162, 89, 255, 0.3)',
            paddingBottom: 8,
            letterSpacing: '0.5px',
            fontFamily: "'Montserrat', sans-serif"
          }}>
            Subcategorías
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {subcategoriasFiltradas.map((subcat) => {
              const subcatConteo = conteoSubcategorias.find(sc => sc.id === subcat.id)?.conteo || 0;
              return (
                <motion.button
                  key={subcat.id}
                  onClick={() => setFiltroSubcategoria(
                    filtroSubcategoria === subcat.id ? null : subcat.id
                  )}
                  whileHover={{ 
                    color: 'var(--color-violet)',
                    paddingLeft: 5,
                    background: 'rgba(162, 89, 255, 0.08)'
                  }}
                  style={{
                    background: 'transparent',
                    color: filtroSubcategoria === subcat.id ? 'var(--color-violet)' : '#ddd',
                    border: 'none',
                    textAlign: 'left',
                    padding: '8px 2px',
                    fontSize: 14,
                    cursor: 'pointer',
                    fontWeight: filtroSubcategoria === subcat.id ? 600 : 400,
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #2a2a2a',
                    transition: 'all 0.2s',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <span style={{ textTransform: 'capitalize' }}>{subcat.nombre}</span>
                  <span
                    style={{
                      background: filtroSubcategoria === subcat.id ? 'var(--color-violet)' : 'rgba(255,255,255,0.1)',
                      color: filtroSubcategoria === subcat.id ? '#fff' : '#aaa',
                      borderRadius: 20,
                      padding: '2px 8px',
                      fontSize: 12,
                      minWidth: 20,
                      textAlign: 'center',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    {subcatConteo}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Filtro por talla */}
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ 
          color: 'var(--color-violet)', 
          fontSize: 16, 
          fontWeight: 600, 
          marginBottom: 16,
          textTransform: 'uppercase',
          borderBottom: '1px solid rgba(162, 89, 255, 0.3)',
          paddingBottom: 8,
          letterSpacing: '0.5px',
          fontFamily: "'Montserrat', sans-serif"
        }}>
          Tallas
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {tallas.map((talla) => (
            <motion.button
              key={talla.id}
              onClick={() => setFiltroTalla(
                filtroTalla === talla.id ? null : talla.id
              )}
              whileHover={{ 
                scale: 1.05,
                boxShadow: filtroTalla !== talla.id ? '0 4px 12px rgba(162, 89, 255, 0.2)' : 'none'
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: filtroTalla === talla.id 
                  ? 'var(--color-violet)' 
                  : 'rgba(30,30,30,0.8)',
                color: filtroTalla === talla.id ? '#fff' : '#ddd',
                border: filtroTalla === talla.id 
                  ? 'none' 
                  : '1px solid rgba(162, 89, 255, 0.3)',
                borderRadius: 8,
                padding: '6px 0',
                fontSize: 14,
                fontWeight: 600,
                width: 46,
                height: 36,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: "'Poppins', sans-serif",
                boxShadow: filtroTalla === talla.id 
                  ? '0 4px 15px rgba(162, 89, 255, 0.4)'
                  : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              {talla.nombre}
              {(talla.conteo ?? 0) > 0 && (
                <span style={{ 
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  background: filtroTalla === talla.id ? '#fff' : 'var(--color-violet)',
                  color: filtroTalla === talla.id ? 'var(--color-violet)' : '#fff',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {talla.conteo}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Filtro por color */}
      <div>
        <h3 style={{ 
          color: 'var(--color-violet)', 
          fontSize: 16, 
          fontWeight: 600, 
          marginBottom: 16,
          textTransform: 'uppercase',
          borderBottom: '1px solid rgba(162, 89, 255, 0.3)',
          paddingBottom: 8,
          letterSpacing: '0.5px',
          fontFamily: "'Montserrat', sans-serif"
        }}>
          Colores
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          {colores.map((color: any) => (
            <motion.button
              key={color.id}
              onClick={() => setFiltroColor(
                filtroColor === color.id ? null : color.id
              )}
              whileHover={{ scale: 1.15, boxShadow: `0 0 15px ${color.codigo_hex}` }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: color.codigo_hex,
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: filtroColor === color.id 
                  ? '3px solid var(--color-violet)' 
                  : '1px solid #444',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={`${color.nombre} (${color.conteo})`}
            >
              {filtroColor === color.id && (
                <span
                  style={{ 
                    position: 'absolute',  
                    color: getContrastColor(color.codigo_hex), 
                    fontSize: 14,
                    fontWeight: 'bold'
                  }}
                >
                  ✓
                </span>
              )}
              
              {color.conteo > 0 && (
                <span style={{ 
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  background: '#fff',
                  color: '#000',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #444'
                }}>
                  {color.conteo}
                </span>
              )}
            </motion.button>
          ))}
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {colores.map((color: any) => (
            <div
              key={color.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 13,
                color: filtroColor === color.id ? '#fff' : '#ccc',
                gap: 5,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <div style={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                background: color.codigo_hex,
                border: '1px solid #444'
              }}></div>
              <span>{color.nombre}</span>
              <span style={{ 
                color: filtroColor === color.id ? 'var(--color-violet)' : '#888',
                fontWeight: filtroColor === color.id ? 600 : 400
              }}>
                ({color.conteo})
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Limpiar todos los filtros */}
      {(filtroCategoria || filtroSubcategoria || filtroColor || filtroTalla || filtroPrecio[0] > 0 || filtroPrecio[1] < precioMaximo) && (
        <motion.button
          whileHover={{ 
            scale: 1.03, 
            boxShadow: '0 0 20px rgba(162, 89, 255, 0.3)',
            background: 'linear-gradient(135deg, #a259ff, #7e22ce)'
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setFiltroCategoria(null);
            setFiltroSubcategoria(null);
            setFiltroColor(null);
            setFiltroTalla(null);
            setFiltroPrecio([0, precioMaximo]);
          }}
          style={{
            background: 'linear-gradient(135deg, var(--color-violet), #7e22ce)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 0',
            fontSize: 14,
            marginTop: 24,
            cursor: 'pointer',
            width: '100%',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(162, 89, 255, 0.2)',
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Limpiar todos los filtros
        </motion.button>
      )}
    </motion.aside>
  );

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        maxWidth: 1300, 
        margin: '0 auto', 
        padding: '1rem 1.5rem 3rem'
      }}
    >
      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ 
          fontSize: '2.2rem', 
          marginBottom: '2rem', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--color-violet), #8b5cf6)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 8px rgba(162, 89, 255, 0.2)',
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}
      >
        Catálogo de Productos
      </motion.h1>
      
      {/* Botón de filtros para móvil */}
      <div className="filtros-mobile-toggle" style={{ 
        margin: '0 auto 1rem'
      }}>
        <motion.button
          whileHover={{ 
            scale: 1.03,
            boxShadow: '0 5px 15px rgba(162, 89, 255, 0.3)'
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setMostrarFiltrosMobile(!mostrarFiltrosMobile)}
          style={{
            background: mostrarFiltrosMobile 
              ? 'linear-gradient(135deg, var(--color-violet), #7e22ce)' 
              : 'linear-gradient(145deg, #1a1a1a, #232323)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          <span>
            {mostrarFiltrosMobile ? 'Ocultar filtros' : 'Mostrar filtros'}
          </span>
          <span style={{ fontSize: 16 }}>
            {mostrarFiltrosMobile ? '↑' : '↓'}
          </span>
        </motion.button>
      </div>
      
      {loading ? (
        // Esqueleto de carga mejorado
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Esqueleto de filtros */}
          <div className="filtros-desktop" style={{ 
            width: 240,
            minWidth: 240,
            background: 'linear-gradient(145deg, #1a1a1a, #232323)',
            borderRadius: 12,
            padding: '1.5rem 1rem',
            height: 500,
            position: 'sticky',
            top: 20,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            animation: 'pulseAnimation 1.5s infinite'
          }}></div>

          {/* Esqueleto de productos */}
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 24,
              padding: '10px 0',
              borderBottom: '1px solid #333'
            }}>
              <div style={{ width: 100, height: 16, background: '#333', borderRadius: 8, animation: 'pulseAnimation 1.5s infinite' }}></div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ 
                    width: 32, 
                    height: 32, 
                    background: '#333', 
                    borderRadius: 6,
                    animation: `pulseAnimation 1.5s infinite ${i * 0.2}s`
                  }}></div>
                ))}
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem'
            }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ 
                  borderRadius: '1rem',
                  background: '#1a1a1a',
                  aspectRatio: '3/4',
                  animation: `pulseAnimation 1.5s infinite ${i * 0.1}s`,
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Contenido principal cuando todo está cargado
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Filtros para pantallas grandes */}
          <div className="filtros-desktop">
            <SidebarFiltros />
          </div>

          {/* Contenido principal: productos */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ flex: 1 }}
          >
            {/* Controles y vista de productos */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 24,
              padding: '10px 0',
              borderBottom: '1px solid rgba(162, 89, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span 
          style={{
                    color: productosFiltrados.length < productos.length ? 'var(--color-violet)' : '#ccc', 
                    fontSize: 14,
                    fontWeight: productosFiltrados.length < productos.length ? 600 : 400,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Mostrando: {productosFiltrados.length} de {productos.length}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button
                  whileHover={{ 
                    background: view === 'grid' ? 'rgba(162, 89, 255, 0.3)' : 'rgba(42, 42, 42, 0.8)',
                    boxShadow: view === 'grid' ? '0 0 10px rgba(162, 89, 255, 0.4)' : 'none'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView('grid')}
                  style={{
                    background: view === 'grid' ? 'rgba(162, 89, 255, 0.2)' : 'transparent',
                    color: view === 'grid' ? 'var(--color-violet)' : '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    transition: 'all 0.2s'
                  }}
                  title="Vista grid"
                >
                  <span style={{ fontSize: 15 }}>□</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ 
                    background: view === 'large' ? 'rgba(162, 89, 255, 0.3)' : 'rgba(42, 42, 42, 0.8)',
                    boxShadow: view === 'large' ? '0 0 10px rgba(162, 89, 255, 0.4)' : 'none'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView('large')}
                  style={{
                    background: view === 'large' ? 'rgba(162, 89, 255, 0.2)' : 'transparent',
                    color: view === 'large' ? 'var(--color-violet)' : '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    transition: 'all 0.2s'
                  }}
                  title="Vista grande"
                >
                  <span style={{ fontSize: 18 }}>▣</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ 
                    background: view === 'small' ? 'rgba(162, 89, 255, 0.3)' : 'rgba(42, 42, 42, 0.8)',
                    boxShadow: view === 'small' ? '0 0 10px rgba(162, 89, 255, 0.4)' : 'none'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView('small')}
                  style={{
                    background: view === 'small' ? 'rgba(162, 89, 255, 0.2)' : 'transparent',
                    color: view === 'small' ? 'var(--color-violet)' : '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    transition: 'all 0.2s'
                  }}
                  title="Vista pequeña"
                >
                  <span style={{ fontSize: 12 }}>⊞</span>
                </motion.button>
              </div>
            </div>

            {/* Lista de productos */}
            {productosFiltrados.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: 'linear-gradient(145deg, rgba(30,30,30,0.6), rgba(20,20,20,0.8))',
                  borderRadius: 16,
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(162, 89, 255, 0.15)'
                }}
              >
                <h3 style={{ 
                  color: 'var(--color-violet)', 
                  fontSize: '1.2rem', 
                  marginBottom: '1rem',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700
                }}>
                  No se encontraron productos
                </h3>
                <p style={{ 
                  color: 'var(--color-white)',
                  opacity: 0.8,
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.95rem',
                  maxWidth: '500px',
                  margin: '0 auto'
                }}>
                  Intenta con otros filtros o revisa nuestro catálogo completo.
                </p>
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 0 20px rgba(162, 89, 255, 0.4)',
                    background: 'linear-gradient(135deg, #a259ff, #7e22ce)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setFiltroCategoria(null);
                    setFiltroSubcategoria(null);
                    setFiltroColor(null);
                    setFiltroTalla(null);
                    setFiltroPrecio([0, precioMaximo]);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, var(--color-violet), #8b5cf6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.8rem 1.5rem',
                    marginTop: '1.5rem',
                  cursor: 'pointer',
                    fontWeight: 600,
                    fontFamily: "'Poppins', sans-serif",
                    boxShadow: '0 5px 15px rgba(162, 89, 255, 0.3)',
                    letterSpacing: '0.5px'
                  }}
                >
                  Ver todo el catálogo
                </motion.button>
              </motion.div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${getColumnas()}, 1fr)`,
                gap: '1.5rem'
              }}>
                {productosFiltrados.map((producto) => {
                  // Obtener la imagen principal o la primera si no hay principal
                  const imagenPrincipal = producto.imagenes.find(img => img.es_principal) || producto.imagenes[0];
                  // Obtener el nombre de la categoría si existe
                  const categoriaNombre = categorias.find(cat => cat.id === producto.category_id)?.nombre;
                  // Obtener subcategoría si existe
                  const subcategoriaNombre = producto.subcategory_id 
                    ? subcategorias.find(sc => sc.id === producto.subcategory_id)?.nombre 
                    : null;
                  // Obtener colores disponibles
                  const coloresProducto = colores
                    .filter(color => producto.variantes.some(v => v.color_id === color.id && v.stock > 0));
                  // Obtener tallas disponibles
                  const tallasProducto = tallas
                    .filter(talla => producto.variantes.some(v => v.size_id === talla.id && v.stock > 0));

                  return (
                    <ProductCard 
                      key={producto.id}
                      id={producto.id}
                      nombre={producto.nombre}
                      precio={producto.precio}
                      imagenUrl={imagenPrincipal?.url || ''}
                      categoria={categoriaNombre}
                      subcategoria={subcategoriaNombre}
                      colores={coloresProducto}
                      tallas={tallasProducto}
                    />
                  );
                })}
              </div>
            )}
        </motion.div>
        </div>
      )}
      
      {/* Filtros móviles (solo se muestran cuando mostrarFiltrosMobile es true) */}
      <AnimatePresence>
        {mostrarFiltrosMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              overflow: 'hidden',
              marginBottom: 20
            }}
          >
            <div style={{ 
              background: 'linear-gradient(145deg, #1a1a1a, #232323)', 
              borderRadius: 12,
              padding: '1.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem',
              border: '1px solid rgba(162, 89, 255, 0.15)'
            }}>
              {/* Filtro Precio */}
              <div>
                <h3 style={{ 
                  color: 'var(--color-violet)', 
                  fontSize: '0.9rem', 
                  marginBottom: '1rem',
                  borderBottom: '1px solid rgba(162, 89, 255, 0.3)',
                  paddingBottom: 8,
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  PRECIO
                </h3>
                
                <div style={{ padding: '0 8px' }}>
                  <input 
                    type="range" 
                    min="0" 
                    max={precioMaximo} 
                    value={filtroPrecio[1]} 
                    onChange={(e) => setFiltroPrecio([filtroPrecio[0], parseInt(e.target.value)])}
                    style={{ 
                      width: '100%', 
                      marginBottom: 10,
                      accentColor: 'var(--color-violet)',
                      cursor: 'pointer'
                    }}
                  />
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    color: '#aaa', 
                    fontSize: 12,
                    fontFamily: "'Poppins', sans-serif" 
                  }}>
                    <span>${filtroPrecio[0].toLocaleString()}</span>
                    <span>${filtroPrecio[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Filtro Categorías */}
              <div>
                <h3 style={{ 
                  color: 'var(--color-violet)', 
                  fontSize: '0.9rem', 
                  marginBottom: '1rem',
                  borderBottom: '1px solid rgba(162, 89, 255, 0.3)',
                  paddingBottom: 8,
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  CATEGORÍAS
                </h3>
                
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 8
                }}>
                  {conteoCategorias.map((cat) => (
                    <motion.button
                      key={cat.id}
                      onClick={() => setFiltroCategoria(
                        filtroCategoria === cat.id ? null : cat.id
                      )}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        background: filtroCategoria === cat.id 
                          ? 'var(--color-violet)' 
                          : 'rgba(30,30,30,0.8)',
                        color: filtroCategoria === cat.id ? '#fff' : '#ddd',
                        border: filtroCategoria === cat.id 
                          ? 'none' 
                          : '1px solid rgba(162, 89, 255, 0.3)',
                        borderRadius: 20,
                        padding: '5px 10px',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: "'Poppins', sans-serif"
                      }}
                    >
                      {cat.nombre} ({cat.conteo})
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Filtros por Color y Talla */}
              <div>
                <h3 style={{ 
                  color: 'var(--color-violet)', 
                  fontSize: '0.9rem', 
                  marginBottom: '1rem',
                  borderBottom: '1px solid rgba(162, 89, 255, 0.3)',
                  paddingBottom: 8,
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  COLORES Y TALLAS
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16
                }}>
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {colores.slice(0, 8).map((color: any) => (
                        <motion.button
                          key={color.id}
                          onClick={() => setFiltroColor(
                            filtroColor === color.id ? null : color.id
                          )}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          style={{
                            background: color.codigo_hex,
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            border: filtroColor === color.id 
                              ? '3px solid var(--color-violet)' 
                              : '1px solid #444',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                          title={color.nombre}
                        >
                          {filtroColor === color.id && (
                            <span style={{ 
                              position: 'absolute', 
                              top: '50%', 
                              left: '50%', 
                              transform: 'translate(-50%, -50%)',
                              color: getContrastColor(color.codigo_hex),
                              fontSize: 12,
                              fontWeight: 'bold'
                            }}>✓</span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {tallas.map((talla) => (
                        <motion.button
                          key={talla.id}
                          onClick={() => setFiltroTalla(
                            filtroTalla === talla.id ? null : talla.id
                          )}
                          whileTap={{ scale: 0.9 }}
                          style={{
                            background: filtroTalla === talla.id 
                              ? 'var(--color-violet)' 
                              : 'rgba(30,30,30,0.8)',
                            color: filtroTalla === talla.id ? '#fff' : '#ddd',
                            border: filtroTalla === talla.id 
                              ? 'none' 
                              : '1px solid rgba(162, 89, 255, 0.3)',
                            borderRadius: 8,
                            padding: '4px 0',
                            fontSize: 12,
                            fontWeight: 600,
                            width: 32,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        >
                          {talla.nombre}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botón para limpiar filtros */}
              <div style={{ 
                gridColumn: '1 / -1',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <motion.button
                  whileHover={{ 
                    scale: 1.03, 
                    boxShadow: '0 0 20px rgba(162, 89, 255, 0.3)',
                    background: 'linear-gradient(135deg, #a259ff, #7e22ce)'
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setFiltroCategoria(null);
                    setFiltroSubcategoria(null);
                    setFiltroColor(null);
                    setFiltroTalla(null);
                    setFiltroPrecio([0, precioMaximo]);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, var(--color-violet), #7e22ce)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.6rem 1.5rem',
                    fontSize: 14,
                    cursor: 'pointer',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(162, 89, 255, 0.2)',
                    fontFamily: "'Poppins', sans-serif",
                    marginTop: 10
                  }}
                >
                  Limpiar filtros
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Estilo para la animación de pulso */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        
        @keyframes pulseAnimation {
          0% { opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { opacity: 0.3; }
        }
        
        :root {
          --color-violet: #a259ff;
          --color-purple: #8b5cf6;
          --color-orange: #ff6a00;
        }
        
        /* Mejorar tipografía general */
        body {
          font-family: 'Poppins', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Montserrat', sans-serif;
        }
        
        /* Estilos para las badges de filtros activos */
        .filtro-activo {
          display: inline-flex;
          align-items: center;
          background: rgba(162, 89, 255, 0.1);
          border: 1px solid rgba(162, 89, 255, 0.3);
          border-radius: 20px;
          padding: 5px 12px;
          margin-right: 8px;
          margin-bottom: 8px;
          font-size: 13px;
          color: var(--color-violet);
          transition: all 0.2s;
        }
        
        .filtro-activo:hover {
          background: rgba(162, 89, 255, 0.2);
        }
        
        .filtro-activo .cerrar {
          margin-left: 6px;
          font-size: 14px;
          cursor: pointer;
        }
        
        /* Mejoras para móviles */
        @media (max-width: 768px) {
          .producto-card {
            transform: none !important;
          }
          
          .filtro-activo {
            font-size: 12px;
            padding: 4px 10px;
          }
        }
      `}</style>
    </motion.section>
  );
}

// Estilos globales para el catálogo
const styles = `
  .producto-card {
    transform: translateY(0);
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(162, 89, 255, 0.08);
    background: linear-gradient(145deg, #1a1a1a, #232323);
  }
  
  .producto-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(162, 89, 255, 0.15);
  }
  
  .producto-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(162, 89, 255, 0.1), transparent);
    transform: translateX(-150%);
    transition: 0.7s;
  }
  
  .producto-card:hover::after {
    transform: translateX(100%);
  }
  
  .producto-card img {
    transition: all 0.5s ease;
    object-fit: cover;
  }
  
  .producto-card:hover img {
    transform: scale(1.05);
  }
  
  .producto-card .card-info {
    position: relative;
    z-index: 2;
    backdrop-filter: blur(5px);
    border-top: 1px solid rgba(162, 89, 255, 0.1);
  }
  
  .producto-card .card-tag {
    background: rgba(162, 89, 255, 0.2);
    color: var(--color-violet);
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  
  .producto-card .card-title {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    margin-top: 5px;
    color: #fff;
    transition: color 0.3s;
  }
  
  .producto-card:hover .card-title {
    color: var(--color-violet);
  }
  
  .producto-card .card-price {
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1.2rem;
    color: var(--color-violet);
    margin-top: 5px;
  }
  
  .producto-card .card-btn {
    background: linear-gradient(135deg, var(--color-violet), #8b5cf6);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 5px 15px rgba(162, 89, 255, 0.3);
    letter-spacing: 0.5px;
  }
  
  .producto-card .card-btn:hover {
    box-shadow: 0 8px 20px rgba(162, 89, 255, 0.4);
    transform: translateY(-3px);
  }
  
  .producto-card .card-sizes {
    display: flex;
    gap: 4px;
    margin-top: 8px;
  }
  
  .producto-card .card-size {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(30,30,30,0.8);
    border: 1px solid rgba(162, 89, 255, 0.2);
    border-radius: 50%;
    font-size: 10px;
    color: #ddd;
  }
  
  @media (max-width: 768px) {
    .filtros-desktop {
      display: none;
    }
    
    .filtros-mobile-toggle {
      display: block !important;
    }
  }
`;

// Insertar estilos en el documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
} 