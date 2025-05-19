export default function Fallback() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <h1>Ruta dinámica no disponible en versión estática</h1>
      <p>Esta página requiere acceso al servidor, lo cual no está disponible en GitHub Pages.</p>
      <p>Por favor, regresa a la página principal o usa la aplicación con servidor completo.</p>
      <a href="/" style={{ 
        display: 'inline-block', 
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        background: 'var(--color-orange)',
        color: 'var(--color-black)',
        textDecoration: 'none',
        borderRadius: '0.25rem'
      }}>
        Volver a la página principal
      </a>
    </div>
  )
} 