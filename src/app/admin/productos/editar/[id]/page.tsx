'use client';

import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EditarProducto() {
  const router = useRouter();
  const { id } = useParams();
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
      // Traer categorías y subcategorías
      const { data: cats } = await supabase.from('categories').select('*');
      setCategorias(cats || []);
      const { data: subcats } = await supabase.from('subcategories').select('*');
      setSubcategorias(subcats || []);
      // Traer datos del producto
      const { data: prod, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (prod) {
        setForm({
          nombre: prod.nombre || '',
          descripcion: prod.descripcion || '',
          precio: prod.precio || '',
          stock: prod.stock || '',
          category_id: prod.category_id || '',
          subcategory_id: prod.subcategory_id || '',
        });
      }
      setCargando(false);
    })();
  }, [id]);

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
      .update({
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        stock: Number(form.stock),
        category_id: form.category_id ? Number(form.category_id) : null,
        subcategory_id: form.subcategory_id ? Number(form.subcategory_id) : null,
      })
      .eq('id', id);
    if (error) {
      setError('No se pudo guardar el producto. Intenta de nuevo.');
    } else {
      setExito(true);
    }
    setGuardando(false);
  };

  // --- Gestión de imágenes ---
  const [imagenes, setImagenes] = useState<any[]>([]);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    (async () => {
      setCargando(true);
      const { data } = await supabase.from('product_images').select('*').eq('product_id', id).order('orden', { ascending: true });
      setImagenes(data || []);
      setCargando(false);
    })();
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError(null);
    const ext = file.name.split('.').pop();
    const fileName = `${id}_${uuidv4()}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file, { upsert: true });
    if (uploadError) {
      setError('Error al subir la imagen.');
      setSubiendo(false);
      return;
    }
    const url = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
    // Guardar en la tabla
    await supabase.from('product_images').insert({ product_id: id, url, es_principal: false });
    // Refrescar lista
    const { data } = await supabase.from('product_images').select('*').eq('product_id', id).order('orden', { ascending: true });
    setImagenes(data || []);
    setSubiendo(false);
  };

  const handleDelete = async (img: any) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return;
    // Borrar de storage
    const path = img.url.split('/product-images/')[1];
    await supabase.storage.from('product-images').remove([path]);
    // Borrar de tabla
    await supabase.from('product_images').delete().eq('id', img.id);
    // Refrescar lista
    const { data } = await supabase.from('product_images').select('*').eq('product_id', id).order('orden', { ascending: true });
    setImagenes(data || []);
  };

  const handlePrincipal = async (img: any) => {
    await supabase.from('product_images').update({ es_principal: false }).eq('product_id', id);
    await supabase.from('product_images').update({ es_principal: true }).eq('id', img.id);
    const { data } = await supabase.from('product_images').select('*').eq('product_id', id).order('orden', { ascending: true });
    setImagenes(data || []);
  };

  if (cargando) return <p style={{ color: 'var(--color-orange)', textAlign: 'center', marginTop: '3rem' }}>Cargando producto...</p>;

  return (
    <AdminGuard>
      <section style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: 'var(--color-gray)', borderRadius: '1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.2)' }}>
        <h1 style={{ color: 'var(--color-orange)', fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Editar producto</h1>
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
          {exito && <span style={{ color: 'var(--color-orange)', fontWeight: 600 }}>¡Producto actualizado!</span>}
          <button type="submit" disabled={guardando} style={{ marginTop: 8 }}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
        <button onClick={() => router.push('/admin/productos')} style={{ marginTop: 24, background: 'var(--color-black)', color: 'var(--color-white)', border: '1px solid var(--color-violet)', borderRadius: 12, padding: '0.7rem 2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          Volver al listado
        </button>
        {typeof id === 'string' && <ImagenesProducto productId={parseInt(id)} />}
        {typeof id === 'string' && <VariantesProducto productId={parseInt(id)} />}
      </section>
    </AdminGuard>
  );
}

function ImagenesProducto({ productId }: { productId: number }) {
  const [imagenes, setImagenes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setCargando(true);
      const { data } = await supabase.from('product_images').select('*').eq('product_id', productId).order('orden', { ascending: true });
      setImagenes(data || []);
      setCargando(false);
    })();
  }, [productId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError(null);
    const ext = file.name.split('.').pop();
    const fileName = `${productId}_${uuidv4()}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file, { upsert: true });
    if (uploadError) {
      setError('Error al subir la imagen.');
      setSubiendo(false);
      return;
    }
    const url = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
    // Guardar en la tabla
    await supabase.from('product_images').insert({ product_id: productId, url, es_principal: false });
    // Refrescar lista
    const { data } = await supabase.from('product_images').select('*').eq('product_id', productId).order('orden', { ascending: true });
    setImagenes(data || []);
    setSubiendo(false);
  };

  const handleDelete = async (img: any) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return;
    // Borrar de storage
    const path = img.url.split('/product-images/')[1];
    await supabase.storage.from('product-images').remove([path]);
    // Borrar de tabla
    await supabase.from('product_images').delete().eq('id', img.id);
    // Refrescar lista
    const { data } = await supabase.from('product_images').select('*').eq('product_id', productId).order('orden', { ascending: true });
    setImagenes(data || []);
  };

  const handlePrincipal = async (img: any) => {
    await supabase.from('product_images').update({ es_principal: false }).eq('product_id', productId);
    await supabase.from('product_images').update({ es_principal: true }).eq('id', img.id);
    const { data } = await supabase.from('product_images').select('*').eq('product_id', productId).order('orden', { ascending: true });
    setImagenes(data || []);
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ color: 'var(--color-orange)', fontSize: 20, marginBottom: 12 }}>Imágenes del producto</h2>
      {cargando ? <p style={{ color: 'var(--color-orange)' }}>Cargando imágenes...</p> : null}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
        {imagenes.map(img => (
          <div key={img.id} style={{ position: 'relative', border: img.es_principal ? '3px solid var(--color-orange)' : '2px solid var(--color-gray)', borderRadius: 12, overflow: 'hidden', width: 120, height: 120, background: '#222' }}>
            <img src={img.url} alt="Imagen producto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => handleDelete(img)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: 'red', border: 'none', borderRadius: 8, padding: 4, cursor: 'pointer' }}>Eliminar</button>
            {!img.es_principal && <button onClick={() => handlePrincipal(img)} style={{ position: 'absolute', bottom: 4, left: 4, background: 'var(--color-orange)', color: 'var(--color-black)', border: 'none', borderRadius: 8, padding: 4, cursor: 'pointer', fontWeight: 700 }}>Principal</button>}
            {img.es_principal && <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'var(--color-orange)', color: 'var(--color-black)', borderRadius: 8, padding: '2px 8px', fontWeight: 700, fontSize: 13 }}>Principal</span>}
          </div>
        ))}
      </div>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={subiendo} style={{ marginBottom: 8 }} />
      {subiendo && <span style={{ color: 'var(--color-orange)', fontWeight: 600 }}>Subiendo imagen...</span>}
      {error && <span style={{ color: 'red', fontWeight: 600 }}>{error}</span>}
    </div>
  );
}

