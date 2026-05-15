'use client';

import { useState, useEffect } from 'react';
import {
  Settings, Save, Loader2, Building, Phone, Mail,
  MapPin, Clock, Globe, Facebook,
  Instagram, Check, ChevronRight, Smartphone
} from 'lucide-react';
import { getConfig, updateConfig, DEFAULT_SUCURSALES, SucursalData } from '@/lib/firestore';

type TabId = 'empresa' | 'sucursales';

const CIUDAD_KEYS = ['cdmx', 'monterrey', 'guadalajara', 'queretaro'] as const;
const CIUDAD_LABELS: Record<string, string> = {
  cdmx: 'Ciudad de México',
  monterrey: 'Monterrey',
  guadalajara: 'Guadalajara',
  queretaro: 'Querétaro',
};

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'empresa', label: 'Empresa', icon: <Building className="w-4 h-4" /> },
  { id: 'sucursales', label: 'Sucursales', icon: <MapPin className="w-4 h-4" /> },
];

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('empresa');
  const [activeCiudad, setActiveCiudad] = useState<string>('cdmx');

  const [empresa, setEmpresa] = useState({
    nombreEmpresa: '',
    horario: '',
    instagram: '',
  });

  const [sucursales, setSucursales] = useState<Record<string, SucursalData>>(
    DEFAULT_SUCURSALES
  );

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const config = await getConfig() as any;
      if (config) {
        setEmpresa({
          nombreEmpresa: config.nombreEmpresa || '',
          horario: config.horario || '',
          instagram: config.instagram || '',
        });
        if (config.sucursales) {
          setSucursales({ ...DEFAULT_SUCURSALES, ...config.sucursales });
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
    setLoading(false);
  }

  function updateSucursal(key: string, field: keyof SucursalData, value: string) {
    setSucursales(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    try {
      await updateConfig({ ...empresa, sucursales });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <Settings className="w-4 h-4" /> Configuración
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Configuración del Sitio</h1>
          <p className="text-gray-400 mt-2 text-lg">Los cambios se reflejan automáticamente en todo el sitio.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="group inline-flex items-center justify-center gap-2 bg-primary text-[#0a0a0a] px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-[#FFC107] hover:shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all disabled:opacity-50 text-sm shrink-0"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
          {saving ? 'Guardando...' : success ? '¡Guardado!' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-[#151618] border border-[#1a1a1a] rounded-2xl p-1.5 flex gap-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-[#0a0a0a] shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Empresa ── */}
      {activeTab === 'empresa' && (
        <div className="bg-[#151618] border border-[#222] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Datos Generales</h2>
              <p className="text-gray-500 text-sm">Información base de la empresa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={empresa.nombreEmpresa}
                onChange={e => setEmpresa({ ...empresa, nombreEmpresa: e.target.value })}
                className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                placeholder="Machina Maquinaria Pesada"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4 inline mr-1" /> Horario de Atención
              </label>
              <input
                type="text"
                value={empresa.horario}
                onChange={e => setEmpresa({ ...empresa, horario: e.target.value })}
                className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                placeholder="Lun-Vie: 08:00 - 18:00, Sab: 09:00 - 14:00"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <Instagram className="w-4 h-4 inline mr-1" /> Instagram (URL)
              </label>
              <input
                type="url"
                value={empresa.instagram}
                onChange={e => setEmpresa({ ...empresa, instagram: e.target.value })}
                className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                placeholder="https://instagram.com/machina"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Sucursales ── */}
      {activeTab === 'sucursales' && (
        <div className="space-y-4">
          <div className="bg-[#151618] border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary shrink-0" />
            <p className="text-gray-400 text-sm">
              Los datos que edites aquí se actualizarán automáticamente en las páginas{' '}
              <span className="text-white font-bold">Nosotros</span> y{' '}
              <span className="text-white font-bold">Contacto</span> del sitio.
            </p>
          </div>

          {/* Ciudad selector */}
          <div className="bg-[#151618] border border-[#1a1a1a] rounded-2xl p-1.5 flex gap-1 w-full overflow-x-auto">
            {CIUDAD_KEYS.map(key => (
              <button
                key={key}
                onClick={() => setActiveCiudad(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center ${
                  activeCiudad === key
                    ? 'bg-primary text-[#0a0a0a] shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {CIUDAD_LABELS[key]}
              </button>
            ))}
          </div>

          {/* Active city form */}
          {CIUDAD_KEYS.map(key => activeCiudad === key && (
            <div key={key} className="bg-[#151618] border border-[#222] rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Sucursal {CIUDAD_LABELS[key]}</h2>
                  <p className="text-gray-500 text-sm">Datos de contacto y ubicación</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <Phone className="w-4 h-4 inline mr-1" /> Teléfono (Display)
                  </label>
                  <input
                    type="text"
                    value={sucursales[key]?.telefono || ''}
                    onChange={e => updateSucursal(key, 'telefono', e.target.value)}
                    className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                    placeholder="+52 55 1234 5678"
                  />
                  <p className="text-gray-600 text-xs mt-1.5">Número que se muestra en pantalla</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <Smartphone className="w-4 h-4 inline mr-1" /> WhatsApp (Solo números)
                  </label>
                  <input
                    type="text"
                    value={sucursales[key]?.whatsapp || ''}
                    onChange={e => updateSucursal(key, 'whatsapp', e.target.value)}
                    className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600 font-mono"
                    placeholder="525512345678"
                  />
                  <p className="text-gray-600 text-xs mt-1.5">Formato: 52 + Lada + Número (sin espacios ni +)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <Mail className="w-4 h-4 inline mr-1" /> Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={sucursales[key]?.email || ''}
                    onChange={e => updateSucursal(key, 'email', e.target.value)}
                    className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                    placeholder="sucursal@machina.mx"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <Facebook className="w-4 h-4 inline mr-1" /> Facebook / Messenger (URL)
                  </label>
                  <input
                    type="url"
                    value={sucursales[key]?.facebook || ''}
                    onChange={e => updateSucursal(key, 'facebook', e.target.value)}
                    className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                    placeholder="https://m.me/MachinaOficial"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" /> Dirección (Texto que se muestra)
                  </label>
                  <input
                    type="text"
                    value={sucursales[key]?.direccion || ''}
                    onChange={e => updateSucursal(key, 'direccion', e.target.value)}
                    className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                    placeholder="Av. Principal #123, Ciudad"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <Globe className="w-4 h-4 inline mr-1" /> Query del Mapa (Google Maps)
                  </label>
                  <input
                    type="text"
                    value={sucursales[key]?.mapQuery || ''}
                    onChange={e => updateSucursal(key, 'mapQuery', e.target.value)}
                    className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                    placeholder="Tracsa Caterpillar Ciudad de Mexico"
                  />
                  <p className="text-gray-600 text-xs mt-1.5">Término de búsqueda que se usa para localizar la sucursal en el mapa embebido de la página Nosotros</p>
                </div>
              </div>

              {/* Preview card */}
              <div className="border-t border-[#222] pt-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Vista Previa en el Sitio</p>
                <div className="bg-[#0F1012] border border-[#333] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">📞 Teléfono</p>
                    <p className="text-white font-mono">{sucursales[key]?.telefono || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">✉️ Email</p>
                    <p className="text-white font-mono break-all">{sucursales[key]?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">📍 Dirección</p>
                    <p className="text-white">{sucursales[key]?.direccion || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}