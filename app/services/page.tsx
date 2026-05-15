'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Wrench, Truck, ShoppingBag, Calendar, Users, Settings, ArrowRight, CheckCircle2, Zap, Shield, BarChart3, X, ChevronRight } from 'lucide-react';

export default function Services() {
  const mainServices = [
    {
      id: "renta",
      icon: Calendar,
      title: "Renta de Maquinaria",
      description: "Flota moderna y diversificada disponible por día, semana o mes. Equipos certificados listos para operar en cualquier entorno.",
      fullDescription: "Nuestro servicio de renta está diseñado para brindar máxima flexibilidad a tus proyectos. Contamos con una de las flotas más jóvenes del país, asegurando eficiencia y reduciendo tiempos muertos. Cada equipo pasa por un riguroso checklist antes de llegar a tu obra.",
      features: ["Disponibilidad inmediata", "Mantenimiento preventivo incluido en sitio", "Seguro de cobertura amplia", "Opción de operadores certificados (DC-3)"],
      subServices: ["Excavadoras y Retroexcavadoras", "Tractores topadores (Dozers)", "Cargadores frontales", "Motoconformadoras", "Equipo de compactación"],
      image: "/ImagenesServicio/RentaServicios.avif"
    },
    {
      id: "venta",
      icon: ShoppingBag,
      title: "Venta de Equipos",
      description: "Distribuidores autorizados de las mejores marcas. Equipos nuevos y seminuevos garantizados.",
      fullDescription: "La adquisición de maquinaria pesada es una inversión crítica. En Machina te asesoramos técnica y financieramente para que elijas el equipo exacto que maximizará tu retorno de inversión. Somos distribuidores directos, lo que garantiza el mejor precio y respaldo total de fábrica.",
      features: ["Planes de financiamiento y leasing", "Garantía extendida de fábrica", "Capacitación técnica en la entrega", "Primer servicio de mantenimiento gratis"],
      subServices: ["Equipos Nuevos 0 horas", "Seminuevos Certificados (Garantía de 1 año)", "Sistemas de Guiado (GPS) instalados de fábrica", "Aditamentos especializados"],
      image: "/ImagenesServicio/VentaServicios.avif"
    }
  ];

  const complementaryServices = [
    {
      id: "mantenimiento",
      icon: Wrench,
      title: "Mantenimiento Técnico",
      description: "Taller especializado y servicios en campo. Mantenimiento preventivo y correctivo con técnicos certificados.",
      fullDescription: "Un equipo detenido es dinero perdido. Nuestro escuadrón de servicio cuenta con unidades móviles equipadas para resolver el 80% de las fallas directamente en tu obra. Para diagnósticos mayores, nuestras instalaciones cuentan con bahías de servicio de última generación y dinamómetros.",
      features: ["Diagnóstico computarizado", "Pólizas de servicio anual", "Atención a emergencias 24/7", "Reparación de trenes de fuerza y cilindros"],
      image: "/ImagenesServicio/MantenimientoServicios.avif"
    },
    {
      id: "refacciones",
      icon: Settings,
      title: "Refacciones Originales",
      description: "Stock continuo de refacciones OEM para todas las marcas. Envíos nacionales en tiempo récord.",
      fullDescription: "Mantén la vida útil y el valor de reventa de tus equipos usando exclusivamente piezas genuinas. Nuestro almacén central procesa pedidos el mismo día, y nuestros asesores de mostrador tienen acceso directo a los despieces de fábrica para asegurar que siempre compres la pieza correcta.",
      features: ["Más de 50,000 números de parte", "Asesoría técnica para números de reemplazo", "Envíos express nacionales", "Garantía directa de fabricante"],
      image: "/ImagenesServicio/RefaccionesServicios.avif"
    },
    {
      id: "logistica",
      icon: Truck,
      title: "Logística y Transporte",
      description: "Traslado seguro de maquinaria pesada y sobredimensionada a cualquier rincón de la república.",
      fullDescription: "Mover fierros pesados requiere experiencia y legalidad. Contamos con nuestra propia flota de tractocamiones, plataformas, camas bajas (lowboys) y equipos modulares para carga sobredimensionada. Nos encargamos de todo el papeleo y abanderamiento.",
      features: ["Permisos federales y estatales al día", "Seguro de carga de puerta a puerta", "Rastreo satelital", "Personal capacitado para maniobras de alto riesgo"],
      image: "/ImagenesServicio/LogisticaServicios.avif"
    },
    {
      id: "capacitacion",
      icon: Users,
      title: "Capacitación a Operadores",
      description: "Certificaciones oficiales y entrenamiento para sacar el máximo rendimiento a la maquinaria de forma segura.",
      fullDescription: "La mejor máquina del mundo no rinde si el operador no está calificado. Nuestros programas de capacitación combinan teoría intensiva, horas en simuladores virtuales inmersivos y prácticas reales en campo para garantizar operaciones seguras, productivas y eficientes.",
      features: ["Instructores certificados de fábrica", "Uso de simuladores virtuales", "Prácticas reales y evaluación en sitio", "Emisión de constancias de habilidades DC-3"],
      image: "/ImagenesServicio/CapacitacionServicios.avif"
    }
  ];

  const [visibleProcess, setVisibleProcess] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const processRef = useRef<HTMLDivElement>(null);

  const openModal = (service: any) => {
    setSelectedService(service);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedService(null);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !visibleProcess) {
          setVisibleProcess(true);
        }
      },
      { threshold: 0.2 }
    );

    if (processRef.current) {
      observer.observe(processRef.current);
    }

    return () => observer.disconnect();
  }, [visibleProcess]);

  return (
    <div className="min-h-screen bg-dark-950 bg-noise relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0">
          <img 
            src="/Servicios4.avif" 
            alt="Servicios" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950/80 via-dark-950/50 to-dark-950/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 border border-primary/20 rounded-full px-4 py-1 mb-6 backdrop-blur-sm">
              <span className="text-primary font-bold text-xs tracking-wide uppercase flex items-center gap-2">
                <Zap className="w-3 h-3" /> Soluciones Integrales
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-none">
              Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">Servicios</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Más que maquinaria, ofrecemos soluciones completas para potenciar la productividad de tu proyecto.
              Respaldo total en cada etapa de tu obra.
            </p>
          </div>
        </div>
      </section>

      {/* Main Core Services (Venta & Renta) */}
      <section className="pb-16 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight text-center mb-4">Core Business</h2>
            <div className="w-24 h-1 bg-primary rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mainServices.map((service, index) => (
              <div 
                key={index}
                className="group relative bg-dark-900 rounded-[2rem] overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 flex flex-col sm:flex-row h-auto sm:h-80 cursor-pointer"
                onClick={() => openModal(service)}
              >
                <div className="w-full sm:w-2/5 h-64 sm:h-full relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent z-10"></div>
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 z-20 w-12 h-12 bg-primary text-dark-950 rounded-xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1 bg-gradient-to-l from-dark-900 via-dark-900 to-dark-900/95 relative z-20">
                  <h3 className="text-3xl font-black text-white mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed flex-1">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                    <span className="text-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                      Ver Detalles Completos <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complementary Services Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Servicios Especializados</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complementaryServices.map((service, index) => (
              <div 
                key={index}
                className="group relative bg-dark-950 rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                onClick={() => openModal(service)}
              >
                <div className="h-40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-dark-950/40 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute bottom-4 right-4 z-20 w-10 h-10 bg-dark-900/90 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
                    {service.description}
                  </p>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 group-hover:text-white transition-colors">
                    Explorar <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Quick View */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm cursor-pointer"
            onClick={closeModal}
          ></div>
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-dark-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row z-10 animate-in fade-in zoom-in-95 duration-300">
            
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 z-30 w-10 h-10 bg-dark-950/80 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-dark-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full lg:w-2/5 h-64 lg:h-auto relative">
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent z-10 lg:hidden"></div>
              <img 
                src={selectedService.image} 
                alt={selectedService.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6 z-20 w-16 h-16 bg-primary text-dark-950 rounded-2xl shadow-2xl flex items-center justify-center hidden lg:flex">
                <selectedService.icon className="w-8 h-8" />
              </div>
            </div>

            <div className="w-full lg:w-3/5 p-8 lg:p-12 overflow-y-auto custom-scrollbar">
              <span className="text-primary font-bold text-xs uppercase tracking-widest mb-3 block">Machina {selectedService.id === 'renta' || selectedService.id === 'venta' ? 'Core Business' : 'Especializado'}</span>
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 uppercase tracking-tight">{selectedService.title}</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {selectedService.fullDescription}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> Ventajas Competitivas
                  </h4>
                  <ul className="space-y-3">
                    {selectedService.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedService.subServices && (
                  <div>
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" /> Especialidades
                    </h4>
                    <ul className="space-y-3">
                      {selectedService.subServices.map((sub: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 shrink-0"></div>
                          {sub}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-dark-950 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-white font-bold mb-1">¿Listo para comenzar?</p>
                  <p className="text-gray-500 text-sm">Nuestro equipo responderá tu solicitud en menos de 30 minutos.</p>
                </div>
                <Link 
                  href={`/contact?servicio=${selectedService.id}`}
                  onClick={closeModal}
                  className="w-full sm:w-auto bg-primary text-dark-950 px-8 py-4 rounded-xl font-black text-center hover:bg-primary-hover hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,193,7,0.2)] shrink-0"
                >
                  Solicitar Cotización
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Process Section */}
      <section 
        ref={processRef}
        className="py-24 bg-dark-900 border-y border-white/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-primary font-mono text-xs tracking-widest uppercase mb-2 block">Metodología</span>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Proceso de Trabajo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

            {[
              { step: "01", title: "Diagnóstico", desc: "Evaluamos las necesidades específicas de tu proyecto.", delay: "0s" },
              { step: "02", title: "Propuesta", desc: "Diseñamos una solución a medida con costos optimizados.", delay: "0.1s" },
              { step: "03", title: "Ejecución", desc: "Implementación rápida con seguimiento en tiempo real.", delay: "0.2s" },
              { step: "04", title: "Soporte", desc: "Acompañamiento continuo hasta finalizar la obra.", delay: "0.3s" }
            ].map((item, idx) => (
              <div 
                key={idx}
                className={`relative text-center group`}
                style={{ animation: visibleProcess ? `floatUp 0.6s ease-out ${item.delay} forwards` : 'opacity: 0' }}
              >
                <div className="w-24 h-24 mx-auto bg-dark-950 rounded-full border-4 border-dark-900 flex items-center justify-center mb-6 relative z-10 group-hover:border-primary transition-colors duration-300 shadow-xl group-hover:scale-110 transition-transform">
                  <span className="text-3xl font-black text-gray-700 group-hover:text-primary transition-colors">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}