function VariantesProducto({ productId }: { productId: number }) {
  const [variantes, setVariantes] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [form, setForm] = useState({ size_id: '', color_id: '', stock: '' });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setCargando(true);
      const { data: vars } = await supabase.from('product_variants').select('*').eq('product_id', productId);
      setVariantes(vars || []);
      const { data: szs } = await supabase.from('sizes').select('*');
      setSizes(szs || []);
      const { data: cols } = await supabase.from('colors').select('*');
      setColors(cols || []);
      setCargando(false);
    })();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    if (!form.size_id || !form.color_id || !form.stock) {
      setError('Completa todos los campos.');
      setGuardando(false);
      return;
    }
    // Verificar si ya existe esa combinación
    const { data: existe } = await supabase.from('product_variants').select('*').eq('product_id', productId).eq('size_id', form.size_id).eq('color_id', form.color_id);
    if (existe && existe.length > 0) {
      setError('Ya existe una variante con ese talle y color.');
      setGuardando(false);
      return;
    }
    await supabase.from('product_variants').insert({
      product_id: productId,
      size_id: Number(form.size_id),
      color_id: Number(form.color_id),
      stock: Number(form.stock),
    });
    setForm({ size_id: '', color_id: '', stock: '' });
    // Refrescar lista
    const { data: vars } = await supabase.from('product_variants').select('*').eq('product_id', productId);
    setVariantes(vars || []);
    setGuardando(false);
  };

  const handleDelete = async (variantId: number) => {
    if (!window.confirm('¿Eliminar esta variante?')) return;
    await supabase.from('product_variants').delete().eq('id', variantId);
    const { data: vars } = await supabase.from('product_variants').select('*').eq('product_id', productId);
    setVariantes(vars || []);
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ color: 'var(--color-orange)', fontSize: 20, marginBottom: 12 }}>Variantes (Talle, Color, Stock)</h2>
      {cargando ? <p style={{ color: 'var(--color-orange)' }}>Cargando variantes...</p> : null}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-black)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: 'var(--color-violet)' }}>
            <th style={{ color: 'var(--color-white)', padding: 8 }}>Talle</th>
            <th style={{ color: 'var(--color-white)', padding: 8 }}>Color</th>
            <th style={{ color: 'var(--color-white)', padding: 8 }}>Stock</th>
            <th style={{ color: 'var(--color-white)', padding: 8 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {variantes.map(variant => (
            <tr key={variant.id} style={{ borderBottom: '1px solid var(--color-gray)' }}>
              <td style={{ color: 'var(--color-white)', padding: 8 }}>{sizes.find(s => s.id === variant.size_id)?.nombre || variant.size_id}</td>
              <td style={{ color: 'var(--color-white)', padding: 8 }}>{colors.find(c => c.id === variant.color_id)?.nombre || variant.color_id}</td>
              <td style={{ color: 'var(--color-white)', padding: 8 }}>{variant.stock}</td>
              <td style={{ padding: 8 }}>
                <button style={{ color: 'red', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleDelete(variant.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select name="size_id" value={form.size_id} onChange={handleChange} required style={{ padding: '0.7rem', borderRadius: 8, border: 'none', fontSize: 15 }}>
          <option value="">Talle</option>
          {sizes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <select name="color_id" value={form.color_id} onChange={handleChange} required style={{ padding: '0.7rem', borderRadius: 8, border: 'none', fontSize: 15 }}>
          <option value="">Color</option>
          {colors.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <input name="stock" type="number" min="0" required placeholder="Stock" value={form.stock} onChange={handleChange} style={{ padding: '0.7rem', borderRadius: 8, border: 'none', fontSize: 15, width: 90 }} />
        <button type="submit" disabled={guardando} style={{ background: 'var(--color-orange)', color: 'var(--color-black)', borderRadius: 8, fontWeight: 700, padding: '0.7rem 1.5rem', border: 'none', fontSize: 15 }}>
          {guardando ? 'Agregando...' : 'Agregar variante'}
        </button>
        {error && <span style={{ color: 'red', fontWeight: 600 }}>{error}</span>}
      </form>
    </div>
  );
} 