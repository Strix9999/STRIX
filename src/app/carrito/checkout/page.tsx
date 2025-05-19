'use client';
import { useCart, CartItem } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight, FaTruck, FaCreditCard, FaCheck, FaShoppingBag, FaLock } from 'react-icons/fa';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function Checkout() {
  const router = useRouter();
  const { cart, coupon, clearCart } = useCart();
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidoCompletado, setPedidoCompletado] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const supabase = getSupabaseClient();
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si estamos en móvil para el responsive
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Comprobar inicialmente
    checkMobile();
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkMobile);
    
    // Limpiar evento al desmontar
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Formulario de envío (paso 1)
  const [formEnvio, setFormEnvio] = useState({
    nombre: '',
    apellido: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    provincia: '',
    telefono: '',
    email: ''
  });

  // Formulario de pago (paso 2)
  const [formPago, setFormPago] = useState({
    titular: '',
    numeroTarjeta: '',
    vencimiento: '',
    cvv: ''
  });

  // Cálculos de precio
  const subtotal = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const descuento = coupon
    ? coupon.tipo === 'porcentaje'
      ? subtotal * (coupon.descuento / 100)
      : coupon.descuento
    : 0;
  const envio = 500; // Costo fijo de envío
  const total = subtotal - descuento + envio;

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (cart.length === 0 && !pedidoCompletado) {
      router.push('/carrito');
    }
  }, [cart, pedidoCompletado, router]);

  // Manejar cambios en los formularios
  const handleChangeEnvio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormEnvio({ ...formEnvio, [e.target.name]: e.target.value });
  };

  const handleChangePago = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormPago({ ...formPago, [e.target.name]: e.target.value });
  };

  // Validación de formularios
  const validarFormularioEnvio = () => {
    const { nombre, apellido, direccion, ciudad, codigoPostal, provincia, telefono, email } = formEnvio;
    return (
      nombre.trim() !== '' &&
      apellido.trim() !== '' &&
      direccion.trim() !== '' &&
      ciudad.trim() !== '' &&
      codigoPostal.trim() !== '' &&
      provincia.trim() !== '' &&
      telefono.trim() !== '' &&
      email.trim() !== '' &&
      email.includes('@')
    );
  };

  const validarFormularioPago = () => {
    const { titular, numeroTarjeta, vencimiento, cvv } = formPago;
    return (
      titular.trim() !== '' &&
      numeroTarjeta.replace(/\s/g, '').length === 16 &&
      vencimiento.match(/^\d{2}\/\d{2}$/) &&
      cvv.length >= 3
    );
  };

  // Navegar entre pasos
  const avanzarPaso = () => {
    if (paso === 1 && validarFormularioEnvio()) {
      setPaso(2);
      window.scrollTo(0, 0);
    } else if (paso === 2 && validarFormularioPago()) {
      setPaso(3);
      window.scrollTo(0, 0);
    }
  };

  const retrocederPaso = () => {
    if (paso > 1) {
      setPaso(paso === 3 ? 2 : 1);
      window.scrollTo(0, 0);
    }
  };

  const finalizarCompra = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Crear el pedido en 'orders'
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: null, // Si tienes auth, puedes poner el id del usuario
          estado: 'pendiente',
          total,
          tipo: 'minorista',
          created_at: new Date().toISOString(),
          nombre_cliente: `${formEnvio.nombre} ${formEnvio.apellido}`,
          email_cliente: formEnvio.email,
          telefono_cliente: formEnvio.telefono,
          direccion_envio: `${formEnvio.direccion}, ${formEnvio.ciudad}, ${formEnvio.provincia} (${formEnvio.codigoPostal})`,
          cupon_aplicado: coupon ? coupon.codigo : null,
          descuento_aplicado: descuento > 0 ? descuento : null,
        })
        .select()
        .single();

      if (orderError || !order) {
        setError('No se pudo registrar el pedido. Intenta de nuevo.');
        setLoading(false);
        return;
      }

      // Asegurarse de que id es un string antes de asignarlo
      const orderId = typeof order.id === 'string' ? order.id : 
                     order.id ? String(order.id) : null;
      setPedidoId(orderId);

      // 2. Crear los items en 'order_items'
      const items = cart.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        color: item.color,
        talla: item.talla
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(items);
      
      if (itemsError) {
        setError('No se pudieron registrar los productos del pedido. Intenta de nuevo.');
        setLoading(false);
        return;
      }

      // Exito: limpiar carrito y mostrar confirmación
      clearCart();
      setPedidoCompletado(true);
      
    } catch (error) {
      setError('Ocurrió un error al procesar la compra. Intenta nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Si la orden se completó, mostrar pantalla de confirmación
  if (pedidoCompletado) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          maxWidth: 800,
          margin: '2rem auto',
          padding: '3rem 2rem',
          background: 'linear-gradient(145deg, rgba(30,30,30,0.6), rgba(20,20,20,0.8))',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.2)',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'var(--color-orange)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem auto',
            boxShadow: '0 8px 32px rgba(255, 130, 50, 0.4)'
          }}
        >
          <FaCheck size={50} color="#fff" />
        </motion.div>
        
        <h1 style={{ color: 'var(--color-orange)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>
          ¡Gracias por tu compra!
        </h1>
        
        <p style={{ color: 'var(--color-white)', fontSize: '1.2rem', marginBottom: '1rem' }}>
          Tu pedido se ha realizado con éxito.
        </p>
        
        {pedidoId && (
          <p style={{ color: 'var(--color-purple)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Número de pedido: <strong>{pedidoId}</strong>
          </p>
        )}
        
        <p style={{ color: 'var(--color-white)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
          Pronto recibirás un correo con la confirmación y detalles del envío.
        </p>
        
        <Link href="/catalogo">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'var(--color-orange)', color: 'var(--color-black)' }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
              background: 'var(--color-purple)',
              color: 'var(--color-white)',
              border: 'none',
              borderRadius: '2rem',
              padding: '1rem 2.5rem',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 12px 0 rgba(162,89,255,0.15)',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaShoppingBag />
            Volver al catálogo
          </motion.button>
        </Link>
      </motion.div>
    );
  }

  // Renderizar los pasos
  return (
    <section style={{ maxWidth: 1100, margin: '2rem auto', padding: '2rem' }}>
      {/* Título */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ 
          color: 'var(--color-orange)', 
          fontSize: '2rem', 
          marginBottom: '1rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--color-orange), var(--color-purple))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}>
          Finalizar compra
        </h1>
        
        {/* Indicador de pasos */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          {[1, 2, 3].map((step) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: 30, 
                height: 30, 
                borderRadius: '50%', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: paso >= step ? 'var(--color-orange)' : 'rgba(255,255,255,0.1)',
                color: paso >= step ? 'var(--color-black)' : 'var(--color-white)',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}>
                {step}
              </div>
              {step < 3 && (
                <div style={{ 
                  height: 2, 
                  width: 50, 
                  background: paso > step ? 'var(--color-orange)' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease'
                }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '8px',
          color: 'var(--color-white)',
          fontSize: '0.9rem'
        }}>
          <span style={{ 
            width: 130, 
            textAlign: 'center',
            fontWeight: paso === 1 ? 'bold' : 'normal', 
            color: paso === 1 ? 'var(--color-orange)' : 'inherit' 
          }}>
            Datos de envío
          </span>
          <span style={{ 
            width: 130, 
            textAlign: 'center',
            fontWeight: paso === 2 ? 'bold' : 'normal', 
            color: paso === 2 ? 'var(--color-orange)' : 'inherit' 
          }}>
            Método de pago
          </span>
          <span style={{ 
            width: 130, 
            textAlign: 'center',
            fontWeight: paso === 3 ? 'bold' : 'normal', 
            color: paso === 3 ? 'var(--color-orange)' : 'inherit' 
          }}>
            Confirmación
          </span>
        </div>
      </div>

      {/* Contenido del checkout */}
      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Formularios según el paso actual */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`paso-${paso}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ 
              flex: '1 1 65%',
              background: 'linear-gradient(145deg, rgba(30,30,30,0.6), rgba(20,20,20,0.8))',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              padding: '1.5rem',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {/* Paso 1: Formulario de envío */}
            {paso === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ 
                    background: 'var(--color-orange)',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem'
                  }}>
                    <FaTruck color="#000" size={18} />
                  </div>
                  <h2 style={{ color: 'var(--color-white)', fontWeight: 700, fontSize: '1.3rem' }}>
                    Información de envío
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: 150 }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                      Nombre
                    </label>
                    <input 
                      type="text"
                      name="nombre"
                      value={formEnvio.nombre}
                      onChange={handleChangeEnvio}
                      placeholder="Tu nombre"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: 'var(--color-white)',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>
                  <div style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: 150 }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                      Apellido
                    </label>
                    <input 
                      type="text"
                      name="apellido"
                      value={formEnvio.apellido}
                      onChange={handleChangeEnvio}
                      placeholder="Tu apellido"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: 'var(--color-white)',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                    Dirección
                  </label>
                  <input 
                    type="text"
                    name="direccion"
                    value={formEnvio.direccion}
                    onChange={handleChangeEnvio}
                    placeholder="Calle y número"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: 'var(--color-white)',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: 150 }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                      Ciudad
                    </label>
                    <input 
                      type="text"
                      name="ciudad"
                      value={formEnvio.ciudad}
                      onChange={handleChangeEnvio}
                      placeholder="Ciudad"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: 'var(--color-white)',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>
                  <div style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: 150 }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                      Código Postal
                    </label>
                    <input 
                      type="text"
                      name="codigoPostal"
                      value={formEnvio.codigoPostal}
                      onChange={handleChangeEnvio}
                      placeholder="Código Postal"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: 'var(--color-white)',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                    Provincia
                  </label>
                  <input 
                    type="text"
                    name="provincia"
                    value={formEnvio.provincia}
                    onChange={handleChangeEnvio}
                    placeholder="Provincia"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: 'var(--color-white)',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: 150 }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                      Teléfono
                    </label>
                    <input 
                      type="tel"
                      name="telefono"
                      value={formEnvio.telefono}
                      onChange={handleChangeEnvio}
                      placeholder="Teléfono de contacto"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: 'var(--color-white)',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>
                  <div style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: 150 }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                      Email
                    </label>
                    <input 
                      type="email"
                      name="email"
                      value={formEnvio.email}
                      onChange={handleChangeEnvio}
                      placeholder="Email para recibir actualizaciones"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: 'var(--color-white)',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <Link href="/carrito">
                    <motion.button
                      whileHover={{ x: -3 }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ccc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        padding: '0.5rem 0'
                      }}
                    >
                      <FaArrowLeft size={14} />
                      Volver al carrito
                    </motion.button>
                  </Link>
                  
                  <motion.button
                    whileHover={{ scale: 1.03, backgroundColor: 'var(--color-orange)', color: 'var(--color-black)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={avanzarPaso}
                    disabled={!validarFormularioEnvio()}
                    style={{
                      background: validarFormularioEnvio() ? 'var(--color-purple)' : 'rgba(162,89,255,0.3)',
                      color: 'var(--color-white)',
                      border: 'none',
                      borderRadius: 12,
                      padding: '0.8rem 2rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: validarFormularioEnvio() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    Continuar a pago
                    <FaArrowRight size={14} />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Paso 2: Formulario de pago */}
            {paso === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ 
                    background: 'var(--color-orange)',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem'
                  }}>
                    <FaCreditCard color="#000" size={18} />
                  </div>
                  <h2 style={{ color: 'var(--color-white)', fontWeight: 700, fontSize: '1.3rem' }}>
                    Información de pago
                  </h2>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                    Titular de la tarjeta
                  </label>
                  <input 
                    type="text"
                    name="titular"
                    value={formPago.titular}
                    onChange={handleChangePago}
                    placeholder="Nombre como aparece en la tarjeta"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: 'var(--color-white)',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                    Número de tarjeta
                  </label>
                  <input 
                    type="text"
                    name="numeroTarjeta"
                    value={formPago.numeroTarjeta}
                    onChange={handleChangePago}
                    placeholder="1234 5678 9012 3456"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: 'var(--color-white)',
                      fontSize: '1rem'
                    }}
                    maxLength={19}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: '1 1 50%' }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                      Fecha de vencimiento (MM/YY)
                    </label>
                    <input 
                      type="text"
                      name="vencimiento"
                      value={formPago.vencimiento}
                      onChange={handleChangePago}
                      placeholder="MM/YY"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: 'var(--color-white)',
                        fontSize: '1rem'
                      }}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div style={{ flex: '1 1 50%' }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: 8, fontSize: '0.9rem' }}>
                      Código de seguridad (CVV)
                    </label>
                    <input 
                      type="text"
                      name="cvv"
                      value={formPago.cvv}
                      onChange={handleChangePago}
                      placeholder="123"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: 'var(--color-white)',
                        fontSize: '1rem'
                      }}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div style={{ 
                  marginTop: '1rem',
                  padding: '1rem', 
                  background: 'rgba(162,89,255,0.1)', 
                  borderRadius: 12,
                  border: '1px solid rgba(162,89,255,0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <FaLock size={14} color="var(--color-purple)" />
                    <span style={{ color: 'var(--color-white)', fontSize: '0.9rem', fontWeight: 600 }}>
                      Pago seguro
                    </span>
                  </div>
                  <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>
                    Tu información de pago está segura y cifrada. Nunca almacenamos los datos completos de tu tarjeta.
                  </p>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <motion.button
                    whileHover={{ x: -3 }}
                    onClick={retrocederPaso}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ccc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      padding: '0.5rem 0'
                    }}
                  >
                    <FaArrowLeft size={14} />
                    Volver a envío
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.03, backgroundColor: 'var(--color-orange)', color: 'var(--color-black)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={avanzarPaso}
                    disabled={!validarFormularioPago()}
                    style={{
                      background: validarFormularioPago() ? 'var(--color-purple)' : 'rgba(162,89,255,0.3)',
                      color: 'var(--color-white)',
                      border: 'none',
                      borderRadius: 12,
                      padding: '0.8rem 2rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: validarFormularioPago() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    Revisar pedido
                    <FaArrowRight size={14} />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Paso 3: Confirmación */}
            {paso === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ 
                    background: 'var(--color-orange)',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem'
                  }}>
                    <FaCheck color="#000" size={18} />
                  </div>
                  <h2 style={{ color: 'var(--color-white)', fontWeight: 700, fontSize: '1.3rem' }}>
                    Confirmar pedido
                  </h2>
                </div>

                <div style={{ 
                  padding: '1rem', 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: 12,
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{ color: 'var(--color-orange)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Información de envío
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#ddd' }}>
                    <p style={{ margin: 0 }}>
                      <strong>Destinatario:</strong> {formEnvio.nombre} {formEnvio.apellido}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Dirección:</strong> {formEnvio.direccion}, {formEnvio.ciudad}, {formEnvio.provincia}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>CP:</strong> {formEnvio.codigoPostal}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Teléfono:</strong> {formEnvio.telefono}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Email:</strong> {formEnvio.email}
                    </p>
                  </div>
                </div>

                <div style={{ 
                  padding: '1rem', 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: 12,
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{ color: 'var(--color-orange)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Información de pago
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#ddd' }}>
                    <p style={{ margin: 0 }}>
                      <strong>Titular:</strong> {formPago.titular}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Tarjeta:</strong> •••• •••• •••• {formPago.numeroTarjeta.slice(-4)}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Vencimiento:</strong> {formPago.vencimiento}
                    </p>
                  </div>
                </div>

                {error && (
                  <div style={{ 
                    padding: '0.8rem 1rem', 
                    background: 'rgba(255,50,50,0.1)', 
                    borderRadius: 8,
                    border: '1px solid rgba(255,50,50,0.3)',
                    color: '#ff5555'
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <motion.button
                    whileHover={{ x: -3 }}
                    onClick={retrocederPaso}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ccc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      padding: '0.5rem 0'
                    }}
                  >
                    <FaArrowLeft size={14} />
                    Volver a pago
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.03, backgroundColor: '#00c853', color: '#fff' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={finalizarCompra}
                    disabled={loading}
                    style={{
                      background: loading ? 'rgba(0,200,83,0.5)' : 'var(--color-orange)',
                      color: loading ? '#aaa' : '#000',
                      border: 'none',
                      borderRadius: 12,
                      padding: '0.8rem 2.5rem',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      boxShadow: '0 4px 12px rgba(255,106,0,0.2)'
                    }}
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          style={{
                            width: 18,
                            height: 18,
                            border: '2px solid',
                            borderColor: '#aaa transparent #aaa transparent',
                            borderRadius: '50%'
                          }}
                        />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmar compra</span>
                        <FaCheck size={16} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Resumen del pedido (siempre visible) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            flex: '1 1 35%',
            background: 'linear-gradient(145deg, rgba(30,30,30,0.6), rgba(20,20,20,0.8))',
            backdropFilter: 'blur(10px)',
            borderRadius: 20,
            padding: '1.5rem',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.2)',
            height: 'fit-content',
            position: 'sticky',
            top: 20,
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <h2 style={{ color: 'var(--color-orange)', marginBottom: '1rem', fontSize: '1.3rem' }}>
            Resumen del pedido
          </h2>
          
          <div style={{ 
            maxHeight: '300px', 
            overflowY: 'auto', 
            marginBottom: '1rem', 
            paddingRight: '10px',
            /* Estilizar scrollbar */
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--color-purple) rgba(0,0,0,0.2)'
          }}>
            {cart.map((item) => (
              <div key={item.variantId} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    background: item.colorHex,
                    border: '1px solid rgba(255,255,255,0.2)'
                  }} />
                  <div>
                    <div style={{ color: 'var(--color-white)', fontWeight: 600, fontSize: '0.95rem' }}>
                      {item.nombre}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                      {item.talla} | {item.color} x{item.cantidad}
                    </div>
                  </div>
                </div>
                <span style={{ color: 'var(--color-orange)', fontWeight: 600, fontSize: '0.95rem' }}>
                  ${item.precio * item.cantidad}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            marginTop: '0.5rem',
            paddingTop: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--color-white)' }}>Subtotal:</span>
              <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>${subtotal}</span>
            </div>
            
            {coupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--color-orange)' }}>Descuento:</span>
                <span style={{ color: 'var(--color-orange)', fontWeight: 600 }}>-${descuento.toFixed(2)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--color-white)' }}>Envío:</span>
              <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>${envio}</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px dashed rgba(255,255,255,0.1)'
            }}>
              <span style={{ color: 'var(--color-white)', fontSize: 18, fontWeight: 700 }}>Total:</span>
              <span style={{ color: 'var(--color-orange)', fontSize: 22, fontWeight: 900 }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}