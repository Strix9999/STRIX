"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type WholesaleOrder = {
  proveedor: string;
  fecha: string;
  total: string;
  estado: string;
  notas: string;
  [key: string]: any;
};

export default function EditarPedidoMayorista() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [form, setForm] = useState({ proveedor: "", fecha: "", total: "", estado: "pendiente", notas: "" });
  const [items, setItems] = useState<{ producto: string; cantidad: number; precio_unitario: string }[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedido = async () => {
      if (!id) return;
      
      setCargando(true);
      setError(null);
      // Convertir el id a string para asegurar compatibilidad de tipos
      const idString = Array.isArray(id) ? id[0] : String(id);
      
      const { data, error } = await supabase.from("wholesale_orders").select("*").eq("id", idString).single();
      if (error) { setError("Error al cargar pedido"); setCargando(false); return; }
      
      if (data) {
        const orderData = data as WholesaleOrder;
        setForm({
          proveedor: orderData.proveedor || "",
          fecha: orderData.fecha ? orderData.fecha.slice(0, 10) : "",
          total: orderData.total || "",
          estado: orderData.estado || "pendiente",
          notas: orderData.notas || ""
        });
      }
      
      const { data: itemsData } = await supabase.from("wholesale_order_items").select("*").eq("wholesale_order_id", idString);
      setItems(itemsData?.map((item: any) => ({ 
        producto: item.producto, 
        cantidad: item.cantidad, 
        precio_unitario: item.precio_unitario || "" 
      })) || []);
      
      setCargando(false);
    };
    
    if (id) fetchPedido();
  }, [id]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItems(items => items.map((item, i) => i === idx ? { ...item, [name]: name === 'cantidad' ? Number(value) : value } : item));
  };

  const addItem = () => setItems([...items, { producto: "", cantidad: 1, precio_unitario: "" }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    // Convertir id a string
    const idString = Array.isArray(id) ? id[0] : String(id);
    
    setGuardando(true);
    setError(null);
    try {
      // Actualizar pedido
      await supabase.from("wholesale_orders").update({
        proveedor: form.proveedor,
        fecha: form.fecha ? new Date(form.fecha) : new Date(),
        total: form.total || null,
        estado: form.estado,
        notas: form.notas
      }).eq("id", idString);
      
      // Eliminar ítems existentes y volver a insertar (simple y seguro)
      await supabase.from("wholesale_order_items").delete().eq("wholesale_order_id", idString);
      
      for (const item of items) {
        if (!item.producto) continue;
        await supabase.from("wholesale_order_items").insert({
          wholesale_order_id: idString,
          producto: item.producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario || null
        });
      }
      
      router.push("/admin/mayoristas");
    } catch (err: any) {
      setError("Error al guardar cambios");
    }
    setGuardando(false);
  };

  return (
    <section style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 32px 0 rgba(0,0,0,0.12)' }}>
      <h1 style={{ color: '#a084e8', fontSize: '1.7rem', marginBottom: 18 }}>Editar pedido mayorista</h1>
      {cargando ? <p>Cargando...</p> : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <input name="proveedor" value={form.proveedor} onChange={handleFormChange} placeholder="Proveedor" required style={{ padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
          <input name="fecha" type="date" value={form.fecha} onChange={handleFormChange} style={{ padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
          <input name="total" type="number" value={form.total} onChange={handleFormChange} placeholder="Total (opcional)" style={{ padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
          <select name="estado" value={form.estado} onChange={handleFormChange} style={{ padding: 10, borderRadius: 8, border: '1px solid #eee' }}>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <textarea name="notas" value={form.notas} onChange={handleFormChange} placeholder="Notas (opcional)" rows={3} style={{ padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
          <h3 style={{ color: '#ff6a00', margin: '10px 0 0 0' }}>Ítems del pedido</h3>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
              <input name="producto" value={item.producto} onChange={e => handleItemChange(idx, e)} placeholder="Producto" required style={{ flex: 2, padding: 8, borderRadius: 6, border: '1px solid #eee' }} />
              <input name="cantidad" type="number" min={1} value={item.cantidad} onChange={e => handleItemChange(idx, e)} placeholder="Cantidad" required style={{ width: 80, padding: 8, borderRadius: 6, border: '1px solid #eee' }} />
              <input name="precio_unitario" type="number" value={item.precio_unitario} onChange={e => handleItemChange(idx, e)} placeholder="Precio unitario" style={{ width: 120, padding: 8, borderRadius: 6, border: '1px solid #eee' }} />
              {items.length > 1 && <button type="button" onClick={() => removeItem(idx)} style={{ background: '#e85a84', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>-</button>}
            </div>
          ))}
          <button type="button" onClick={addItem} style={{ background: '#23232b', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', cursor: 'pointer', marginBottom: 10 }}>+ Agregar ítem</button>
          {error && <span style={{ color: 'red' }}>{error}</span>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={() => router.push('/admin/mayoristas')} style={{ background: '#eee', color: '#23232b', border: 'none', borderRadius: 6, padding: '7px 18px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={guardando} style={{ background: '#a084e8', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', cursor: 'pointer' }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      )}
    </section>
  );
} 