'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, FolderKanban, Star, Trash2, Upload, MapPin } from 'lucide-react';
import Link from 'next/link';
import { createCategory, updateCategory, getCategoryById } from '@/lib/firestore';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export default function CategoryForm() {
  const router = useRouter();
  const params = useParams();
  const isEditing = params.id && params.id !== 'nueva';
  const categoryId = isEditing ? params.id as string : null;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    descripcion: '',
    imagenDestacada: '',
    destacada: false,
    ubicaciones: ['CDMX', 'Monterrey', 'Guadalajara', 'Querétaro']
  });

  useEffect(() => {
    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  async function loadCategory() {
    setLoading(true);
    try {
      const category = await getCategoryById(categoryId!);
      if (category) {
        setFormData({
          nombre: (category as any).nombre || '',
          slug: (category as any).slug || '',
          descripcion: (category as any).descripcion || '',
          imagenDestacada: (category as any).imagenDestacada || '',
          destacada: (category as any).destacada || false,
          ubicaciones: (category as any).ubicaciones || ((category as any).ubicacion === 'México' ? ['CDMX', 'Monterrey', 'Guadalajara', 'Querétaro'] : [(category as any).ubicacion || 'CDMX'])
        });
      }
    } catch (error) {
      console.error('Error loading category:', error);
    }
    setLoading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, 'categorias');
      setFormData({ ...formData, imagenDestacada: url });
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      alert('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  async function handleUrlUpload(url: string) {
    setFormData(prev => ({ ...prev, imagenDestacada: url }));
    
    console.log("Procesando URL de categoría:", url);
    const isCloudinary = url.includes('cloudinary.com');

    // Intentamos subir si empieza con http y no es de Cloudinary
    // Eliminamos la restricción de extensión (.jpg, .png) porque sitios como Unsplash no las usan en la URL
    if (url.startsWith('http') && !isCloudinary) {
      console.log("Subiendo URL de categoría a Cloudinary...");
      setUploading(true);
      try {
        const cloudinaryUrl = await uploadImageToCloudinary(url, 'categorias');
        console.log("Subida exitosa de categoría:", cloudinaryUrl);
        setFormData(prev => ({ ...prev, imagenDestacada: cloudinaryUrl }));
      } catch (error) {
        console.error('Error uploading URL to Cloudinary:', error);
      } finally {
        setUploading(false);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing && categoryId) {
        await updateCategory(categoryId, formData);
      } else {
        await createCategory(formData);
      }
      router.push('/admin/categorias');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error al guardar la categoría. Intenta de nuevo.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link
            href="/admin/categorias"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-2 text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Categorías
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {isEditing ? 'Actualiza los datos de esta categoría.' : 'Agrega una nueva sección al catálogo.'}
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="group inline-flex items-center justify-center gap-2 bg-primary text-[#0a0a0a] px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-[#FFC107] hover:shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all disabled:opacity-50 text-sm shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card 1: Información Principal */}
          <div className="bg-[#151618] border border-[#222] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-primary" />
              Información Principal
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({
                      ...formData,
                      nombre: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                    })}
                    required
                    className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                    placeholder="Ej: Excavadoras"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Slug (URL) *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600 font-mono text-sm"
                    placeholder="ej: excavadoras"
                  />
                  <p className="text-gray-600 text-xs mt-1.5">Se genera automáticamente. Usado en la URL del catálogo.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={4}
                  className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600 resize-none"
                  placeholder="Describe el tipo de maquinaria que incluye esta categoría..."
                />
              </div>
            </div>
          </div>

          {/* Card 2: Visibilidad */}
          <div className="bg-[#151618] border border-[#222] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Visibilidad
            </h2>
            <div className="bg-[#0F1012] border border-[#222] rounded-xl p-4 flex items-start gap-4">
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  id="destacada"
                  checked={formData.destacada}
                  onChange={(e) => setFormData({ ...formData, destacada: e.target.checked })}
                  className="w-5 h-5 rounded border-[#333] bg-[#111] text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
              </div>
              <div>
                <label htmlFor="destacada" className="text-white font-bold cursor-pointer">
                  Destacar en la página de inicio
                </label>
                <p className="text-gray-500 text-sm mt-1">
                  Las categorías destacadas aparecerán visualmente resaltadas y en las primeras posiciones para los clientes.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Ubicación */}
          <div className="bg-[#151618] border border-[#222] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Ubicación de la Categoría
            </h2>
            <div className="bg-[#0F1012] border border-[#222] rounded-xl p-4">
              <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">
                ¿En qué sucursales se mostrará esta categoría?
              </label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {['CDMX', 'Monterrey', 'Guadalajara', 'Querétaro'].map(loc => (
                  <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.ubicaciones.includes(loc)}
                      onChange={(e) => {
                        const newUbs = e.target.checked 
                          ? [...formData.ubicaciones, loc]
                          : formData.ubicaciones.filter(u => u !== loc);
                        setFormData({ ...formData, ubicaciones: newUbs });
                      }}
                      className="w-5 h-5 rounded border-[#333] bg-[#111] text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{loc}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-4 border-t border-white/5 pt-4">
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, ubicaciones: ['CDMX', 'Monterrey', 'Guadalajara', 'Querétaro'] })}
                  className="text-[10px] font-black uppercase text-primary hover:text-white transition-colors"
                >
                  Seleccionar Todas
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, ubicaciones: [] })}
                  className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors"
                >
                  Limpiar
                </button>
              </div>
              <p className="text-gray-500 text-[10px] mt-4 uppercase tracking-widest italic leading-relaxed">
                * Si marcas todas, la categoría será global. Si marcas solo algunas, será exclusiva de esas ciudades.
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Imagen */}
        <div className="lg:col-span-1">
          <div className="bg-[#151618] border border-[#222] rounded-2xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Imagen Destacada
            </h2>

            <div className="space-y-4">
              {/* Preview Zone */}
              <div className={`relative w-full aspect-video rounded-xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all ${formData.imagenDestacada ? 'border-primary/50 bg-[#0a0a0a]' : 'border-[#333] bg-[#0F1012]'}`}>
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Subiendo...</p>
                  </div>
                ) : formData.imagenDestacada ? (
                  <>
                    <img
                      src={formData.imagenDestacada}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imagenDestacada: '' })}
                        className="bg-red-500/90 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-[#151618] transition-colors">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <div className="text-center p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-bold text-white uppercase tracking-wider">Subir Imagen</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG o WEBP</p>
                    </div>
                  </label>
                )}
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Enlace de la imagen
                </label>
                <input
                  type="text"
                  value={formData.imagenDestacada}
                  onChange={(e) => handleUrlUpload(e.target.value)}
                  className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600 text-sm"
                  placeholder="https://ejemplo.com/foto.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
