"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import React from "react";

function EditarUsuarioModal({ usuario, onClose, onSave }: { usuario: any, onClose: () => void, onSave: (data: any) => void }) {
  const [form, setForm] = useState({ ...usuario });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError("Error al guardar cambios");
    }
    setGuardando(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,20,40,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 340, boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ color: '#a084e8', marginBottom: 8 }}>Editar usuario</h2>
        <input name="nombre" value={form.nombre || ''} onChange={handleChange} placeholder="Nombre" style={{ padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
        <input name="email" value={form.email || ''} onChange={handleChange} placeholder="Email" style={{ padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
        <select name="rol" value={form.rol || ''} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: '1px solid #eee' }}>
          <option value="">Seleccionar rol</option>
          <option value="admin">Admin</option>
          <option value="cliente">Cliente</option>
        </select>
        <select name="activo" value={form.activo ? 'true' : 'false'} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: '1px solid #eee' }}>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
        {error && <span style={{ color: 'red' }}>{error}</span>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onClose} style={{ background: '#eee', color: '#23232b', border: 'none', borderRadius: 6, padding: '7px 18px', cursor: 'pointer' }}>Cancelar</button>
          <button type="submit" disabled={guardando} style={{ background: '#a084e8', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', cursor: 'pointer' }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}

function ConfirmarEliminacionModal({ usuario, onClose, onDelete, eliminando }: { usuario: any, onClose: () => void, onDelete: () => void, eliminando: boolean }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,20,40,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 340, boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ color: '#e85a84', marginBottom: 8 }}>¿Eliminar usuario?</h2>
        <p>¿Estás seguro de que deseas eliminar al usuario <b>{usuario.email}</b>? Esta acción no se puede deshacer.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onClose} style={{ background: '#eee', color: '#23232b', border: 'none', borderRadius: 6, padding: '7px 18px', cursor: 'pointer' }}>Cancelar</button>
          <button type="button" onClick={onDelete} disabled={eliminando} style={{ background: '#e85a84', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', cursor: 'pointer' }}>{eliminando ? 'Eliminando...' : 'Eliminar'}</button>
        </div>
      </div>
    </div>
  );
}

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioEditar, setUsuarioEditar] = useState<any | null>(null);
  const [usuarioEliminar, setUsuarioEliminar] = useState<any | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setCargando(true);
      setError(null);
      const { data, error } = await supabase.from("vw_usuarios_completos").select("*");
      if (error) setError("Error al cargar usuarios");
      setUsuarios(data || []);
      setCargando(false);
    };
    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter(u =>
    (u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
     u.nombre?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleSave = async (form: any) => {
    const { id, ...rest } = form;
    const { error } = await supabase.from("user_profiles").update({
      nombre: rest.nombre,
      apellido: rest.apellido,
      telefono: rest.telefono,
      codigo_postal: rest.codigo_postal,
      provincia: rest.provincia,
      localidad: rest.localidad,
      direccion: rest.direccion,
      numeracion: rest.numeracion,
    }).eq("id", id);
    if (error) throw error;
    // Refrescar usuarios
    const { data } = await supabase.from("vw_usuarios_completos").select("*");
    setUsuarios(data || []);
  };

  const handleDelete = async () => {
    if (!usuarioEliminar) return;
    setEliminando(true);
    await supabase.from("user_profiles").delete().eq("id", usuarioEliminar.id);
    // Refrescar usuarios
    const { data } = await supabase.from("vw_usuarios_completos").select("*");
    setUsuarios(data || []);
    setEliminando(false);
    setUsuarioEliminar(null);
  };

  return (
    <section className="admin-glass">
      <h1 style={{ fontSize: "2rem", color: "#a084e8", marginBottom: 24, textShadow: '0 2px 12px #0008' }}>Gestión de usuarios</h1>
      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{ padding: 12, borderRadius: 10, border: "none", marginBottom: 24, width: 340, background: 'linear-gradient(90deg, #2d2d3a 60%, #a084e8 100%)', color: '#fff', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 12px 0 #a084e833', outline: 'none', transition: 'box-shadow 0.2s' }}
      />
      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#23232b", borderRadius: 18, boxShadow: "0 2px 16px 0 #a084e8aa", minWidth: 900, color: '#fff', fontWeight: 500 }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #a084e8 60%, #23232b 100%)", color: "#fff" }}>
                {usuarios[0] && Object.keys(usuarios[0]).map(key => (
                  <th key={key} style={{ padding: 12, textAlign: "left", fontWeight: 700 }}>{key}</th>
                ))}
                <th style={{ padding: 12 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid #a084e8" }}>
                  {Object.values(u).map((val, i) => (
                    <td key={i} style={{ padding: 12 }}>{String(val)}</td>
                  ))}
                  <td style={{ padding: 12 }}>
                    <button onClick={() => setUsuarioEditar(u)} className="admin-btn" style={{ marginRight: 8, padding: '6px 18px', fontSize: 15, borderRadius: 8, background: 'linear-gradient(90deg, #a084e8 60%, #ff6a00 100%)' }}>Editar</button>
                    <button onClick={() => setUsuarioEliminar(u)} className="admin-btn" style={{ padding: '6px 18px', fontSize: 15, borderRadius: 8, background: 'linear-gradient(90deg, #e85a84 60%, #a084e8 100%)' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {usuarioEditar && (
        <EditarUsuarioModal
          usuario={usuarioEditar}
          onClose={() => setUsuarioEditar(null)}
          onSave={handleSave}
        />
      )}
      {usuarioEliminar && (
        <ConfirmarEliminacionModal
          usuario={usuarioEliminar}
          onClose={() => setUsuarioEliminar(null)}
          onDelete={handleDelete}
          eliminando={eliminando}
        />
      )}
    </section>
  );
} 