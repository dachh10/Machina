'use client';

import Link from 'next/link';
import { Hammer, ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
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
            Legal & Privacidad
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-6 italic">AVISO DE <span className="text-primary">PRIVACIDAD</span></h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            En Machina, nos tomamos muy en serio la seguridad de tu información. Este documento explica cómo recopilamos, usamos y protegemos tus datos personales.
          </p>
        </div>

        <div className="space-y-12">
          <section className="bg-dark-900/50 border border-white/5 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield className="w-24 h-24 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">01</span>
              Responsable de la Información
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Machina (Proyecto Académico) con presencia y domicilios ficticios en la Ciudad de México, Monterrey, Guadalajara y Querétaro, es el responsable del tratamiento de sus datos personales, los cuales serán utilizados exclusivamente para fines de demostración de este sistema de gestión de maquinaria.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-900/50 border border-white/5 p-8 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-4">Datos Recabados</h2>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">• Nombre completo</li>
                <li className="flex items-center gap-2">• Correo electrónico</li>
                <li className="flex items-center gap-2">• Número telefónico</li>
                <li className="flex items-center gap-2">• Ubicación de sucursal</li>
              </ul>
            </div>
            <div className="bg-dark-900/50 border border-white/5 p-8 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-4">Finalidad</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Utilizamos tus datos para gestionar tu cuenta en el portal, procesar solicitudes de cotización, enviar información sobre servicios de renta y brindarte soporte técnico personalizado.
              </p>
            </div>
          </section>

          <section className="bg-dark-900/50 border border-white/5 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">02</span>
              Derechos ARCO
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición).
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
              Contactar para soporte <FileText className="w-4 h-4" />
            </Link>
          </section>
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 text-center">
          <p className="text-gray-600 text-sm">
            Última actualización: Mayo 2026. Este es un aviso de privacidad para fines académicos.
          </p>
        </footer>
      </main>
    </div>
  );
}
