'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle, MapPin, ExternalLink } from 'lucide-react';
import { getConfig, DEFAULT_SUCURSALES, SucursalData } from '@/lib/firestore';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [locations, setLocations] = useState<Record<string, SucursalData>>(DEFAULT_SUCURSALES);
  const cityKeys = ['cdmx', 'monterrey', 'guadalajara', 'queretaro'];

  useEffect(() => {
    getConfig().then((config: any) => {
      if (config?.sucursales) {
        setLocations({ ...DEFAULT_SUCURSALES, ...config.sucursales });
      }
    }).catch(() => {});
  }, []);

  const openWhatsApp = (whatsapp: string, city: string) => {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(`Hola Machina ${city}, estoy navegando en su sitio web y me gustaría solicitar información.`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip/Menu */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-72 bg-dark-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#25D366] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-sm">Ventas y Soporte</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-2 bg-dark-900">
            <p className="text-gray-400 text-[11px] uppercase tracking-widest font-bold mb-3 px-2">Selecciona tu sucursal</p>
            {cityKeys.map((key) => (
              <button
                key={key}
                onClick={() => openWhatsApp(locations[key].whatsapp, locations[key].nombre)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center group-hover:bg-[#25D366]/10 transition-colors">
                    <MapPin className="w-4 h-4 text-gray-500 group-hover:text-[#25D366] transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                    {locations[key]?.nombre || key}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
          
          <div className="p-3 bg-dark-950/50 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-500">Atención inmediata de Lunes a Sábado</p>
          </div>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 relative ${
          isOpen ? 'bg-dark-800 rotate-90' : 'bg-[#25D366] hover:shadow-[#25D366]/20'
        }`}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <>
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping-slow opacity-20"></span>
            <svg 
              viewBox="0 0 24 24" 
              className="w-9 h-9 fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </>
        )}
      </button>
    </div>
  );
}