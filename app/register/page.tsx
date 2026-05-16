'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hammer, ArrowRight, Lock, User, Mail, Phone, Eye, EyeOff, Loader2, CheckCircle, XCircle, Wrench, Truck, Package } from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/lib/firestore';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordRequirements = [
    { met: password.length >= 8, text: 'Al menos 8 caracteres' },
    { met: /[A-Z]/.test(password), text: 'Una letra mayúscula' },
    { met: /[a-z]/.test(password), text: 'Una letra minúscula' },
    { met: /[0-9]/.test(password), text: 'Un número' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const allMet = passwordRequirements.every(req => req.met);
    if (!allMet) {
      setError('La contraseña no cumple los requisitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await updateProfile(userCredential.user, { displayName: name });
      
      await createUserProfile(userCredential.user.uid, {
        nombre: name,
        email: email,
        telefono: phone,
        role: 'usuario'
      });
      
      // IMPORTANTE: Cerrar sesión después del registro para que verifique su correo
      // hasta que no verifique no puede iniciar sesión
      try {
        await auth.signOut();
      } catch (e) {
        // Puede fallar si ya está desconectado, ignorar
      }
      // Forzar limpieza completa
      localStorage.removeItem('machina_user');
      
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cuenta';
      if (errorMessage.includes('email-already-in-use')) {
        setError('Ya existe una cuenta con ese correo.');
      } else if (errorMessage.includes('invalid-email')) {
        setError('El correo electrónico no es válido.');
      } else if (errorMessage.includes('weak-password')) {
        setError('La contraseña es muy débil.');
      } else {
        setError('Error al crear cuenta. Intenta de nuevo.');
      }
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0" style={{ opacity: 0.03, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFC107' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="w-full max-w-md bg-[#111] border border-[#222] p-10 rounded-2xl shadow-2xl text-center relative z-10 slide-up">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#FFC107]/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-[#FFC107]" />
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-white mb-4">¡Cuenta Creada!</h2>
          <p className="text-gray-400 mb-2">Se envió un correo de verificación a</p>
          <p className="text-white font-bold mb-6">{email}</p>
          <p className="text-gray-500 text-sm mb-8">
            Haz clic en el enlace para activar tu cuenta.
          </p>
          
          <Link 
            href="/login" 
            className="block w-full bg-[#FFC107] text-[#0a0a0a] font-bold py-4 rounded-lg hover:bg-[#FFB300] transition-all"
          >
            IR A INICIAR SESIÓN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex relative overflow-hidden">
      {/* Fondo con textura */}
      <div className="absolute inset-0" style={{ opacity: 0.03, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFC107' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      {/* Lado izquierdo - Imagen */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
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
              ÚNETE A
              <br />
              <span className="text-[#FFC107]">NUESTRO EQUIPO</span>
            </h1>
            <p className="text-lg text-gray-400 mb-20 max-w-md mx-auto">
              Crea tu cuenta y accede a precios exclusivos en renta y venta de maquinaria pesada.
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-y-auto">
        {/* Elementos flotando en el fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-20 h-20 border border-[#FFC107]/10 rounded-lg float-element" style={{ animationDelay: '0.3s', transform: 'rotate(15deg)' }} />
          <div className="absolute top-1/4 left-5 w-14 h-14 bg-[#FFC107]/5 rounded-full float-delayed" style={{ animationDelay: '1.2s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 border border-[#FFC107]/10 rounded-full float-slow" style={{ animationDelay: '0.8s' }} />
          <div className="absolute bottom-20 left-10 w-12 h-12 bg-[#FFC107]/5 rounded-lg float-element" style={{ animationDelay: '2s', transform: 'rotate(-10deg)' }} />
        </div>

        <div className="w-full max-w-md relative z-10 slide-up">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#FFC107] rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(255,193,7,0.4)] float-element">
              <Hammer className="w-10 h-10 text-[#0a0a0a] transform -rotate-12" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">CREAR CUENTA</h2>
            <p className="text-gray-500">Regístrate para acceder al portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] text-white pl-12 pr-4 py-4 rounded-lg focus:outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] transition-all font-mono placeholder:text-gray-700"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] text-white pl-12 pr-4 py-4 rounded-lg focus:outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] transition-all font-mono placeholder:text-gray-700"
                  placeholder="juan@empresa.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Teléfono (opcional)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] text-white pl-12 pr-4 py-4 rounded-lg focus:outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] transition-all font-mono placeholder:text-gray-700"
                  placeholder="+52 55 0000 0000"
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
              <div className="mt-2 grid grid-cols-2 gap-2">
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs">
                    {req.met ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-gray-600" />
                    )}
                    <span className={req.met ? 'text-green-500' : 'text-gray-600'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] text-white pl-12 pr-4 py-4 rounded-lg focus:outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] transition-all font-mono placeholder:text-gray-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-500">
              <input 
                type="checkbox" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 rounded border-[#333] bg-[#111] text-[#FFC107] focus:ring-[#FFC107]" 
              />
              <label className="cursor-pointer hover:text-white leading-tight">
                Acepto los <Link href="/terms" className="text-[#FFC107] hover:underline">términos</Link> y <Link href="/privacy" className="text-[#FFC107] hover:underline">privacidad</Link>.
              </label>
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
                  CREAR CUENTA <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#222] text-center">
            <p className="text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-white font-bold hover:text-[#FFC107] transition-colors">Iniciar Sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}