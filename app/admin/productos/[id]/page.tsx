'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Tag, DollarSign, X, Package, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { createProduct, updateProduct, getProductById, getCategories } from '@/lib/firestore';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

interface Category {
  id: string;
  nombre: string;
  slug: string;
}

export default function ProductForm() {
  const router = useRouter();
  const params = useParams();
  const isEditing = params.id && params.id !== 'nuevo';
  const productId = isEditing ? params.id as string : null;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    imagen: '',
    marca: '',
    modelo: '',
    disponibilidad: 'disponible',
    ubicaciones: ['CDMX', 'Monterrey', 'Guadalajara', 'Querétaro'],
    tipoNegocio: 'renta' as 'renta' | 'venta' | 'ambos'
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategorias(data as Category[]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function loadProduct() {
    setLoading(true);
    try {
      const product = await getProductById(productId!) as any;
      if (product) {
        setFormData({
          nombre: product.nombre || '',
          descripcion: product.descripcion || '',
          precio: product.precio?.toString() || '',
          categoria: product.categoria || '',
          imagen: product.imagen || '',
          marca: product.marca || '',
          modelo: product.modelo || '',
          disponibilidad: product.disponibilidad || 'disponible',
          ubicaciones: product.ubicaciones || (product.ubicacion === 'México' ? ['CDMX', 'Monterrey', 'Guadalajara', 'Querétaro'] : [product.ubicacion || 'CDMX']),
          tipoNegocio: product.tipoNegocio || 'renta'
        });
        if (product.imagen) {
          setPreviewImage(product.imagen);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }
    setLoading(false);
  }

  async function handleImageUrlChange(url: string) {
    setFormData(prev => ({ ...prev, imagen: url }));
    setPreviewImage(url);

    console.log("Procesando URL de producto:", url);
    const isCloudinary = url.includes('cloudinary.com');

    // Intentamos subir si empieza con http y no es de Cloudinary
    // Eliminamos la restricción de extensión (.jpg, .png) porque sitios como Unsplash no las usan en la URL
    if (url.startsWith('http') && !isCloudinary) {
      console.log("Subiendo URL de producto a Cloudinary...");
      setUploading(true);
      try {
        const cloudinaryUrl = await uploadImageToCloudinary(url, 'productos');
        console.log("Subida exitosa de producto:", cloudinaryUrl);
        setFormData(prev => ({ ...prev, imagen: cloudinaryUrl }));
        setPreviewImage(cloudinaryUrl);
      } catch (error) {
        console.error('Error uploading URL to Cloudinary:', error);
      } finally {
        setUploading(false);
      }
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, 'productos');
      setFormData(prev => ({ ...prev, imagen: url }));
      setPreviewImage(url);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      alert('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio) || 0,
        categoria: formData.categoria,
        imagen: formData.imagen || '',
        marca: formData.marca,
        modelo: formData.modelo,
        disponibilidad: formData.disponibilidad,
        ubicaciones: formData.ubicaciones,
        tipoNegocio: formData.tipoNegocio as 'renta' | 'venta' | 'ambos'
      };

      if (isEditing && productId) {
        await updateProduct(productId, productData);
      } else {
        await createProduct(productData);
      }

      router.push('/admin/productos');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto. Intenta de nuevo.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#FFC107] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Fijo con Botón Rápido */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-2 text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {isEditing ? 'Actualiza los detalles técnicos y comerciales.' : 'Agrega nueva maquinaria pesada al inventario.'}
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
        {/* Columna Izquierda (Info + Comercial) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Información Principal */}
          <div className="bg-[#151618] border border-[#222] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Información Principal
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                  placeholder="Ej: Excavadora CAT 320"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                    placeholder="Ej: Caterpillar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600"
                    placeholder="Ej: 320 GC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Descripción Detallada *
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                  rows={5}
                  className="w-full bg-[#0F1012] border border-[#222] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600 resize-none"
                  placeholder="Describe las características técnicas, años de uso, estado del motor, etc."
                />
              </div>
            </div>
          </div>

          {/* Card 2: Comercial y Estado */}
          <div className="bg-[#151618] border border-[#222] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Detalles Comerciales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Precio (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full bg-[#0F1012] border border-[#222] text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-600 font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Disponibilidad
                </label>
                <div className="relative">
                  <select
                    value={formData.disponibilidad}
                    onChange={(e) => setFormData({ ...formData, disponibilidad: e.target.value })}
                    className="w-full appearance-none bg-[#0F1012] border border-[#222] text-white pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="rentado">Rentado</option>
                    <option value="vendido">Vendido</option>
                    <option value="no disponible">No Disponible</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
                </div>
              </div>

              {/* Tipo de Negocio */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Tipo de Negocio *
                </label>
                <div className="flex p-1 bg-[#0F1012] border border-[#222] rounded-xl">
                  {[
                    { id: 'renta', label: 'Sólo Renta' },
                    { id: 'venta', label: 'Sólo Venta' },
                    { id: 'ambos', label: 'Renta y Venta' }
                  ].map((tipo) => (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, tipoNegocio: tipo.id as any })}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                        formData.tipoNegocio === tipo.id
                          ? 'bg-primary text-dark-950 shadow-lg'
                          : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {tipo.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Categoría *
                </label>
                <div className="relative">
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                    className="w-full appearance-none bg-[#0F1012] border border-[#222] text-white pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  >
                    <option value="">
                      {categorias.length > 0 ? 'Selecciona una categoría' : 'Crea categorías primero'}
                    </option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Ubicación / Sucursales *
                </label>
                <div className="grid grid-cols-2 gap-4 bg-[#0F1012] p-4 rounded-xl border border-[#222]">
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
                <div className="mt-2 flex gap-3">
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
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha (Multimedia) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#151618] border border-[#222] rounded-2xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Multimedia
            </h2>
            
            <div className="space-y-4">
              {/* Image Preview Zone */}
              <div className={`relative w-full aspect-square rounded-xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all ${previewImage ? 'border-primary/50 bg-[#0a0a0a]' : 'border-[#333] bg-[#0F1012]'}`}>
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Subiendo...</p>
                  </div>
                ) : previewImage ? (
                  <>
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData({ ...formData, imagen: '' });
                        }}
                        className="bg-red-500/90 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar Imagen
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
                  value={formData.imagen}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
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