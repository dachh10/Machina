'use client';

import { useState, useEffect } from 'react';
import {
  Mail, Search, Check, Trash2, Clock, Loader2, AlertCircle,
  ChevronDown, ChevronUp, MessageCircle, Facebook, MapPin,
  Phone, Tag, ExternalLink, Inbox
} from 'lucide-react';
import { getContactMessages, markMessageAsRead, deleteContactMessage } from '@/lib/firestore';

interface Message {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
  sucursal?: string;
  canal?: string;
  tipoServicio?: string;
  fecha: { toDate: () => Date } | null;
  leido: boolean;
}

const CANAL_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  whatsapp: {
    label: 'WhatsApp',
    icon: <MessageCircle className="w-3.5 h-3.5" />,
    color: 'text-[#25D366]',
    bg: 'bg-[#25D366]/10',
    border: 'border-[#25D366]/30',
  },
  email: {
    label: 'Correo',
    icon: <Mail className="w-3.5 h-3.5" />,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
  },
  facebook: {
    label: 'Messenger',
    icon: <Facebook className="w-3.5 h-3.5" />,
    color: 'text-[#1877F2]',
    bg: 'bg-[#1877F2]/10',
    border: 'border-[#1877F2]/30',
  },
};

const CIUDADES = ['Todas', 'Ciudad de México', 'Monterrey', 'Guadalajara', 'Querétaro'];
const CANALES = ['Todos', 'whatsapp', 'email', 'facebook'];

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'nuevos' | 'leidos'>('todos');
  const [filterCity, setFilterCity] = useState('Todas');
  const [filterCanal, setFilterCanal] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; message: Message | null }>({ show: false, message: null });

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      const data = await getContactMessages();
      setMessages(data as Message[]);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
    setLoading(false);
  }

  async function handleMarkAsRead(messageId: string) {
    try {
      await markMessageAsRead(messageId);
      setMessages(messages.map(m => m.id === messageId ? { ...m, leido: true } : m));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  async function handleDelete() {
    if (!deleteModal.message) return;
    try {
      await deleteContactMessage(deleteModal.message.id);
      setMessages(messages.filter(m => m.id !== deleteModal.message!.id));
      setDeleteModal({ show: false, message: null });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  function formatDate(fecha: Message['fecha']) {
    if (!fecha) return 'Sin fecha';
    return fecha.toDate().toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function getDirectActionButton(message: Message) {
    const canal = message.canal?.toLowerCase();
    if (canal === 'whatsapp' && message.telefono) {
      const num = message.telefono.replace(/\D/g, '');
      return (
        <a
          href={`https://wa.me/52${num}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all text-sm font-bold"
        >
          <MessageCircle className="w-4 h-4" /> Chatear por WhatsApp
        </a>
      );
    }
    if (canal === 'email' && message.email) {
      return (
        <a
          href={`mailto:${message.email}?subject=Re: Solicitud Machina - ${message.tipoServicio || ''}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-sm font-bold"
        >
          <Mail className="w-4 h-4" /> Responder por Correo
        </a>
      );
    }
    return null;
  }

  const filteredMessages = messages.filter(m => {
    const matchesStatus = filter === 'todos' || (filter === 'nuevos' && !m.leido) || (filter === 'leidos' && m.leido);
    const matchesCity = filterCity === 'Todas' || m.sucursal === filterCity;
    const matchesCanal = filterCanal === 'Todos' || m.canal?.toLowerCase() === filterCanal;
    const matchesSearch =
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mensaje.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCity && matchesCanal && matchesSearch;
  });

  const newCount = messages.filter(m => !m.leido).length;

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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <Inbox className="w-4 h-4" /> Bandeja de Entrada
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Mensajes de Clientes</h1>
          <p className="text-gray-400 mt-2 text-lg">Revisa y responde las solicitudes de tus clientes.</p>
        </div>
        {newCount > 0 && (
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-5 py-3 rounded-xl font-bold shadow-lg shrink-0">
            <Clock className="w-5 h-5" />
            <span>{newCount} nuevo{newCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-[#151618] border border-[#1a1a1a] rounded-2xl p-4 space-y-4 shadow-sm">
        {/* Search Row */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F1012] border border-[#222] text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3">
          {/* Estado */}
          <div className="flex gap-1.5">
            {(['todos', 'nuevos', 'leidos'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === f
                    ? 'bg-primary text-[#0a0a0a]'
                    : 'bg-[#0F1012] border border-[#222] text-gray-400 hover:text-white hover:border-[#333]'
                }`}
              >
                {f === 'todos' ? 'Todos' : f === 'nuevos' ? 'Nuevos' : 'Leídos'}
              </button>
            ))}
          </div>

          <div className="h-auto border-l border-[#333] hidden sm:block" />

          {/* Sucursal */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5 pointer-events-none" />
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="appearance-none bg-[#0F1012] border border-[#222] text-gray-300 pl-8 pr-8 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-primary/50 transition-all"
            >
              {CIUDADES.map(c => <option key={c} value={c}>{c === 'Todas' ? 'Todas las Sucursales' : c}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
          </div>

          {/* Canal */}
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5 pointer-events-none" />
            <select
              value={filterCanal}
              onChange={(e) => setFilterCanal(e.target.value)}
              className="appearance-none bg-[#0F1012] border border-[#222] text-gray-300 pl-8 pr-8 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-primary/50 transition-all"
            >
              {CANALES.map(c => <option key={c} value={c}>{c === 'Todos' ? 'Todos los Canales' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: messages.length, color: 'text-white', bg: 'bg-[#151618]' },
          { label: 'Sin leer', value: newCount, color: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
          { label: 'Leídos', value: messages.length - newCount, color: 'text-emerald-500', bg: 'bg-emerald-500/5 border-emerald-500/20' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-[#222] rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-[#0F1012] border border-[#1a1a1a] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-[#151618] border border-[#222] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No se encontraron mensajes</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((message) => {
            const canalConf = CANAL_CONFIG[message.canal?.toLowerCase() || ''];
            const isExpanded = expandedMessage === message.id;

            return (
              <div
                key={message.id}
                className={`bg-[#0F1012] border rounded-2xl overflow-hidden transition-all shadow-lg ${
                  message.leido ? 'border-[#1a1a1a]' : 'border-primary/40 shadow-primary/5'
                }`}
              >
                {/* Message Header (clickable) */}
                <div
                  className="p-5 cursor-pointer hover:bg-[#151618] transition-colors"
                  onClick={() => {
                    setExpandedMessage(isExpanded ? null : message.id);
                    if (!message.leido) handleMarkAsRead(message.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-black text-lg ${
                        message.leido ? 'bg-[#1a1a1a] text-gray-500' : 'bg-primary/20 text-primary'
                      }`}>
                        {message.nombre.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`font-bold ${message.leido ? 'text-gray-300' : 'text-white'}`}>
                            {message.nombre}
                          </span>
                          {!message.leido && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}

                          {/* Canal Badge */}
                          {canalConf && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${canalConf.color} ${canalConf.bg} ${canalConf.border}`}>
                              {canalConf.icon} {canalConf.label}
                            </span>
                          )}

                          {/* Sucursal Badge */}
                          {message.sucursal && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1a1a1a] text-gray-400 border border-[#333]">
                              <MapPin className="w-3 h-3" /> {message.sucursal}
                            </span>
                          )}

                          {/* Tipo Servicio Badge */}
                          {message.tipoServicio && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Tag className="w-3 h-3" /> {message.tipoServicio}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm truncate">{message.email}</p>
                        <p className="text-gray-500 text-sm mt-1.5 line-clamp-1">{message.mensaje}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-gray-600 text-xs hidden sm:block">{formatDate(message.fecha)}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-[#1a1a1a] bg-[#0a0a0a] p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                        <p className="text-white font-mono text-sm">{message.email}</p>
                      </div>
                      {message.telefono && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Teléfono</p>
                          <p className="text-white font-mono text-sm">{message.telefono}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha</p>
                        <p className="text-gray-300 text-sm">{formatDate(message.fecha)}</p>
                      </div>
                    </div>

                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mensaje del Cliente</p>
                      <div className="bg-[#151618] border border-[#222] rounded-xl p-4">
                        <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{message.mensaje}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {getDirectActionButton(message)}

                      {!message.leido && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkAsRead(message.id); }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] text-gray-300 border border-[#333] hover:bg-[#222] hover:text-white transition-all text-sm font-medium"
                        >
                          <Check className="w-4 h-4" /> Marcar como leído
                        </button>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteModal({ show: true, message }); }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium ml-auto"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-[#0F1012] border border-[#1a1a1a] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg tracking-tight">Eliminar Mensaje</h3>
                <p className="text-gray-500 text-sm">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="bg-[#151618] rounded-xl p-4 mb-6 border border-[#222]">
              <p className="text-gray-400 text-sm mb-1">Se eliminará el mensaje de:</p>
              <p className="text-white font-bold">{deleteModal.message?.nombre}</p>
              <p className="text-gray-500 text-sm">{deleteModal.message?.email}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, message: null })}
                className="flex-1 px-4 py-3 rounded-xl border border-[#333] text-gray-400 font-medium hover:bg-[#1a1a1a] hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all flex justify-center items-center"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}