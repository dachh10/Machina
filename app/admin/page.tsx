'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, MessageSquare, TrendingUp, ArrowRight, Plus, Clock, LayoutDashboard, Settings, Tags } from 'lucide-react';
import { getProducts, getContactMessages } from '@/lib/firestore';

interface Message {
  id: string;
  nombre: string;
  email: string;
  mensaje: string;
  fecha: { toDate: () => Date } | null;
  leido: boolean;
}

interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
}

interface Stats {
  productos: number;
  mensajes: number;
  mensajesNuevos: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    productos: 0,
    mensajes: 0,
    mensajesNuevos: 0
  });
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [userName, setUserName] = useState<string>('Administrador');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user name from local storage
    const storedUser = localStorage.getItem('machina_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.nombre) {
          // Extraer primer nombre
          setUserName(userData.nombre.split(' ')[0]);
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }

    async function loadStats() {
      try {
        const productos = await getProducts() as Product[];
        const mensajes = await getContactMessages() as Message[];
        
        const unreadMessages = mensajes.filter((m) => !m.leido);
        const mensajesNuevos = unreadMessages.length;
        
        // Ordenar mensajes por fecha descendente
        const sortedMessages = [...mensajes].sort((a, b) => {
          if (!a.fecha || !b.fecha) return 0;
          return b.fecha.toDate().getTime() - a.fecha.toDate().getTime();
        });

        // Tomamos los 3 mas recientes no leidos, si no hay, los 3 mas recientes en general
        const recentMsgs = unreadMessages.length > 0 
          ? unreadMessages.slice(0, 3) 
          : sortedMessages.slice(0, 3);
          
        setRecentMessages(recentMsgs);
        setRecentProducts(productos.slice(-3).reverse()); // Tomar los ultimos 3
        
        setStats({
          productos: productos.length,
          mensajes: mensajes.length,
          mensajesNuevos
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  const statCards = [
    { 
      name: 'Total Productos', 
      value: stats.productos, 
      icon: Package, 
      color: 'bg-primary/10 text-primary border-primary/20',
      href: '/admin/productos'
    },
    { 
      name: 'Mensajes Totales', 
      value: stats.mensajes, 
      icon: MessageSquare, 
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      href: '/admin/mensajes'
    },
    { 
      name: 'Mensajes Nuevos', 
      value: stats.mensajesNuevos, 
      icon: Clock, 
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      href: '/admin/mensajes'
    },
  ];

  const quickActions = [
    { name: 'Nuevo Producto', icon: Plus, href: '/admin/productos/nuevo', color: 'hover:border-primary/50 hover:bg-primary/5 text-gray-300' },
    { name: 'Ver Mensajes', icon: MessageSquare, href: '/admin/mensajes', color: 'hover:border-blue-500/50 hover:bg-blue-500/5 text-gray-300' },
    { name: 'Categorías', icon: Tags, href: '/admin/categorias', color: 'hover:border-purple-500/50 hover:bg-purple-500/5 text-gray-300' },
    { name: 'Configuración', icon: Settings, href: '/admin/configuracion', color: 'hover:border-gray-400/50 hover:bg-gray-400/5 text-gray-300' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 -mt-4 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <LayoutDashboard className="w-4 h-4" /> Panel de Control
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Hola, {userName}</h1>
          <p className="text-gray-400 mt-2 text-lg">Aquí tienes el resumen de tu negocio y solicitudes.</p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Top Row: Stats (3 columns) */}
        {statCards.map((card) => (
          <Link
            key={card.name}
            href={card.href}
            className="group relative overflow-hidden bg-[#0F1012] border border-[#1a1a1a] rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{card.name}</p>
                <p className="text-4xl font-black text-white mt-2 tracking-tight">{card.value}</p>
              </div>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${card.color} transition-transform group-hover:scale-110`}>
                <card.icon className="w-7 h-7" />
              </div>
            </div>
          </Link>
        ))}

        {/* Middle Row Left: Recent Messages (span 2) */}
        <div className="md:col-span-2 bg-[#0F1012] border border-[#1a1a1a] rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Actividad Reciente</h2>
            </div>
            <Link href="/admin/mensajes" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay mensajes recientes</div>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#151618] border border-[#1a1a1a] hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 border border-[#333]">
                    <span className="text-gray-400 font-bold">{msg.nombre.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium truncate">{msg.nombre}</p>
                      {!msg.leido && <span className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                    <p className="text-gray-500 text-sm truncate">{msg.mensaje}</p>
                  </div>
                  <div className="shrink-0 text-xs text-gray-600 font-medium whitespace-nowrap">
                    {msg.fecha ? msg.fecha.toDate().toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : 'Reciente'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle Row Right: Quick Actions (span 1) */}
        <div className="bg-[#0F1012] border border-[#1a1a1a] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Accesos Rápidos</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className={`flex items-center gap-3 p-4 rounded-xl border border-[#1a1a1a] bg-[#151618] transition-all group ${action.color}`}
              >
                <action.icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="font-medium text-sm">{action.name}</span>
                <ArrowRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Row: Recent Products (span 3) */}
        <div className="md:col-span-3 bg-[#0F1012] border border-[#1a1a1a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-white">Últimos Productos Añadidos</h2>
            </div>
            <Link href="/admin/productos" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors">
              Ir al Catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recentProducts.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">No hay productos recientes</div>
            ) : (
              recentProducts.map((prod) => (
                <div key={prod.id} className="group relative bg-[#151618] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="aspect-[4/3] bg-[#111] overflow-hidden">
                    {prod.imagen ? (
                      <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">Sin imagen</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{prod.categoria || 'Sin categoría'}</p>
                    <h3 className="text-white font-medium truncate">{prod.nombre}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}