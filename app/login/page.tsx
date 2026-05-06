'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hammer, ArrowRight, Lock, User, Eye, EyeOff, Loader2, Wrench, Truck, Package } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firestore';


export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Solo cargar email si el usuario tiene la preferencia activada
    const rememberPreference = localStorage.getItem('machina_remember_pref');
    if (rememberPreference === 'true') {
      const savedEmail = localStorage.getItem('machina_remember');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } else {
      // Si la preferencia es 'false' o no existe, no cargar nada
      setRememberMe(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verificar que el correo esté verificado antes de permitir login
      if (!userCredential.user.emailVerified) {
        setError('Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
        setLoading(false);
        await auth.signOut();
        return;
      }
      
      let userProfile = await getUserProfile(userCredential.user.uid);
      
      // Si no existe perfil, crearlo
      if (!userProfile) {
        const { createUserProfile } = await import('@/lib/firestore');
        // Intentar obtener el nombre desde displayName de Firebase
        const nombreUsuario = userCredential.user.displayName || email.split('@')[0];
        await createUserProfile(userCredential.user.uid, {
          nombre: nombreUsuario,
          email: email,
          role: 'usuario'
        });
        // Volver a obtener el perfil
        userProfile = await getUserProfile(userCredential.user.uid);
      }
      
      const isAdmin = userProfile?.role === 'admin';
      
      // Obtener nombre del perfil de Firestore (prioridad), luego displayName de Firebase, luego email
      const nombreFinal = (userProfile?.nombre && userProfile.nombre.trim()) 
        ? userProfile.nombre 
        : (userCredential.user.displayName || email.split('@')[0]);
      
      // Guardar en localStorage
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        nombre: nombreFinal,
        role: userProfile?.role || 'usuario',
        isAdmin
      };
      
      localStorage.setItem('machina_user', JSON.stringify(userData));
      
      console.log('User saved in localStorage:', userData);
      
      router.push('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      if (errorMessage.includes('invalid-credential') || errorMessage.includes('wrong-password')) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else if (errorMessage.includes('user-not-found')) {
        setError('No existe una cuenta con ese correo.');
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex relative overflow-hidden">
      {/* Fondo con textura de construcción */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <div className="absolute inset-0" style={{ opacity: 0.03, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFC107' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      {/* Elementos flotando - LADO IZQUIERDO */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Imagen de fondo */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("/Fondo2.avif")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center justify-center gap-4 mt-20">
            <div className="w-16 h-16 bg-[#FFC107] rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(255,193,7,0.4)] float-element">
              <Hammer className="w-10 h-10 text-[#0a0a0a] transform -rotate-12" />
            </div>
            <span className="text-white font-black text-5xl tracking-tighter">MACHINA</span>
          </div>

          <div className="text-center">
            <h1 className="text-5xl font-black mb-6 leading-tight">
              PODER ABSOLUTO
              <br />
              <span className="text-[#FFC107]">PARA TU OBRA</span>
            </h1>
            <p className="text-lg text-gray-400 mb-20 max-w-md mx-auto">
              Accede a nuestro portal de clientes y gestiona tu flota de maquinaria pesada.
            </p>

            <div className="grid grid-cols-3 gap-8 justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#FFC107]/10 flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-[#FFC107]" />
                </div>
                <p className="font-bold text-2xl">500+</p>
                <p className="text-xs text-gray-500">Equipos</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#FFC107]/10 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-[#FFC107]" />
                </div>
                <p className="font-bold text-2xl">32</p>
                <p className="text-xs text-gray-500">Estados</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#FFC107]/10 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-[#FFC107]" />
                </div>
                <p className="font-bold text-2xl">24/7</p>
                <p className="text-xs text-gray-500">Soporte</p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm text-center">
            © 2026 Machina. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Elementos flotando en el fondo del formulario */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-20 h-20 border border-[#FFC107]/10 rounded-lg float-element" style={{ animationDelay: '0.3s', transform: 'rotate(15deg)' }} />
          <div className="absolute top-1/4 left-5 w-14 h-14 bg-[#FFC107]/5 rounded-full float-delayed" style={{ animationDelay: '1.2s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 border border-[#FFC107]/10 rounded-full float-slow" style={{ animationDelay: '0.8s' }} />
          <div className="absolute bottom-20 left-10 w-12 h-12 bg-[#FFC107]/5 rounded-lg float-element" style={{ animationDelay: '2s', transform: 'rotate(-10deg)' }} />
        </div>

        <div className="w-full max-w-md relative z-10 slide-up">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#FFC107] rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(255,193,7,0.4)] float-element">
              <Hammer className="w-10 h-10 text-[#0a0a0a] transform -rotate-12" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">BIENVENIDO</h2>
            <p className="text-gray-500">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Correo Electrónico</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] text-white pl-12 pr-4 py-4 rounded-lg focus:outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] transition-all font-mono placeholder:text-gray-700"
                  placeholder="tu@correo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] text-white pl-12 pr-12 py-4 rounded-lg focus:outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] transition-all font-mono placeholder:text-gray-700"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-500 text-sm cursor-pointer hover:text-white">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRememberMe(checked);
                    // Guardar preferencia inmediatamente al cambiar el checkbox
                    if (checked) {
                      localStorage.setItem('machina_remember', email);
                      localStorage.setItem('machina_remember_pref', 'true');
                    } else {
                      localStorage.removeItem('machina_remember');
                      localStorage.setItem('machina_remember_pref', 'false');
                    }
                  }}
                  className="rounded border-[#333] bg-[#111] text-[#FFC107] focus:ring-[#FFC107]" 
                />
                Recordar sesión
              </label>
              <Link href="/forgot-password" className="text-[#FFC107] hover:underline text-sm">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFC107] text-[#0a0a0a] font-bold py-4 rounded-lg hover:bg-[#FFB300] transition-all shadow-[0_4px_14px_rgba(255,193,7,0.2)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  INICIAR SESIÓN <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#222] text-center">
            <p className="text-gray-500">
              ¿Aún no tienes cuenta?{' '}
              <Link href="/register" className="text-white font-bold hover:text-[#FFC107] transition-colors">Crear Cuenta</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}