export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <h1>Producto no encontrado</h1>
      <p>Este producto no está disponible en la versión estática del sitio.</p>
      <p>Por favor, regresa al catálogo para ver productos disponibles.</p>
      <a href="/catalogo" style={{ 
        display: 'inline-block', 
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        background: 'var(--color-orange)',
        color: 'var(--color-black)',
        textDecoration: 'none',
        borderRadius: '0.25rem'
      }}>
        Volver al catálogo
      </a>
    </div>
  )
} 