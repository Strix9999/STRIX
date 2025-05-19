"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function MayoristasPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      setCargando(true);
      setError(null);
      const { data, error } = await supabase.from("wholesale_orders").select("*").order("fecha", { ascending: false });
      if (error) setError("Error al cargar pedidos mayoristas");
      setPedidos(data || []);
      setCargando(false);
    };
    fetchPedidos();
  }, []);

  return (
    <section className="admin-glass">
      <h1 style={{ fontSize: "2rem", color: "#ff6a00", marginBottom: 24, textShadow: '0 2px 12px #0008' }}>Pedidos Mayoristas</h1>
      <Link href="/admin/mayoristas/nuevo" className="admin-btn" style={{ marginBottom: 24, fontSize: 17, borderRadius: 10, padding: '12px 28px' }}>+ Nuevo pedido mayorista</Link>
      {cargando ? (
        <p>Cargando pedidos...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#23232b", borderRadius: 18, boxShadow: "0 2px 16px 0 #ff6a00aa", minWidth: 900, color: '#fff', fontWeight: 500 }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #ff6a00 60%, #23232b 100%)", color: "#fff" }}>
                <th style={{ padding: 12 }}>ID</th>
                <th style={{ padding: 12 }}>Proveedor</th>
                <th style={{ padding: 12 }}>Fecha</th>
                <th style={{ padding: 12 }}>Total</th>
                <th style={{ padding: 12 }}>Estado</th>
                <th style={{ padding: 12 }}>Notas</th>
                <th style={{ padding: 12 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #ff6a00" }}>
                  <td style={{ padding: 12 }}>{p.id}</td>
                  <td style={{ padding: 12 }}>{p.proveedor}</td>
                  <td style={{ padding: 12 }}>{p.fecha ? new Date(p.fecha).toLocaleDateString() : ""}</td>
                  <td style={{ padding: 12 }}>{p.total ? `$${p.total}` : "-"}</td>
                  <td style={{ padding: 12 }}>{p.estado}</td>
                  <td style={{ padding: 12, maxWidth: 180, whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.notas}</td>
                  <td style={{ padding: 12 }}>
                    <Link href={`/admin/mayoristas/${p.id}`} className="admin-btn" style={{ borderRadius: 8, padding: '7px 18px', fontSize: 15, fontWeight: 600 }}>Ver / Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
} 