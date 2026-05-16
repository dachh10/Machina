'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, MapPin, Hammer, Mail, Clock } from 'lucide-react';
import { getConfig, DEFAULT_SUCURSALES, SucursalData } from '@/lib/firestore';

export function Footer() {
  const [locations, setLocations] = useState<Record<string, SucursalData>>(DEFAULT_SUCURSALES);
  const cityKeys = ['cdmx', 'monterrey', 'guadalajara', 'queretaro'];

  useEffect(() => {
    getConfig().then((config: any) => {
      if (config?.sucursales) {
        setLocations({ ...DEFAULT_SUCURSALES, ...config.sucursales });
      }
    }).catch(() => {});
  }, []);

  return (
    <footer className="bg-dark-950 border-t border-dark-800 pt-12 pb-8 bg-carbon relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-transparent to-transparent opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                <Hammer className="w-5 h-5 text-dark-900" />
              </div>
              <span className="text-white font-black text-xl tracking-tighter uppercase">
                MACHINA
              </span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs">
              Soluciones integrales en maquinaria pesada para los proyectos más exigentes de la industria nacional.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-[10px] tracking-[0.2em] text-primary">Explorar</h3>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-gray-400 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-dark-700 group-hover:bg-primary rounded-full transition-colors"></span>Inicio</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-dark-700 group-hover:bg-primary rounded-full transition-colors"></span>Nosotros</Link></li>
              <li><Link href="/catalog" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-dark-700 group-hover:bg-primary rounded-full transition-colors"></span>Catálogo</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-dark-700 group-hover:bg-primary rounded-full transition-colors"></span>Servicios</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-[10px] tracking-[0.2em] text-primary">Sucursales</h3>
            <ul className="grid grid-cols-1 gap-3 text-gray-400 text-xs">
              {cityKeys.map((key) => (
                <li key={key} className="group">
                  <Link href={`/contact?ubicacion=${key}`} className="flex items-center justify-between gap-4 hover:bg-white/5 p-1 rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-dark-600 group-hover:text-primary shrink-0" />
                      <span className="text-gray-300 font-bold group-hover:text-white">{locations[key]?.nombre || key}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 group-hover:text-gray-300">{locations[key]?.telefono}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-[10px] tracking-[0.2em] text-primary">Atención</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-3.5 h-3.5 text-primary mt-0.5" />
                <div className="text-[11px] space-y-1">
                  <p className="text-white">Lun - Vie: <span className="text-gray-400">08:00 - 18:00</span></p>
                  <p className="text-white">Sábados: <span className="text-gray-400">09:00 - 14:00</span></p>
                </div>
              </div>
              <Link 
                href="/contact"
                className="inline-flex items-center gap-2 bg-dark-900 hover:bg-dark-800 border border-white/5 text-[10px] font-black text-primary uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
              >
                <Mail className="w-3 h-3" /> Contactar
              </Link>
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center gap-x-8 gap-y-4">
          <p className="text-gray-600 text-[10px]">
            © {new Date().getFullYear()} Machina. Potencia que construye el futuro.
          </p>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            <Link href="/privacy" className="hover:text-primary transition-colors">Aviso de Privacidad</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}