'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Eye, Package, Loader2, AlertCircle, ArrowDownUp } from 'lucide-react';
import { getProducts, deleteProduct, getCategories } from '@/lib/firestore';

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  marca?: string;
  modelo?: string;
  disponibilidad?: string;
}

interface Category {
  id: string;
  nombre: string;
  slug: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [sortOrder, setSortOrder] = useState('recientes');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; product: Product | null }>({ show: false, product: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsData as Product[]);
      setCategorias(categoriesData as Category[]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteModal.product) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteModal.product.id);
      setProducts(products.filter(p => p.id !== deleteModal.product!.id));
      setDeleteModal({ show: false, product: null });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
    setDeleting(false);
  }

  const categoryOptions = ['Todas', ...categorias.map(c => c.nombre)];

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = product.nombre.toLowerCase().includes(searchLower) ||
                          product.marca?.toLowerCase().includes(searchLower) ||
                          product.modelo?.toLowerCase().includes(searchLower);
    const matchesCategory = filterCategory === 'Todas' || product.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortOrder === 'precio_asc') return a.precio - b.precio;
    if (sortOrder === 'precio_desc') return b.precio - a.precio;
    if (sortOrder === 'nombre_asc') return a.nombre.localeCompare(b.nombre);
    return 0; // 'recientes' keeps insertion order (from DB)
  });

  const getStatusBadge = (status: string | undefined) => {
    const s = status?.toLowerCase() || 'disponible';
    switch (s) {
      case 'disponible': return { text: 'Disponible', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
      case 'rentado': return { text: 'Rentado', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
      case 'vendido': return { text: 'Vendido', class: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
      case 'no disponible': return { text: 'No Disponible', class: 'bg-red-500/10 text-red-500 border-red-500/20' };
      default: return { text: 'Desconocido', class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    }
  };

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
            <Package className="w-4 h-4" /> Catálogo
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Gestión de Productos</h1>
          <p className="text-gray-400 mt-2 text-lg">Administra tu inventario de maquinaria. Agrega, edita o elimina productos.</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="group inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-primary hover:text-[#0a0a0a] transition-all shadow-lg hover:shadow-primary/20 text-sm"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Nuevo Producto
        </Link>
      </div>

      {/* Control Panel (Unified Filters) */}
      <div className="bg-[#151618] border border-[#1a1a1a] rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, marca o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F1012] border border-[#222] text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-[#0F1012] border border-[#222] text-white pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
            >
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
          </div>

          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-[#0F1012] border border-[#222] text-white pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
            >
              <option value="recientes">Más Recientes</option>
              <option value="nombre_asc">Alfabético (A-Z)</option>
              <option value="precio_desc">Precio (Mayor a Menor)</option>
              <option value="precio_asc">Precio (Menor a Mayor)</option>
            </select>
            <ArrowDownUp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
          </div>
        </div>
      </div>

      {/* Table Data */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#0F1012] border border-[#1a1a1a] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-[#151618] border border-[#222] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No se encontraron productos</h3>
          <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda o categoría.</p>
        </div>
      ) : (
        <div className="bg-[#0F1012] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a] bg-[#151618]">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider p-5">Producto</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider p-5 hidden md:table-cell">Categoría</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider p-5 hidden lg:table-cell">Precio</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider p-5">Estado</th>
                  <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider p-5">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {filteredProducts.map((product) => {
                  const badge = getStatusBadge(product.disponibilidad);
                  return (
                    <tr key={product.id} className="group hover:bg-[#151618] transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-[#0a0a0a] rounded-xl overflow-hidden flex-shrink-0 border border-[#222]">
                            {product.imagen ? (
                              <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-bold group-hover:text-primary transition-colors">{product.nombre}</p>
                            <p className="text-gray-500 text-sm mt-0.5">{product.marca} {product.modelo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 hidden md:table-cell">
                        <span className="text-gray-400 text-sm font-medium">{product.categoria}</span>
                      </td>
                      <td className="p-5 hidden lg:table-cell">
                        <span className="text-white font-mono font-medium">${product.precio?.toLocaleString('es-MX')}</span>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${badge.class}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/catalog/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110"
                            title="Ver en tienda"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/productos/${product.id}`}
                            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all hover:scale-110"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ show: true, product })}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all hover:scale-110"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
                <h3 className="text-white font-bold text-lg tracking-tight">Eliminar Producto</h3>
                <p className="text-gray-500 text-sm">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="bg-[#151618] rounded-xl p-4 mb-6 border border-[#222]">
              <p className="text-gray-400 text-sm mb-1">Se eliminará el siguiente producto:</p>
              <p className="text-white font-bold">{deleteModal.product?.nombre}</p>
              <p className="text-gray-500 text-sm mt-1">{deleteModal.product?.marca} {deleteModal.product?.modelo}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, product: null })}
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