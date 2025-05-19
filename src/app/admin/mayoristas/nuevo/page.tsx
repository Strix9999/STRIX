"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NuevoPedidoMayorista() {
  const router = useRouter();
  const [form, setForm] = useState({ proveedor: "", fecha: "", total: "", estado: "pendiente", notas: "" });
  const [items, setItems] = useState([{ producto: "", cantidad: 1, precio_unitario: "" }]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setGuardando(true);
    setError(null);
    try {
      // Insertar pedido mayorista
      const { data, error: errorPedido } = await supabase.from("wholesale_orders").insert({
        proveedor: form.proveedor,
        fecha: form.fecha ? new Date(form.fecha) : new Date(),
        total: form.total || null,
        estado: form.estado,
        notas: form.notas
      }).select().single();
      if (errorPedido) throw errorPedido;
      // Insertar ítems
      for (const item of items) {
        if (!item.producto) continue;
        await supabase.from("wholesale_order_items").insert({
          wholesale_order_id: data.id,
          producto: item.producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario || null
        });
      }
      router.push("/admin/mayoristas");
    } catch (err: any) {
      setError("Error al guardar pedido mayorista");
    }
    setGuardando(false);
  };

  return (
    <section style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 32px 0 rgba(0,0,0,0.12)' }}>
      <h1 style={{ color: '#a084e8', fontSize: '1.7rem', marginBottom: 18 }}>Nuevo pedido mayorista</h1>
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
    </section>
  );
} 