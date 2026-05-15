'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Calculator, Truck, X, Loader2, Calendar, CheckCircle2, AlertCircle, MapPin, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface CategoryOption {
  nombre: string;
  precioPromedio: number;
}

interface CalculatedItem {
  categoria: string;
  cantidad: number;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  subtotal: number;
}

export default function ProjectCalculator() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  
  // Form state
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [fechaInicio, setFechaInicio] = useState(today);
  const [fechaFin, setFechaFin] = useState(nextWeek);
  const [errorInput, setErrorInput] = useState('');
  
  // Location state
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('ubicacion') || 'México');
  const locations = ['México', 'CDMX', 'Monterrey', 'Guadalajara', 'Querétaro'];

  // Cart state
  const [items, setItems] = useState<CalculatedItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { getProducts, getCategories } = await import('@/lib/firestore');
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);

        // 1. Filtrar categorías que corresponden a esta ciudad
        const filteredCategories = (categoriesData as any[]).filter(cat => 
          selectedLocation === 'México' || (cat.ubicaciones && cat.ubicaciones.includes(selectedLocation))
        );

        // 2. Filtrar productos que corresponden a esta ciudad
        const filteredProducts = (productsData as any[]).filter(p => 
          selectedLocation === 'México' || (p.ubicaciones && p.ubicaciones.includes(selectedLocation))
        );

        // 3. Agrupar precios por categoría de los productos filtrados
        const categoryPrices = filteredProducts.reduce((acc: Record<string, number[]>, product: any) => {
          if (product.precio && product.categoria) {
            if (!acc[product.categoria]) acc[product.categoria] = [];
            const precioLimpio = Number(String(product.precio).replace(/[^0-9.-]+/g,""));
            if (!isNaN(precioLimpio)) acc[product.categoria].push(precioLimpio);
          }
          return acc;
        }, {});

        // 4. Mapear las categorías filtradas a opciones, usando sus productos para el precio
        // O si no tienen productos, usar un promedio general si existe
        const categoryOptions = filteredCategories.map(cat => {
          const precios = categoryPrices[cat.nombre] || [];
          const promedio = precios.length > 0 
            ? Math.round(precios.reduce((a, b) => a + b, 0) / precios.length)
            : 0; // O un precio base si prefieres

          return {
            nombre: cat.nombre,
            precioPromedio: promedio,
          };
        }).filter(opt => opt.precioPromedio > 0); // Solo mostramos si tienen precio (equipos reales)

        setCategories(categoryOptions);
        setSelectedCategory('');
      } catch (error) {
        console.error('Error loading calculator data:', error);
      }
      setLoading(false);
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, selectedLocation]);

  const calcularDias = (inicio: string, fin: string) => {
    if (!inicio || !fin) return 0;
    const date1 = new Date(inicio);
    const date2 = new Date(fin);
    const diffTime = date2.getTime() - date1.getTime();
    if (diffTime < 0) return -1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Incluye el primer día
  };

  const addItem = () => {
    setErrorInput('');
    if (!selectedCategory) {
      setErrorInput('Selecciona un equipo.');
      return;
    }
    
    const diasCalculados = calcularDias(fechaInicio, fechaFin);
    if (diasCalculados <= 0) {
      setErrorInput('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }

    const category = categories.find(c => c.nombre === selectedCategory);
    if (!category) return;

    const subtotal = category.precioPromedio * cantidad * diasCalculados;
    const newItem: CalculatedItem = {
      categoria: selectedCategory,
      cantidad,
      fechaInicio,
      fechaFin,
      dias: diasCalculados,
      subtotal,
    };

    setItems([...items, newItem]);
    setTotal(prev => prev + subtotal);
    
    // Resetear formulario parcial
    setSelectedCategory('');
    setCantidad(1);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    const removed = newItems.splice(index, 1)[0];
    setItems(newItems);
    setTotal(prev => prev - removed.subtotal);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full md:w-auto bg-primary text-dark-950 px-8 py-4 rounded-lg font-black text-lg hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(255,193,7,0.3)] hover:shadow-[0_0_30px_rgba(255,193,7,0.5)] flex items-center justify-center gap-3 cursor-pointer group uppercase tracking-widest"
      >
        <Calculator className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span>Calcular Presupuesto</span>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-dark-950/90 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative z-[10000] bg-dark-950 border border-white/10 rounded-2xl w-full max-w-5xl h-[90vh] sm:h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-dark-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Cotizador en Vivo</h2>
                  <p className="text-gray-400 text-sm">Calcula tu maquinaria al instante</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white bg-dark-800 hover:bg-dark-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cuerpo a dos columnas */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              
              {/* COLUMNA IZQUIERDA: Formulario */}
              <div className="w-full lg:w-7/12 p-6 lg:p-8 overflow-y-auto bg-dark-950">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-dark-950 flex items-center justify-center text-xs font-black">1</span>
                  Ubicación de la Obra
                </h3>

                <div className="bg-dark-900/50 p-6 rounded-xl border border-white/5 mb-8">
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> ¿En qué ciudad está tu proyecto?
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full bg-dark-950 border border-dark-700 text-white rounded-lg px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer text-lg appearance-none font-bold"
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-widest italic">
                    * Mostraremos solo los equipos disponibles en esta sucursal.
                  </p>
                </div>

                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-dark-950 flex items-center justify-center text-xs font-black">2</span>
                  Selecciona el Equipo
                </h3>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="font-bold text-xs uppercase tracking-widest">Filtrando Inventario...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Selección de Equipo */}
                    <div className="bg-dark-900/50 p-6 rounded-xl border border-white/5">
                      <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Equipo Disponible en {selectedLocation}</label>
                      <div className="relative">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full bg-dark-950 border border-dark-700 text-white rounded-lg px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer text-lg appearance-none font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={categories.length === 0}
                        >
                          {categories.length === 0 ? (
                            <option value="">No hay equipos en esta ubicación</option>
                          ) : (
                            <>
                              <option value="">-- Elige una categoría --</option>
                              {categories.map((cat) => (
                                <option key={cat.nombre} value={cat.nombre}>
                                  {cat.nombre} ({formatCurrency(cat.precioPromedio)} / día)
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Fechas y Cantidad */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-dark-900/50 p-5 rounded-xl border border-white/5 md:col-span-1">
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Cantidad</label>
                        <div className="flex items-center bg-dark-950 rounded-lg border border-dark-700 overflow-hidden">
                          <button type="button" onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-800 transition-colors">-</button>
                          <input
                            type="number"
                            min="1"
                            value={cantidad}
                            onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-transparent text-white text-center py-3 focus:outline-none font-bold"
                          />
                          <button type="button" onClick={() => setCantidad(cantidad + 1)} className="px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-800 transition-colors">+</button>
                        </div>
                      </div>

                      <div className="bg-dark-900/50 p-5 rounded-xl border border-white/5 md:col-span-2">
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Periodo de Renta
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="date"
                              min={today}
                              value={fechaInicio}
                              onChange={(e) => setFechaInicio(e.target.value)}
                              className="w-full bg-dark-950 border border-dark-700 text-white rounded-lg px-3 py-3 focus:border-primary focus:outline-none text-sm [color-scheme:dark]"
                            />
                            <span className="absolute -top-2 left-2 bg-dark-900 text-gray-500 text-[10px] px-1 uppercase font-bold">Inicio</span>
                          </div>
                          <span className="text-gray-600">-</span>
                          <div className="flex-1 relative">
                            <input
                              type="date"
                              min={fechaInicio}
                              value={fechaFin}
                              onChange={(e) => setFechaFin(e.target.value)}
                              className="w-full bg-dark-950 border border-dark-700 text-white rounded-lg px-3 py-3 focus:border-primary focus:outline-none text-sm [color-scheme:dark]"
                            />
                            <span className="absolute -top-2 left-2 bg-dark-900 text-gray-500 text-[10px] px-1 uppercase font-bold">Fin</span>
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <span className="text-primary text-xs font-bold">Total: {calcularDias(fechaInicio, fechaFin) > 0 ? calcularDias(fechaInicio, fechaFin) : 0} día(s)</span>
                        </div>
                      </div>
                    </div>

                    {errorInput && (
                      <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-lg border border-red-400/20 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{errorInput}</p>
                      </div>
                    )}

                    <button
                      onClick={addItem}
                      className="w-full bg-dark-800 text-white font-bold py-4 rounded-xl hover:bg-dark-700 border border-white/10 hover:border-white/30 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <span>Agregar al Presupuesto</span>
                    </button>
                  </div>
                )}
              </div>

              {/* COLUMNA DERECHA: Resumen (Ticket) */}
              <div className="w-full lg:w-5/12 bg-dark-900/80 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col relative">
                {/* Textura de fondo sutil */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                
                <div className="p-6 lg:p-8 flex flex-col h-full relative z-10">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-dark-950 flex items-center justify-center text-xs font-black">3</span>
                    Resumen del Presupuesto
                  </h3>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-6">
                    {items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center px-4 opacity-50">
                        <Truck className="w-16 h-16 mb-4" />
                        <p className="font-medium text-lg mb-1">Tu presupuesto está vacío</p>
                        <p className="text-sm">Agrega equipos desde el panel izquierdo para comenzar.</p>
                      </div>
                    ) : (
                      items.map((item, idx) => (
                        <div key={idx} className="bg-dark-950/80 rounded-xl p-4 border border-white/5 hover:border-primary/30 transition-colors relative group">
                          <button
                            onClick={() => removeItem(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-bold pr-6 leading-tight">{item.categoria}</h4>
                            <span className="text-primary font-bold shrink-0">{formatCurrency(item.subtotal)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="bg-dark-800 px-2 py-1 rounded">Cant: {item.cantidad}</span>
                            <span className="bg-dark-800 px-2 py-1 rounded">{item.dias} días</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Totales */}
                  <div className="bg-dark-950 rounded-2xl p-6 border border-white/10 mt-auto shadow-2xl">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-gray-400 text-sm">
                        <span>Subtotal</span>
                        <span className="text-white font-mono">{formatCurrency(total)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400 text-sm">
                        <span>IVA (16%)</span>
                        <span className="text-white font-mono">{formatCurrency(total * 0.16)}</span>
                      </div>
                    </div>
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>
                    
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-white font-bold uppercase tracking-wider text-sm">Total Estimado</span>
                      <span className="text-3xl font-black text-primary">{formatCurrency(total * 1.16)}</span>
                    </div>

                    <button
                      disabled={items.length === 0}
                      onClick={() => {
                        const params = new URLSearchParams({
                          ubicacion: selectedLocation,
                          cotizacion: JSON.stringify({
                            items,
                            total: total * 1.16
                          })
                        });
                        router.push(`/contact?${params.toString()}`);
                      }}
                      className="w-full bg-primary text-dark-950 font-black py-4 rounded-xl hover:bg-primary-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer uppercase tracking-widest shadow-[0_0_20px_rgba(255,193,7,0.2)] flex items-center justify-center gap-2 group"
                    >
                      <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Solicitar Cotización
                    </button>
                    <p className="text-center text-gray-500 text-[10px] mt-3 uppercase tracking-widest">Precios sujetos a disponibilidad</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}