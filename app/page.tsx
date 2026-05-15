'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Shield, Clock, MapPin, Zap, ChevronRight, Zap as ZapIcon, Loader2, Calculator, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProjectCalculator from './components/ProjectCalculator';
import { getProducts, getCategories } from '@/lib/firestore';

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: string;
  imagen: string;
  tag: string | null;
  status: string;
  tipoNegocio?: 'renta' | 'venta' | 'ambos';
  ubicaciones?: string[];
}

interface Category {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagenDestacada?: string;
  destacada?: boolean;
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Producto[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedLocation, setSelectedLocation] = useState('México');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  const locations = ['México', 'CDMX', 'Monterrey', 'Guadalajara', 'Querétaro'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setTotalProducts(productsData.length);
        setProducts(productsData.slice(0, 4) as any[]);
        setCategories(categoriesData as Category[]);
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedCategory !== 'Todas') params.append('categoria', selectedCategory);
    // Location is not yet fully implemented in catalog but we can send it
    if (selectedLocation !== 'México') params.append('ubicacion', selectedLocation);
    
    router.push(`/catalog?${params.toString()}`);
  };
  return (
    <div className="flex flex-col min-h-screen bg-dark-950">
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-900/90 to-transparent" />
          <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-primary"></div>
              <span className="text-primary font-mono text-sm tracking-widest uppercase font-bold">Maquinaria Pesada Profesional</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-8 tracking-tighter">
              PODER <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                ABSOLUTO
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl border-l-2 border-primary/30 pl-6">
              Renta y venta de equipo de construccion de alto rendimiento. 
              Tecnologia de punta y soporte tecnico especializado para obras que no pueden detenerse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/catalog"
                className="bg-primary text-dark-950 px-8 py-4 rounded-sm font-bold text-lg hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(255,193,7,0.3)] hover:shadow-[0_0_30px_rgba(255,193,7,0.5)] text-center flex items-center justify-center gap-2 group"
              >
                Ver Catalogo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/contact"
                className="bg-white/5 backdrop-blur-sm border border-white/10 text-white px-8 py-4 rounded-sm font-bold text-lg hover:bg-white/10 transition-all text-center"
              >
                Contactar Asesor
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-500">
          <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-primary rounded-full"></div>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-dark-900/80 p-6 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Input de Búsqueda */}
            <div className="lg:col-span-5">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-14 overflow-hidden bg-dark-950 border border-white/5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <div className="text-gray-500 flex items-center justify-center px-4">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex w-full border-none bg-transparent focus:ring-0 px-2 text-base font-bold text-white placeholder:text-gray-600 focus:outline-none" 
                  placeholder="¿Qué equipo necesitas hoy?"
                />
              </div>
            </div>

            {/* Dropdowns */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3">
              {/* Categoría */}
              <div className="relative flex-1">
                <button 
                  onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowLocationMenu(false); }}
                  className="flex h-14 w-full items-center justify-between gap-x-3 rounded-xl bg-dark-950 px-4 border border-white/5 hover:border-primary/50 transition-all text-white group"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-black uppercase tracking-tight">{selectedCategory === 'Todas' ? 'Tipo de Equipo' : selectedCategory}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showCategoryMenu && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-dark-900 border border-white/10 rounded-xl shadow-2xl z-50 py-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    <button 
                      onClick={() => { setSelectedCategory('Todas'); setShowCategoryMenu(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 text-gray-400 hover:text-primary transition-colors text-sm font-bold uppercase"
                    >
                      Todas las Categorías
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.nombre); setShowCategoryMenu(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 text-gray-400 hover:text-primary transition-colors text-sm font-bold uppercase"
                      >
                        {cat.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ubicación */}
              <div className="relative flex-1">
                <button 
                  onClick={() => { setShowLocationMenu(!showLocationMenu); setShowCategoryMenu(false); }}
                  className="flex h-14 w-full items-center justify-between gap-x-3 rounded-xl bg-dark-950 px-4 border border-white/5 hover:border-primary/50 transition-all text-white group"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-black uppercase tracking-tight">{selectedLocation}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showLocationMenu ? 'rotate-180' : ''}`} />
                </button>

                {showLocationMenu && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-dark-900 border border-white/10 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                    {locations.map(loc => (
                      <button 
                        key={loc}
                        onClick={() => { setSelectedLocation(loc); setShowLocationMenu(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 text-gray-400 hover:text-primary transition-colors text-sm font-bold uppercase"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Botón Buscar */}
            <div className="lg:col-span-2">
              <button 
                onClick={handleSearch}
                className="w-full h-14 bg-primary text-dark-950 font-black rounded-xl uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(255,193,7,0.2)] hover:shadow-primary/40 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                BUSCAR
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 overflow-hidden bg-grid-pattern">
        <div className="absolute inset-0 bg-dark-900" />
        
        {/* Elementos flotando decorativos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-24 h-24 border border-[#FFC107]/10 rounded-lg float-element" style={{ animationDelay: '0s' }} />
          <div className="absolute top-20 right-20 w-16 h-16 bg-[#FFC107]/5 rounded-full float-delayed" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-10 right-1/4 w-20 h-20 border border-[#FFC107]/10 rounded-full float-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/4 w-14 h-14 bg-[#FFC107]/5 rounded-lg float-element" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: `${totalProducts}`, label: "Equipos Disponibles", icon: Shield },
              { number: "24/7", label: "Soporte Técnico", icon: Clock },
              { number: "4", label: "Ciudades Cubiertas", icon: MapPin },
              { number: "15+", label: "Años de Experiencia", icon: Zap },
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="group relative bg-dark-950/50 border border-white/5 rounded-xl p-6 hover:border-[#FFC107]/30 hover:bg-dark-950 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Glow effect en hover */}
                <div className="absolute inset-0 bg-[#FFC107]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" style={{ boxShadow: '0 0 30px rgba(255,193,7,0.1)' }} />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-lg bg-[#FFC107]/10 flex items-center justify-center mb-4 group-hover:bg-[#FFC107]/20 transition-colors float-element">
                    <stat.icon className="w-7 h-7 text-[#FFC107]" />
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <h3 className="text-4xl font-black text-white tracking-tight">{stat.number}</h3>
                    <div className="h-1 w-8 bg-[#FFC107] rounded-full group-hover:w-12 transition-all duration-300" />
                  </div>
                  <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-dark-950 bg-grid-pattern relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-primary font-mono text-xs tracking-widest uppercase mb-2 block">Nuestra Flota</span>
              <h2 className="text-4xl md:text-5xl font-black text-white">CATEGORIAS DESTACADAS</h2>
            </div>
            <Link href="/catalog" className="flex items-center gap-2 text-white hover:text-primary transition-colors font-bold border-b border-white/20 pb-1 hover:border-primary">
              Ver todo el inventario <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(categories.filter(c => c.destacada).slice(0, 3).length > 0 
              ? categories.filter(c => c.destacada).slice(0, 3) 
              : categories.slice(0, 3)
            ).map((cat, idx) => (
              <Link key={cat.id} href={`/catalog?categoria=${cat.nombre}`} className="group relative h-[500px] bg-dark-900 overflow-hidden cursor-pointer border border-dark-800 hover:border-primary/50 transition-colors">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: cat.imagenDestacada ? `url("${cat.imagenDestacada}")` : undefined }}
                />
                {!cat.imagenDestacada && (
                  <div className="absolute inset-0 bg-dark-800 flex items-center justify-center">
                    <Shield className="w-16 h-16 text-dark-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
                
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <ArrowRight className="w-8 h-8 text-primary -rotate-45" />
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="h-1 w-12 bg-primary mb-4 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-2">{cat.descripcion || cat.nombre}</p>
                  <h3 className="text-3xl font-black text-white uppercase italic">{cat.nombre}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-950 border-y border-white/5 bg-grid-pattern relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-mono text-xs tracking-widest uppercase mb-2 block">Selección Premium</span>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Equipos Populares</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, idx) => (
                <Link key={product.id} href={`/catalog/${product.id}`} className="bg-dark-950 rounded-xl overflow-hidden border border-white/10 hover:border-primary transition-all group flex flex-col hover:-translate-y-1 hover:shadow-xl">
                  <div className="aspect-[4/3] bg-dark-800 relative overflow-hidden">
                    <img alt={product.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={product.imagen} />
                    {product.tag && (
                      <div className="absolute top-3 left-3 bg-primary text-dark-950 text-[10px] font-black px-2 py-1 rounded-sm uppercase">{product.tag}</div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h5 className="text-lg font-bold text-white leading-tight mb-1">{product.nombre}</h5>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">{product.categoria}</p>
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="font-black text-white text-lg">{product.precio}</span>
                      <button className="w-8 h-8 rounded-lg bg-dark-800 text-gray-400 group-hover:bg-primary group-hover:text-dark-950 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-dark-900 border-y border-white/10 relative overflow-hidden">
        {/* Elementos decorativos sutiles */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-dark-950/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-primary font-mono text-xs uppercase tracking-widest">Herramienta Inteligente</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                ¿PLANIFICANDO UNA OBRA?
              </h2>
              <p className="text-gray-400 text-lg max-w-xl">
                Cotiza en tiempo real la maquinaria que necesitas. Selecciona tus equipos, define las fechas y obtén tu presupuesto al instante.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <ProjectCalculator />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}