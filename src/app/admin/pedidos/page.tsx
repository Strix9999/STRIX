'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      setCargando(true);
      const { data } = await supabase
        .from('orders')
        .select('id, user_id, estado, total, created_at')
        .order('created_at', { ascending: false });
      setPedidos(data || []);
      setCargando(false);
    })();
  }, []);

  return (
    <AdminGuard>
      <section className="admin-glass">
        <h1 style={{ color: 'var(--color-orange)', fontSize: '2rem', marginBottom: 24 }}>Pedidos</h1>
        {cargando ? (
          <p style={{ color: 'var(--color-orange)', textAlign: 'center' }}>Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <p style={{ color: 'var(--color-white)', textAlign: 'center' }}>No hay pedidos registrados.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#23232b', borderRadius: 18, boxShadow: '0 2px 16px 0 #a084e8aa', minWidth: 700, color: '#fff', fontWeight: 500 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #a084e8 60%, #23232b 100%)', color: '#fff' }}>
                <th style={{ padding: 12 }}>ID</th>
                <th style={{ padding: 12 }}>Usuario</th>
                <th style={{ padding: 12 }}>Estado</th>
                <th style={{ padding: 12 }}>Total</th>
                <th style={{ padding: 12 }}>Fecha</th>
                <th style={{ padding: 12 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id} style={{ borderBottom: '1px solid #a084e8' }}>
                  <td style={{ color: '#ff6a00', padding: 10 }}>{pedido.id}</td>
                  <td style={{ padding: 10 }}>{pedido.user_id || '-'}</td>
                  <td style={{ padding: 10 }}>{pedido.estado}</td>
                  <td style={{ padding: 10 }}>${pedido.total}</td>
                  <td style={{ padding: 10 }}>{new Date(pedido.created_at).toLocaleString()}</td>
                  <td style={{ padding: 10 }}>
                    <Link href={`/admin/pedidos/${pedido.id}`} className="admin-btn" style={{ padding: '6px 18px', fontSize: 15, borderRadius: 8 }}>Ver detalles</Link>
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