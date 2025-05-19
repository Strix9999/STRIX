'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ESTADOS = ['pendiente', 'enviado', 'entregado', 'cancelado'];

export default function DetallePedido() {
  const router = useRouter();
  const { id } = useParams();
  const [pedido, setPedido] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setCargando(true);
      // Traer pedido
      const { data: ped } = await supabase.from('orders').select('*').eq('id', id).single();
      setPedido(ped);
      // Traer usuario
      if (ped?.user_id) {
        const { data: user } = await supabase.from('user_profiles').select('*').eq('id', ped.user_id).single();
        setUsuario(user);
      }
      // Traer items
      const { data: its } = await supabase
        .from('order_items')
        .select('*, products(nombre), sizes(nombre), colors(nombre)')
        .eq('order_id', id);
      setItems(its || []);
      // Traer historial de estado
      const { data: hist } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', id)
        .order('fecha', { ascending: false });
      setHistorial(hist || []);
      setCargando(false);
    })();
  }, [id]);

  const handleEstado = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGuardando(true);
    setError(null);
    setExito(false);
    const { error } = await supabase.from('orders').update({ estado: e.target.value }).eq('id', id);
    if (error) {
      setError('No se pudo actualizar el estado.');
    } else {
      setExito(true);
      setPedido({ ...pedido, estado: e.target.value });
    }
    setGuardando(false);
  };

  if (cargando) return <p style={{ color: 'var(--color-orange)', textAlign: 'center', marginTop: '3rem' }}>Cargando pedido...</p>;
  if (!pedido) return <p style={{ color: 'red', textAlign: 'center', marginTop: '3rem' }}>Pedido no encontrado.</p>;

  return (
    <AdminGuard>
      <section style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem', background: 'var(--color-gray)', borderRadius: '1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.2)' }}>
        <h1 style={{ color: 'var(--color-orange)', fontSize: '2rem', marginBottom: 24 }}>Detalle del pedido #{pedido.id}</h1>
        <div style={{ marginBottom: 24 }}>
          <b style={{ color: 'var(--color-white)' }}>Estado:</b>{' '}
          <select value={pedido.estado} onChange={handleEstado} disabled={guardando} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', fontWeight: 700, background: 'var(--color-violet)', color: 'var(--color-white)' }}>
            {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
          </select>
          {guardando && <span style={{ color: 'var(--color-orange)', marginLeft: 12 }}>Guardando...</span>}
          {error && <span style={{ color: 'red', marginLeft: 12 }}>{error}</span>}
          {exito && <span style={{ color: 'var(--color-orange)', marginLeft: 12 }}>¡Estado actualizado!</span>}
        </div>
        <div style={{ marginBottom: 24 }}>
          <b style={{ color: 'var(--color-white)' }}>Usuario:</b>{' '}
          {usuario ? (
            <span style={{ color: 'var(--color-orange)' }}>{usuario.nombre} {usuario.apellido} ({usuario.email || pedido.user_id})</span>
          ) : pedido.user_id ? (
            <span style={{ color: 'var(--color-orange)' }}>{pedido.user_id}</span>
          ) : (
            <span style={{ color: 'var(--color-white)' }}>No registrado</span>
          )}
        </div>
        <div style={{ marginBottom: 24 }}>
          <b style={{ color: 'var(--color-white)' }}>Total:</b>{' '}
          <span style={{ color: 'var(--color-orange)', fontWeight: 700 }}>${pedido.total}</span>
        </div>
        <div style={{ marginBottom: 24 }}>
          <b style={{ color: 'var(--color-white)' }}>Fecha:</b>{' '}
          <span style={{ color: 'var(--color-white)' }}>{new Date(pedido.created_at).toLocaleString()}</span>
        </div>
        <div style={{ marginBottom: 24 }}>
          <b style={{ color: 'var(--color-white)' }}>Dirección de envío:</b>{' '}
          {usuario ? (
            <span style={{ color: 'var(--color-orange)' }}>
              {usuario.direccion} {usuario.numeracion}, {usuario.localidad}, {usuario.provincia}, CP {usuario.codigo_postal} <br />
              Tel: {usuario.telefono}
            </span>
          ) : (
            <span style={{ color: 'var(--color-white)' }}>No disponible</span>
          )}
        </div>
        <div style={{ marginBottom: 24 }}>
          <b style={{ color: 'var(--color-white)' }}>Historial de estado:</b>
          {historial.length === 0 ? (
            <span style={{ color: 'var(--color-white)', marginLeft: 8 }}>Sin historial</span>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-black)', borderRadius: 12, overflow: 'hidden', marginTop: 8 }}>
              <thead>
                <tr style={{ background: 'var(--color-violet)' }}>
                  <th style={{ color: 'var(--color-white)', padding: 8 }}>Estado</th>
                  <th style={{ color: 'var(--color-white)', padding: 8 }}>Fecha</th>
                  <th style={{ color: 'var(--color-white)', padding: 8 }}>Comentario</th>
                </tr>
              </thead>
              <tbody>
                {historial.map(h => (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--color-gray)' }}>
                    <td style={{ color: 'var(--color-orange)', padding: 8 }}>{h.status}</td>
                    <td style={{ color: 'var(--color-white)', padding: 8 }}>{new Date(h.fecha).toLocaleString()}</td>
                    <td style={{ color: 'var(--color-white)', padding: 8 }}>{h.comentario || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <button style={{ background: 'var(--color-violet)', color: 'var(--color-white)', border: 'none', borderRadius: 12, padding: '0.7rem 2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginBottom: 24 }} onClick={() => alert('Funcionalidad de notificación próximamente')}>Notificar usuario</button>
        <button onClick={() => router.push('/admin/pedidos')} style={{ background: 'var(--color-black)', color: 'var(--color-white)', border: '1px solid var(--color-violet)', borderRadius: 12, padding: '0.7rem 2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          Volver al listado
        </button>
      </section>
    </AdminGuard>
  );
} 