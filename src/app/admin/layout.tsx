"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import './admin-layout.css';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AdminGuard from '@/components/AdminGuard';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Hook para cerrar sesión
  const router = useRouter();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };
  
  return (
    <AdminGuard>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h2 className="admin-logo">Strix Admin</h2>
          <nav className="admin-nav">
            <Link href="/admin" className="admin-link">Dashboard</Link>
            <Link href="/admin/productos" className="admin-link">Productos</Link>
            <Link href="/admin/pedidos" className="admin-link">Pedidos</Link>
            <Link href="/admin/usuarios" className="admin-link">Usuarios</Link>
            <Link href="/admin/mayoristas" className="admin-link">Pedidos Mayoristas</Link>
          </nav>
          <button 
            className="admin-btn" 
            style={{ 
              marginTop: 'auto', 
              width: '100%', 
              background: '#e85a84', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: 17, 
              borderRadius: 12 
            }} 
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </aside>
        <main className="admin-main">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
} 