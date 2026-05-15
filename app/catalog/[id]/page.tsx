'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, MapPin, Phone, Mail, ShieldCheck, Settings, ArrowRight, Share2 } from 'lucide-react';
import { getProductById } from '@/lib/firestore';

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number | string;
  imagen: string;
  tag: string | null;
  status: string;
  disponibilidad?: string;
  descripcion?: string;
  especificacion?: string;
  marca?: string;
  modelo?: string;
  ubicaciones?: string[];
  tipoNegocio?: 'renta' | 'venta' | 'ambos';
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProducto = async () => {
      if (params.id) {
        const data = await getProductById(params.id as string);
        setProducto(data as Producto);
      }
      setLoading(false);
    };
    cargarProducto();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-dark-900 rounded-full flex items-center justify-center mb-6">
          <Settings className="w-10 h-10 text-gray-600 animate-spin-slow" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">Equipo no encontrado</h1>
        <p className="text-gray-400 mb-8 max-w-md text-center">La maquinaria que buscas no está disponible o el enlace es incorrecto.</p>
        <Link href="/catalog" className="bg-primary text-dark-950 font-bold px-8 py-3 rounded-lg hover:bg-primary-hover transition-colors">
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  const isAvailable = producto.status === 'Disponible' || producto.disponibilidad === 'disponible';
  const precioNumerico = typeof producto.precio === 'string' ? parseFloat(producto.precio.replace(/[^0-9.-]+/g,"")) : producto.precio;

  return (
    <div className="min-h-screen bg-dark-950 bg-grid-pattern relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-dark-950/50 to-transparent pointer-events-none"></div>
      
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link 
          href="/catalog" 
          className="inline-flex items-center gap-3 text-gray-400 hover:text-primary transition-colors mb-8 group"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-bold tracking-wide uppercase text-sm">Volver al catálogo</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Columna Izquierda: Imagen (Sticky) */}
          <div className="lg:col-span-7 sticky top-24">
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-dark-900 border border-white/10 group shadow-2xl">
              <img 
                src={producto.imagen} 
                alt={producto.nombre} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-90"></div>
              
              <div className="absolute top-6 left-6 flex flex-wrap gap-3">
                {producto.tag && (
                  <span className="bg-primary text-dark-950 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">
                    {producto.tag}
                  </span>
                )}
                {producto.marca && (
                  <span className="bg-dark-900/80 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">
                    {producto.marca}
                  </span>
                )}
              </div>
              
              <div className="absolute top-6 right-6">
                <button 
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="w-12 h-12 rounded-full bg-dark-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-dark-950 hover:border-primary transition-all shadow-xl"
                  title="Compartir Equipo"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-2">Estado del equipo</p>
                  <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold uppercase backdrop-blur-md border shadow-lg ${
                    isAvailable 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                    {isAvailable 
                      ? (producto.tipoNegocio === 'renta' ? 'Disponible para Renta' : 
                         producto.tipoNegocio === 'venta' ? 'Disponible para Venta' : 
                         'Disponible para Renta y Venta')
                      : 'No Disponible'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Detalles */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-primary font-mono text-xs font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
                  {producto.categoria}
                </span>
                {producto.modelo && (
                  <span className="text-gray-400 font-mono text-xs uppercase tracking-widest border border-white/10 bg-dark-900 px-3 py-1.5 rounded-lg">
                    Mod: {producto.modelo}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                {producto.nombre}
              </h1>
              
              {/* Bloque de Precio */}
              <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors duration-700"></div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Tarifa Diaria Estimada</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl text-primary font-bold">$</span>
                  <span className="text-5xl font-black text-white">{precioNumerico?.toLocaleString('es-MX') || "0"}</span>
                  <span className="text-gray-500 font-medium ml-2">MXN / día</span>
                </div>
                <p className="text-xs text-gray-500 mt-4 border-t border-white/5 pt-4">
                  * Precios sujetos a cambios. No incluye costos de traslado ni operador extra.
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-4">
              <Link 
                href={`/contact?cotizacion=${producto.id}`} 
                className="w-full bg-primary text-dark-950 px-8 py-5 rounded-xl font-black text-lg text-center hover:bg-primary-hover hover:scale-[1.02] transition-all shadow-[0_0_25px_rgba(255,193,7,0.25)] flex items-center justify-center gap-3"
              >
                Solicitar Presupuesto <ArrowRight className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => window.location.href = 'tel:+525588994455'}
                className="w-full bg-dark-900 border border-white/10 text-white px-8 py-5 rounded-xl font-bold text-center hover:bg-white/5 transition-all flex items-center justify-center gap-3 group"
              >
                <Phone className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" /> Hablar con un Asesor
              </button>
            </div>

            {/* Beneficios Grid */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/10">
              {[
                { label: 'Operador Certificado', icon: Check },
                { label: 'Mantenimiento al Día', icon: Check },
                { label: 'Seguro Cobertura Amplia', icon: Check },
                { label: 'Soporte Técnico 24/7', icon: Check }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-dark-900/50 p-3 rounded-xl border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-gray-300 text-xs font-bold uppercase tracking-wide">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Secciones de Info */}
            <div className="space-y-8 pt-6 border-t border-white/10">
              {producto.descripcion && (
                <div>
                  <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3 uppercase tracking-tight">
                    <ShieldCheck className="w-6 h-6 text-primary" /> Detalles del Equipo
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-lg bg-dark-900/30 p-6 rounded-2xl border border-white/5">
                    {producto.descripcion}
                  </p>
                </div>
              )}

              {producto.especificacion && (
                <div>
                  <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3 uppercase tracking-tight">
                    <Settings className="w-6 h-6 text-primary" /> Especificaciones Técnicas
                  </h3>
                  <div className="bg-dark-950 p-6 rounded-2xl border border-white/10 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <p className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {producto.especificacion}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}