'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDinero: 0,
    totalStock: 0,
    gananciaPotencial: 0,
    usuariosOnline: 0,
  });
  useEffect(() => {
    (async () => {
      // Total dinero (sumatoria de pedidos pagados y entregados)
      const { data: pedidos } = await supabase.from('orders').select('total, estado');
      const totalDinero = (pedidos || []).filter(p => p.estado === 'pagado' || p.estado === 'entregado').reduce((acc, p) => acc + Number(p.total || 0), 0);
      // Stock y ganancia potencial
      const { data: productos } = await supabase.from('products').select('precio, stock');
      const totalStock = (productos || []).reduce((acc, p) => acc + Number(p.stock || 0), 0);
      const gananciaPotencial = (productos || []).reduce((acc, p) => acc + (Number(p.precio || 0) * Number(p.stock || 0)), 0);
      // Usuarios online (simulado: usuarios con updated_at en los últimos 5 minutos)
      const { data: users } = await supabase.from('user_profiles').select('updated_at');
      const now = new Date();
      const usuariosOnline = (users || []).filter(u => u.updated_at && (now.getTime() - new Date(u.updated_at).getTime()) < 5 * 60 * 1000).length;
      setStats({ totalDinero, totalStock, gananciaPotencial, usuariosOnline });
    })();
  }, []);

  return (
    <section className="admin-glass" style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', minHeight: 320 }}>
      <StatCard color="#a084e8" title="Total dinero" value={`$${stats.totalDinero.toLocaleString()}`} icon="💰" />
      <StatCard color="#ff6a00" title="Stock total" value={stats.totalStock} icon="📦" />
      <StatCard color="#e85a84" title="Ganancia potencial" value={`$${stats.gananciaPotencial.toLocaleString()}`} icon="🚀" />
      <StatCard color="#00e0d3" title="Usuarios online" value={stats.usuariosOnline} icon="🟢" />
    </section>
  );
}

function StatCard({ color, title, value, icon }: { color: string, title: string, value: any, icon: string }) {
  return (
    <div style={{ minWidth: 220, minHeight: 140, background: 'rgba(30,20,40,0.82)', borderRadius: 22, boxShadow: `0 4px 32px 0 ${color}55`, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, border: `2.5px solid ${color}`, backdropFilter: 'blur(6px)', animation: 'fadeInDash 0.8s cubic-bezier(.4,0,.2,1)' }}>
      <span style={{ fontSize: 38, marginBottom: 8 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 22, color }}>{value}</span>
      <span style={{ fontWeight: 600, fontSize: 16, color: '#fff', opacity: 0.85 }}>{title}</span>
    </div>
  );
} 