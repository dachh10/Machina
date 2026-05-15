'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Calculator, X, Facebook, MessageCircle, AlertTriangle, Copy, Check } from 'lucide-react';
import { sendContactMessage, getConfig, DEFAULT_SUCURSALES, SucursalData } from '@/lib/firestore';

interface CalculatedItem {
  categoria: string;
  cantidad: number;
  dias: number;
  subtotal: number;
}

interface CotizacionData {
  items: CalculatedItem[];
  total: number;
}

type CityKey = 'cdmx' | 'monterrey' | 'guadalajara' | 'queretaro';
type CityName = string;
type ChannelType = 'whatsapp' | 'email' | 'facebook';

const CIUDAD_KEYS: CityKey[] = ['cdmx', 'monterrey', 'guadalajara', 'queretaro'];

export default function Contact() {
  const searchParams = useSearchParams();
  const [cotizacion, setCotizacion] = useState<CotizacionData | null>(null);
  const [showCotizacion, setShowCotizacion] = useState(true);
  const [locations, setLocations] = useState<Record<string, SucursalData>>(DEFAULT_SUCURSALES);
  const [selectedCity, setSelectedCity] = useState<CityKey>('cdmx');
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('whatsapp');
  const [copied, setCopied] = useState(false);

  // Load locations from Firestore
  useEffect(() => {
    getConfig().then((config: any) => {
      if (config?.sucursales) {
        setLocations({ ...DEFAULT_SUCURSALES, ...config.sucursales });
      }
    }).catch(() => {});
  }, []);


  const clearCotizacion = () => {
    setShowCotizacion(false);
    setCotizacion(null);
    setFormData(prev => ({
      ...prev,
      mensaje: ''
    }));
  };

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipoServicio: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load params from URL (Cotizacion or Servicio)
  useEffect(() => {
    const cotizacionParam = searchParams.get('cotizacion');
    const servicioParam = searchParams.get('servicio');
    const ubicacionParam = searchParams.get('ubicacion');

    if (ubicacionParam) {
      const normalizedCity = ubicacionParam
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Remueve acentos
      
      const cityKey = normalizedCity as CityKey;
      if (CIUDAD_KEYS.includes(cityKey)) {
        setSelectedCity(cityKey);
      }
    }

    if (cotizacionParam) {
      try {
        const data = JSON.parse(decodeURIComponent(cotizacionParam)) as CotizacionData;
        setCotizacion(data);

        setFormData(prev => ({
          ...prev,
          tipoServicio: 'Renta de Maquinaria',
          mensaje: `SOLICITUD DE COTIZACIÓN DESDE CALCULADORA\n\nEquipo(s) requerido(s):\n${data.items.map(item => `- ${item.categoria}: ${item.cantidad} unidad(es) × ${item.dias} días`).join('\n')}\n\nTotal estimado: $${data.total.toLocaleString('es-MX')} MXN\n\n--- \n\nDetalles del proyecto:`
        }));
      } catch (e) {
        console.error('Error parsing cotizacion:', e);
      }
    }

    if (servicioParam) {
      // Map URL param to friendly name
      const mapServicio: Record<string, string> = {
        'renta': 'Renta de Maquinaria',
        'venta': 'Compra de Equipo',
        'mantenimiento': 'Servicio Técnico',
        'refacciones': 'Refacciones',
        'logistica': 'Otro',
        'capacitacion': 'Otro'
      };
      
      const mappedValue = mapServicio[servicioParam.toLowerCase()] || 'Otro';
      
      setFormData(prev => ({
        ...prev,
        tipoServicio: mappedValue
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const copyToClipboard = () => {
    if (cotizacion) {
      const textToCopy = `SOLICITUD DE COTIZACIÓN DESDE CALCULADORA\n\nEquipo(s) requerido(s):\n${cotizacion.items.map(item => `- ${item.categoria}: ${item.cantidad} unidad(es) × ${item.dias} días`).join('\n')}\n\nTotal estimado: $${cotizacion.total.toLocaleString('es-MX')} MXN`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const target = locations[selectedCity];

    if (selectedChannel === 'facebook') {
      window.open(target?.facebook, '_blank');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await sendContactMessage({
        nombre: `${formData.nombre} ${formData.apellido}`,
        email: formData.email,
        telefono: formData.telefono,
        sucursal: target?.nombre || selectedCity,
        canal: selectedChannel,
        tipoServicio: formData.tipoServicio,
        mensaje: formData.mensaje
      });
    } catch (err) {
      console.error('Error guardando en firebase', err);
    }

    const finalMessage = `Hola Machina ${target?.nombre || selectedCity},\n\nMi nombre es ${formData.nombre} ${formData.apellido}.\nEstoy interesado en: ${formData.tipoServicio}\n\nMensaje:\n${formData.mensaje}`;

    if (selectedChannel === 'whatsapp') {
      const cleanWhatsapp = target?.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(finalMessage)}`, '_blank');
    } else if (selectedChannel === 'email') {
      window.location.href = `mailto:${target?.email}?subject=Cotización Machina - ${formData.tipoServicio}&body=${encodeURIComponent(finalMessage)}`;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      setSuccess(false);
      setFormData({ nombre: '', apellido: '', email: '', telefono: '', tipoServicio: '', mensaje: '' });
    }, 4000);
  };


  return (
    <div className="min-h-screen bg-dark-950 bg-grid-pattern relative">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[400px] flex items-end overflow-hidden" 
        style={{ backgroundImage: 'url("/PageContacto.avif")', backgroundSize: 'cover', backgroundPosition: 'center 15%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 via-dark-900/70 to-dark-950/50" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 pb-16 w-full">
          <div className="inline-block bg-primary/10 border border-primary/20 rounded-full px-4 py-1 mb-6 backdrop-blur-sm animate-fade-in">
            <span className="text-primary font-bold text-xs tracking-wide uppercase">Estamos para servirte</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase animate-fade-in-up">
            Hablemos de tu <span className="text-primary">Proyecto</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
            Selecciona tu sucursal más cercana y el medio de contacto de tu preferencia.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
          {/* Step 1: Selección de Sucursal */}
          <div className="mb-12">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-dark-950 flex items-center justify-center text-sm">1</span>
              Elige tu sucursal
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {CIUDAD_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCity(key)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                    selectedCity === key
                      ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(255,193,7,0.2)] scale-105'
                      : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <MapPin className={`w-6 h-6 ${selectedCity === key ? 'text-primary' : 'text-gray-500'}`} />
                  <span className="font-bold text-sm text-center">{locations[key]?.nombre || key}</span>
                </button>
              ))}
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tarjetas Dinámicas de Información */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-dark-900/90 backdrop-blur-xl p-6 rounded-xl border border-white/10 transition-all duration-300 flex-1 flex flex-col justify-center">
              <div className="w-10 h-10 bg-dark-950 rounded-lg flex items-center justify-center mb-4 border border-white/5">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-white font-bold mb-2 uppercase tracking-tight text-sm">Llámanos ({locations[selectedCity]?.nombre})</h3>
              <p className="text-gray-400 text-xs mb-3">Atención de lunes a sábado.</p>
              <a href={`tel:${locations[selectedCity]?.telefono.replace(/\s+/g, '')}`} className="text-lg font-mono text-white hover:text-primary transition-colors block mt-auto">{locations[selectedCity]?.telefono}</a>
            </div>

            <div className="bg-dark-900/90 backdrop-blur-xl p-6 rounded-xl border border-white/10 transition-all duration-300 flex-1 flex flex-col justify-center">
              <div className="w-10 h-10 bg-dark-950 rounded-lg flex items-center justify-center mb-4 border border-white/5">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-white font-bold mb-2 uppercase tracking-tight text-sm">Escríbenos</h3>
              <p className="text-gray-400 text-xs mb-3">Envíanos tu solicitud de cotización.</p>
              <a href={`mailto:${locations[selectedCity]?.email}`} className="text-base font-mono text-white hover:text-primary transition-colors block mt-auto">{locations[selectedCity]?.email}</a>
            </div>

            <div className="bg-dark-900/90 backdrop-blur-xl p-6 rounded-xl border border-white/10 transition-all duration-300 flex-1 flex flex-col justify-center">
              <div className="w-10 h-10 bg-dark-950 rounded-lg flex items-center justify-center mb-4 border border-white/5">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-white font-bold mb-2 uppercase tracking-tight text-sm">Visítanos</h3>
              <p className="text-gray-400 text-xs mb-3">{locations[selectedCity]?.direccion}</p>
              <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-wider mt-auto">
                <Clock className="w-3 h-3" /> Lun-Vie: 08:00 - 18:00
              </div>
            </div>
          </div>

          {/* Contact Routing Dashboard */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Step 2: Selección de Canal */}
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-dark-950 flex items-center justify-center text-sm">2</span> 
                ¿Por dónde nos contactamos?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedChannel('whatsapp')}
                  className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                    selectedChannel === 'whatsapp' 
                      ? 'bg-[#25D366]/10 border-[#25D366] text-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.2)] scale-105'
                      : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-8 h-8" />
                  <span className="font-bold uppercase tracking-wider text-sm">WhatsApp</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedChannel('email')}
                  className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                    selectedChannel === 'email' 
                      ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(255,193,7,0.2)] scale-105'
                      : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <Mail className="w-8 h-8" />
                  <span className="font-bold uppercase tracking-wider text-sm">Correo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel('facebook')}
                  className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                    selectedChannel === 'facebook' 
                      ? 'bg-[#1877F2]/10 border-[#1877F2] text-[#1877F2] shadow-[0_0_20px_rgba(24,119,242,0.2)] scale-105'
                      : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <Facebook className="w-8 h-8" />
                  <span className="font-bold uppercase tracking-wider text-sm">Messenger</span>
                </button>
              </div>
            </div>

            {/* Step 3: Formulario Inteligente */}
            <div className="bg-dark-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-dark-950/50 p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-dark-950 flex items-center justify-center text-sm shrink-0">3</span> 
                  {selectedChannel === 'facebook' ? 'Aviso Importante' : 'Completa tu información'}
                </h2>
              </div>

              {selectedChannel === 'facebook' ? (
                <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                  <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-[#FFC107]" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4">Formulario Deshabilitado</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Por políticas de seguridad de Facebook, no podemos autocompletar tu mensaje. 
                    Te redirigiremos a nuestra página oficial de <strong>{selectedCity}</strong> para que puedas escribirnos directamente.
                  </p>
                  
                  {cotizacion && showCotizacion && (
                    <div className="mb-8 w-full max-w-md bg-dark-950 p-4 rounded-xl border border-white/10 text-left">
                      <p className="text-sm text-gray-400 mb-3">Antes de ir a Facebook, copia tu cotización para pegarla en el chat:</p>
                      <button 
                        onClick={copyToClipboard}
                        className="w-full flex items-center justify-center gap-2 bg-dark-800 hover:bg-dark-700 text-white py-3 rounded-lg border border-white/5 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? '¡Copiado!' : 'Copiar detalles de Cotización'}
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={handleSubmit}
                    className="bg-[#1877F2] text-white font-black py-4 px-10 rounded-xl hover:bg-[#1877F2]/90 transition-all shadow-lg hover:shadow-[#1877F2]/20 uppercase tracking-widest text-sm flex items-center gap-3"
                  >
                    Ir a Messenger <Facebook className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                  {/* Cotizacion Banner */}
                  {cotizacion && showCotizacion && (
                    <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-6 mb-6 relative">
                      <button
                        type="button"
                        onClick={clearCotizacion}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                          <Calculator className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold mb-2">Tienes un estimado calculado</h3>
                          <div className="space-y-1 mb-3">
                            {cotizacion.items.map((item, idx) => (
                              <p key={idx} className="text-gray-400 text-sm">
                                • {item.categoria}: {item.cantidad} × {item.dias} días
                              </p>
                            ))}
                          </div>
                          <p className="text-primary font-black text-xl">
                            Total: ${cotizacion.total.toLocaleString('es-MX')} MXN
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {success ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white">¡Te estamos redirigiendo!</h3>
                      <p className="text-gray-400">Si no se abre la aplicación, revisa las ventanas bloqueadas.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</label>
                          <input 
                            type="text" 
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Apellido</label>
                          <input 
                            type="text" 
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Corporativo</label>
                          <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Teléfono</label>
                          <input 
                            type="tel" 
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo de Servicio</label>
                        <select 
                          name="tipoServicio"
                          value={formData.tipoServicio}
                          onChange={handleChange}
                          required
                          className="w-full bg-dark-950 border border-dark-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        >
                          <option value="">Selecciona una opción...</option>
                          <option value="Renta de Maquinaria">Renta de Maquinaria</option>
                          <option value="Compra de Equipo">Compra de Equipo</option>
                          <option value="Servicio Técnico">Servicio Técnico</option>
                          <option value="Refacciones">Refacciones</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detalles del Proyecto</label>
                        <textarea 
                          name="mensaje"
                          value={formData.mensaje}
                          onChange={handleChange}
                          required
                          rows={4} 
                          className="w-full bg-dark-950 border border-dark-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none" 
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full text-dark-950 font-black py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2 group disabled:opacity-50 ${
                          selectedChannel === 'whatsapp' ? 'bg-[#25D366] hover:bg-[#25D366]/90 shadow-[#25D366]/20' : 'bg-primary hover:bg-primary-hover shadow-primary/20'
                        }`}
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                        ) : (
                          <>
                            Enviar por {selectedChannel === 'whatsapp' ? 'WhatsApp' : 'Correo'} 
                            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}