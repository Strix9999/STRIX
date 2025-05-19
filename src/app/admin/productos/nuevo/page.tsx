'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function NuevoProducto() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    category_id: '',
    subcategory_id: '',
  });
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    (async () => {
      setCargando(true);
      const { data: cats } = await supabase.from('categories').select('*');
      setCategorias(cats || []);
      const { data: subcats } = await supabase.from('subcategories').select('*');
      setSubcategorias(subcats || []);
      setCargando(false);
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(false);
    const { error } = await supabase
      .from('products')
      .insert({
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        stock: Number(form.stock),
        category_id: form.category_id ? Number(form.category_id) : null,
        subcategory_id: form.subcategory_id ? Number(form.subcategory_id) : null,
      });
    if (error) {
      setError('No se pudo crear el producto. Intenta de nuevo.');
    } else {
      setExito(true);
      setForm({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        category_id: '',
        subcategory_id: '',
      });
    }
    setGuardando(false);
  };

  if (cargando) return <p style={{ color: 'var(--color-orange)', textAlign: 'center', marginTop: '3rem' }}>Cargando formulario...</p>;

  return (
    <AdminGuard>
      <section style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: 'var(--color-gray)', borderRadius: '1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.2)' }}>
        <h1 style={{ color: 'var(--color-orange)', fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Nuevo producto</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <input name="nombre" required placeholder="Nombre" value={form.nombre} onChange={handleChange} style={{ padding: '1rem', borderRadius: 8, border: 'none', fontSize: 16 }} />
          <textarea name="descripcion" required placeholder="Descripción" value={form.descripcion} onChange={handleChange} style={{ padding: '1rem', borderRadius: 8, border: 'none', fontSize: 16, minHeight: 80 }} />
          <input name="precio" required type="number" min="0" step="0.01" placeholder="Precio" value={form.precio} onChange={handleChange} style={{ padding: '1rem', borderRadius: 8, border: 'none', fontSize: 16 }} />
          <input name="stock" required type="number" min="0" step="1" placeholder="Stock" value={form.stock} onChange={handleChange} style={{ padding: '1rem', borderRadius: 8, border: 'none', fontSize: 16 }} />
          <select name="category_id" value={form.category_id} onChange={handleChange} required style={{ padding: '1rem', borderRadius: 8, border: 'none', fontSize: 16 }}>
            <option value="">Seleccionar categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
          <select name="subcategory_id" value={form.subcategory_id} onChange={handleChange} style={{ padding: '1rem', borderRadius: 8, border: 'none', fontSize: 16 }}>
            <option value="">Seleccionar subcategoría</option>
            {subcategorias
              .filter(sub => String(sub.category_id) === String(form.category_id))
              .map(sub => (
                <option key={sub.id} value={sub.id}>{sub.nombre}</option>
              ))}
          </select>
          {error && <span style={{ color: 'red', fontWeight: 600 }}>{error}</span>}
          {exito && <span style={{ color: 'var(--color-orange)', fontWeight: 600 }}>¡Producto creado!</span>}
          <button type="submit" disabled={guardando} style={{ marginTop: 8 }}>
            {guardando ? 'Guardando...' : 'Crear producto'}
          </button>
        </form>
        <button onClick={() => router.push('/admin/productos')} style={{ marginTop: 24, background: 'var(--color-black)', color: 'var(--color-white)', border: '1px solid var(--color-violet)', borderRadius: 12, padding: '0.7rem 2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          Volver al listado
        </button>
      </section>
    </AdminGuard>
  );
} 