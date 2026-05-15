'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Shield, ShieldOff, Loader2, UserPlus, Mail, Trash2, AlertCircle, Phone, Crown } from 'lucide-react';
import { getAllUsers, updateUserRole, deleteUser } from '@/lib/firestore';

interface UserProfile {
  id: string;
  userId: string;
  nombre: string;
  email: string;
  telefono?: string;
  role: string;
  createdAt?: any;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'todos' | 'admin' | 'usuario'>('todos');
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: UserProfile | null }>({ show: false, user: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getAllUsers();
      setUsers(data as UserProfile[]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  }

  async function toggleRole(user: UserProfile) {
    const newRole = user.role === 'admin' ? 'usuario' : 'admin';
    setUpdating(user.id);
    try {
      await updateUserRole(user.userId, newRole);
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
    }
    setUpdating(null);
  }

  async function handleDelete() {
    if (!deleteModal.user) return;
    setDeleting(true);
    try {
      await deleteUser(deleteModal.user.userId);
      setUsers(users.filter(u => u.id !== deleteModal.user!.id));
      setDeleteModal({ show: false, user: null });
    } catch (error) {
      console.error('Error deleting user:', error);
    }
    setDeleting(false);
  }

  function formatDate(createdAt: any) {
    if (!createdAt) return 'Sin fecha';
    const date = createdAt?.toDate?.() ?? new Date(createdAt);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role !== 'admin').length;

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filterRole === 'todos' ||
      (filterRole === 'admin' && user.role === 'admin') ||
      (filterRole === 'usuario' && user.role !== 'admin');
    return matchesSearch && matchesRole;
  });

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
            <Users className="w-4 h-4" /> Usuarios
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Gestión de Usuarios</h1>
          <p className="text-gray-400 mt-2 text-lg">Administra los roles y accesos de los usuarios registrados.</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#151618] border border-[#222] px-5 py-3 rounded-xl font-bold text-white shadow-sm shrink-0">
          <Users className="w-4 h-4 text-primary" />
          <span>{users.length} registrado{users.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#151618] border border-[#222] rounded-2xl p-5">
          <p className="text-3xl font-black text-white">{users.length}</p>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">Total</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
          <p className="text-3xl font-black text-primary">{adminCount}</p>
          <p className="text-primary/60 text-xs font-bold uppercase tracking-wider mt-1">Admins</p>
        </div>
        <div className="bg-[#151618] border border-[#222] rounded-2xl p-5">
          <p className="text-3xl font-black text-gray-300">{userCount}</p>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">Usuarios</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#151618] border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
          <UserPlus className="w-4 h-4 text-primary" />
        </div>
        <p className="text-gray-400 text-sm">
          Los usuarios se crean automáticamente al registrarse. Aquí puedes cambiar su rol a{' '}
          <span className="text-primary font-bold">Admin</span> para otorgarles acceso al panel de administración.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-[#151618] border border-[#1a1a1a] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F1012] border border-[#222] text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
          />
        </div>
        <div className="flex gap-1.5 shrink-0">
          {(['todos', 'admin', 'usuario'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filterRole === r
                  ? 'bg-primary text-[#0a0a0a]'
                  : 'bg-[#0F1012] border border-[#222] text-gray-400 hover:text-white'
              }`}
            >
              {r === 'todos' ? 'Todos' : r === 'admin' ? 'Admins' : 'Usuarios'}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-[#0F1012] border border-[#1a1a1a] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-[#151618] border border-[#222] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const isAdmin = user.role === 'admin';
            const isUpdating = updating === user.id;

            return (
              <div
                key={user.id}
                className={`rounded-2xl border overflow-hidden transition-all shadow-lg ${
                  isAdmin
                    ? 'bg-primary/5 border-primary/25'
                    : 'bg-[#0F1012] border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg relative ${
                      isAdmin ? 'bg-primary/20 text-primary' : 'bg-[#1a1a1a] text-gray-400'
                    }`}>
                      {user.nombre?.charAt(0).toUpperCase() || 'U'}
                      {isAdmin && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Crown className="w-2.5 h-2.5 text-[#0a0a0a]" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-white font-bold">{user.nombre || 'Sin nombre'}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isAdmin
                            ? 'bg-primary/15 text-primary border-primary/30'
                            : 'bg-[#1a1a1a] text-gray-500 border-[#333]'
                        }`}>
                          {isAdmin ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                          {isAdmin ? 'Admin' : 'Usuario'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                          <Mail className="w-3.5 h-3.5" /> {user.email}
                        </span>
                        {user.telefono && (
                          <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                            <Phone className="w-3.5 h-3.5" /> {user.telefono}
                          </span>
                        )}
                      </div>
                      {user.createdAt && (
                        <p className="text-gray-600 text-xs mt-1.5">Registrado el {formatDate(user.createdAt)}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleRole(user)}
                      disabled={isUpdating}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all disabled:opacity-50 ${
                        isAdmin
                          ? 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                          : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-[#0a0a0a]'
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isAdmin ? (
                        <><ShieldOff className="w-4 h-4" /> Quitar Admin</>
                      ) : (
                        <><Shield className="w-4 h-4" /> Hacer Admin</>
                      )}
                    </button>

                    <button
                      onClick={() => setDeleteModal({ show: true, user })}
                      className="p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
                <h3 className="text-white font-bold text-lg tracking-tight">Eliminar Usuario</h3>
                <p className="text-gray-500 text-sm">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="bg-[#151618] rounded-xl p-4 mb-6 border border-[#222]">
              <p className="text-gray-400 text-sm mb-1">Se eliminará el siguiente usuario:</p>
              <p className="text-white font-bold">{deleteModal.user?.nombre}</p>
              <p className="text-gray-500 text-sm">{deleteModal.user?.email}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, user: null })}
                className="flex-1 px-4 py-3 rounded-xl border border-[#333] text-gray-400 font-medium hover:bg-[#1a1a1a] hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Eliminación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}