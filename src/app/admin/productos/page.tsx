'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminProductos() {
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      setCargando(true);
      const { data } = await supabase.from('products').select('*');
      setProductos(data || []);
      setCargando(false);
    })();
  }, []);

  return (
    <AdminGuard>
      <section className="admin-glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ color: 'var(--color-orange)', fontSize: '2rem' }}>Productos</h1>
          <Link href="/admin/productos/nuevo" className="admin-btn" style={{ padding: '0.7rem 2rem', fontSize: 16, borderRadius: 14 }}>+ Nuevo producto</Link>
        </div>
        {cargando ? (
          <p style={{ color: 'var(--color-orange)', textAlign: 'center' }}>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p style={{ color: 'var(--color-white)', textAlign: 'center' }}>No hay productos registrados.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#23232b', borderRadius: 18, boxShadow: '0 2px 16px 0 #a084e8aa', minWidth: 700, color: '#fff', fontWeight: 500 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #a084e8 60%, #23232b 100%)', color: '#fff' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>ID</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Precio</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Stock</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid #a084e8' }}>
                  <td style={{ padding: 10 }}>{prod.id}</td>
                  <td style={{ color: '#ff6a00', padding: 10 }}>{prod.nombre}</td>
                  <td style={{ padding: 10 }}>${prod.precio}</td>
                  <td style={{ padding: 10 }}>{prod.stock}</td>
                  <td style={{ padding: 10 }}>
                    <Link href={`/admin/productos/editar/${prod.id}`} className="admin-btn" style={{ padding: '6px 18px', fontSize: 15, borderRadius: 8, marginRight: 8 }}>Editar</Link>
                    <button className="admin-btn" style={{ padding: '6px 18px', fontSize: 15, borderRadius: 8, background: '#e85a84' }} onClick={() => alert('Eliminar próximamente')}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </AdminGuard>
  );
} 