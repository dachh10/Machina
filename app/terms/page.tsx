'use client';

import Link from 'next/link';
import { Hammer, ArrowLeft, Scale, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-dark-950 text-white selection:bg-primary selection:text-dark-900">
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-grid-pattern" />
      
      {/* Navbar Simple */}
      <nav className="relative z-10 border-b border-white/5 bg-dark-950/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Hammer className="w-5 h-5 text-dark-900" />
            </div>
            <span className="font-black tracking-tighter uppercase">MACHINA</span>
          </Link>
          <Link href="/register" className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            Legal & Condiciones
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-6 italic">TÉRMINOS DE <span className="text-primary">SERVICIO</span></h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Bienvenido a Machina. Al utilizar nuestro portal y servicios, usted acepta cumplir con los siguientes términos y condiciones.
          </p>
        </div>

        <div className="space-y-12">
          <section className="bg-dark-900/50 border border-white/5 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Scale className="w-24 h-24 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">01</span>
              Uso del Portal
            </h2>
            <p className="text-gray-400 leading-relaxed">
              El acceso a este portal es para fines informativos y de gestión de rentas de maquinaria pesada. El usuario se compromete a proporcionar información verídica al crear su cuenta y a utilizar el catálogo de manera responsable.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-900/50 border border-white/5 p-8 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-4">Responsabilidades</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Machina no se hace responsable por el mal uso de la maquinaria rentada por parte del usuario. Cada equipo debe ser operado por personal capacitado y bajo las normas de seguridad vigentes.
              </p>
            </div>
            <div className="bg-dark-900/50 border border-white/5 p-8 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-4">Políticas de Renta</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Toda solicitud de renta está sujeta a disponibilidad y aprobación crediticia. Los precios mostrados en el catálogo pueden variar sin previo aviso dependiendo de la ubicación y duración del proyecto.
              </p>
            </div>
          </section>

          <section className="bg-dark-900/50 border border-white/5 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">02</span>
              Propiedad Intelectual
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Todo el contenido visual, logotipos y software de Machina son propiedad intelectual protegida. No se permite la reproducción total o parcial del sitio sin autorización previa.
            </p>
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-primary/80">
                Nota Importante: Machina es un ecosistema educativo. Los términos aquí descritos son representativos para fines de evaluación académica.
              </p>
            </div>
          </section>
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 text-center">
          <p className="text-gray-600 text-sm">
            © 2026 Machina. Operando con fuerza y legalidad.
          </p>
        </footer>
      </main>
    </div>
  );
}
