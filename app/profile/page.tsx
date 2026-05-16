'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Shield, Save, Loader2, 
  CheckCircle, AlertCircle, ArrowLeft, Hammer 
} from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    role: 'usuario'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      setUser(currentUser);
      
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setFormData({
            nombre: profile.nombre || '',
            email: profile.email || currentUser.email || '',
            telefono: profile.telefono || '',
            role: profile.role || 'usuario'
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    setSuccess(false);
    setError('');

    try {
      await updateUserProfile(user.uid, {
        nombre: formData.nombre,
        telefono: formData.telefono
      });

      // Actualizar localStorage para que el Navbar se sincronice
      const stored = localStorage.getItem('machina_user');
      if (stored) {
        const userData = JSON.parse(stored);
        userData.nombre = formData.nombre;
        userData.telefono = formData.telefono;
        localStorage.setItem('machina_user', JSON.stringify(userData));
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Error al actualizar el perfil. Intenta de nuevo.');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white selection:bg-primary selection:text-dark-900 pb-20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/2 blur-[120px] rounded-full" />
      </div>
      
      {/* Industrial Header */}
      <div className="relative h-64 overflow-hidden border-b border-white/5">
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale opacity-20"
          style={{ backgroundImage: 'url("/Fondo2.avif")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col justify-end pb-8">
          <Link href="/" className="absolute top-8 left-6 inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver
          </Link>
          
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="w-32 h-32 rounded-3xl bg-dark-900 border-4 border-dark-950 flex items-center justify-center relative shadow-2xl group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <User className="w-14 h-14 text-primary relative z-10" />
              <div className="absolute inset-0 border border-white/10 rounded-3xl" />
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">{formData.nombre || 'Operador Machina'}</h1>
                <span className="px-3 py-1 rounded-full bg-primary text-dark-900 text-[10px] font-black uppercase tracking-widest">
                  {formData.role}
                </span>
              </div>
              <p className="text-gray-500 font-mono text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" /> {formData.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Security & Info Badge */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-dark-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Seguridad de Cuenta
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs font-bold text-gray-300 mb-1">Estatus de Verificación</p>
                  <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold uppercase tracking-widest">
                    <CheckCircle className="w-3 h-3" /> Correo Verificado
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs font-bold text-gray-300 mb-1">Última Conexión</p>
                  <p className="text-[10px] text-gray-500 font-mono">
                    {new Date().toLocaleDateString()} — {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <button className="w-full py-4 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all text-gray-400 hover:text-white">
                  Cambiar Contraseña
                </button>
              </div>
            </div>

            <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Hammer className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Estatus de Cuenta</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tu perfil está vinculado al sistema de gestión de activos de Machina. Cualquier cambio en tu identidad será reflejado en tus contratos de renta y facturación.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-8">
            <div className="bg-dark-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">Configuración de Perfil</h2>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>

              <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nombre Completo</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full bg-dark-950 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Teléfono Directo</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="w-full bg-dark-950 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        placeholder="+52 55 0000 0000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center justify-between">
                    Email Institucional
                    <span className="text-[8px] bg-dark-800 text-gray-600 px-2 py-0.5 rounded-full uppercase">No editable</span>
                  </label>
                  <div className="relative group opacity-50">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-dark-950/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col md:flex-row items-center gap-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full md:w-auto min-w-[200px] bg-primary text-dark-900 font-black text-[10px] uppercase tracking-widest py-4 px-8 rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_8px_20px_rgba(255,193,7,0.15)] active:scale-95"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Guardar Cambios
                      </>
                    )}
                  </button>

                  {success && (
                    <div className="flex items-center gap-2 text-green-500 animate-in fade-in slide-in-from-left-4">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">Actualizado</span>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 animate-in fade-in slide-in-from-left-4">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
