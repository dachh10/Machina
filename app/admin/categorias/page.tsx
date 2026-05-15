'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, Image as ImageIcon, GripVertical, FolderKanban, Star } from 'lucide-react';
import { getCategories, deleteCategory } from '@/lib/firestore';

interface Category {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagenDestacada?: string;
  destacada?: boolean;
  ubicaciones?: string[];
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; category: Category | null }>({ show: false, category: null });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteModal.category) return;
    setSaving(true);
    try {
      await deleteCategory(deleteModal.category.id);
      setCategories(categories.filter(c => c.id !== deleteModal.category!.id));
      setDeleteModal({ show: false, category: null });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
    setSaving(false);
  }

  const filteredCategories = categories.filter(cat =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <FolderKanban className="w-4 h-4" /> Categorías
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Gestión de Categorías</h1>
          <p className="text-gray-400 mt-2 text-lg">Administra las categorías de tu catálogo y sus imágenes destacadas.</p>
        </div>
        <Link
          href="/admin/categorias/nueva"
          className="group inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-primary hover:text-[#0a0a0a] transition-all shadow-lg hover:shadow-primary/20 text-sm"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Nueva Categoría
        </Link>
      </div>

      {/* Control Panel */}
      <div className="bg-[#151618] border border-[#1a1a1a] rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F1012] border border-[#222] text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="bg-[#0F1012] border border-[#1a1a1a] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-[#151618] border border-[#222] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GripVertical className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No se encontraron categorías</h3>
          <p className="text-gray-500">Intenta con otros términos de búsqueda o crea una nueva.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-[#0F1012] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-primary/30 transition-all group shadow-lg"
            >
              <div className="aspect-video bg-[#0a0a0a] relative overflow-hidden">
                {category.imagenDestacada ? (
                  <img
                    src={category.imagenDestacada}
                    alt={category.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-700" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {category.destacada && (
                  <div className="absolute top-3 left-3 bg-[#FFC107] text-[#0a0a0a] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    Destacada
                  </div>
                )}

                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  <Link
                    href={`/admin/categorias/${category.id}`}
                    className="p-2.5 bg-black/80 backdrop-blur-sm text-white rounded-lg hover:bg-primary hover:text-black transition-all shadow-lg hover:scale-110"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteModal({ show: true, category })}
                    className="p-2.5 bg-black/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg hover:scale-110"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-white font-bold text-xl group-hover:text-primary transition-colors">{category.nombre}</h3>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{category.descripcion || 'Sin descripción'}</p>
                <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-mono bg-[#151618] px-2 py-1 rounded-md">/{category.slug}</span>
                </div>
              </div>
            </div>
          ))}
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
                <h3 className="text-white font-bold text-lg tracking-tight">Eliminar Categoría</h3>
                <p className="text-gray-500 text-sm">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <div className="bg-[#151618] rounded-xl p-4 mb-6 border border-[#222]">
              <p className="text-gray-400 text-sm mb-1">Se eliminará la siguiente categoría:</p>
              <p className="text-white font-bold">{deleteModal.category?.nombre}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, category: null })}
                className="flex-1 px-4 py-3 rounded-xl border border-[#333] text-gray-400 font-medium hover:bg-[#1a1a1a] hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Eliminación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}