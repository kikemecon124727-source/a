import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { ThemeToggle } from './ThemeToggle';
import { compressMultipleImages, createImagePreview, revokeImagePreview } from '../lib/imageCompressor';
import { getColorValue } from '../lib/colorDictionary';
import axios from 'axios';
import { 
  LogOut, Plus, Trash2, Edit2, X, Upload, Search,
  Image as ImageIcon, Loader2, Check, AlertCircle, Sparkles
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const MAX_IMAGES = 10;

const AdminPanel = () => {
  const { logout, user } = useAuth();
  const { products, loading, createProduct, updateProduct, deleteProduct, searchProducts } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    colores: [],
  });
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Color input
  const [colorInput, setColorInput] = useState('');
  const [isDetectingColor, setIsDetectingColor] = useState(false);

  const filteredProducts = searchTerm ? searchProducts(searchTerm) : products;

  // Get image URL - supports both base64 and URL formats
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.url) return image.url;
    if (image.data) return image.data;
    if (typeof image === 'string') return image;
    return null;
  };

  const handleLogout = async () => {
    await logout();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ nombre: '', descripcion: '', colores: [] });
    setNewImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    // Normalizar colores
    const normalizedColors = (product.colores || []).map(color => {
      if (typeof color === 'string') {
        return { nombre: color, hex: getColorValue(color) || '#808080' };
      }
      return {
        nombre: color.nombre || color.name || '',
        hex: color.hex || color.color || '#808080'
      };
    }).filter(c => c.nombre);
    
    setFormData({
      nombre: product.nombre || '',
      descripcion: product.descripcion || '',
      colores: normalizedColors,
    });
    setExistingImages(product.imagenes || []);
    setNewImages([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    imagePreviews.forEach(preview => revokeImagePreview(preview.url));
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ nombre: '', descripcion: '', colores: [] });
    setNewImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setColorInput('');
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    const currentTotal = existingImages.length - imagesToDelete.length + newImages.length;
    const availableSlots = MAX_IMAGES - currentTotal;
    
    if (files.length > availableSlots) {
      alert(`Solo puedes agregar ${availableSlots} imagen(es) más. Máximo ${MAX_IMAGES} por producto.`);
      return;
    }

    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const compressedFiles = await compressMultipleImages(files, (progress) => {
        setCompressionProgress(Math.round(progress));
      });

      const newPreviews = compressedFiles.map((file, index) => ({
        id: `new_${Date.now()}_${index}`,
        url: createImagePreview(file),
        file
      }));

      setNewImages(prev => [...prev, ...compressedFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
    } catch (error) {
      console.error('Error compressing images:', error);
      alert('Error al comprimir las imágenes');
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const removeNewImage = (index) => {
    revokeImagePreview(imagePreviews[index].url);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const markExistingImageForDeletion = (imageIndex) => {
    setImagesToDelete(prev => [...prev, imageIndex]);
  };

  const unmarkImageForDeletion = (imageIndex) => {
    setImagesToDelete(prev => prev.filter(i => i !== imageIndex));
  };

  // Detect color using AI
  const detectColor = async () => {
    if (!colorInput.trim()) return;
    
    setIsDetectingColor(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/detect-color`, {
        text: colorInput.trim()
      });
      
      const { color_name, hex_code } = response.data;
      
      const exists = formData.colores.some(
        c => c.nombre.toLowerCase() === color_name.toLowerCase()
      );
      
      if (!exists) {
        setFormData(prev => ({
          ...prev,
          colores: [...prev.colores, { nombre: color_name, hex: hex_code }]
        }));
      }
      setColorInput('');
    } catch (error) {
      console.error('Error detecting color:', error);
      // Fallback
      const exists = formData.colores.some(
        c => c.nombre.toLowerCase() === colorInput.toLowerCase()
      );
      if (!exists) {
        setFormData(prev => ({
          ...prev,
          colores: [...prev.colores, { nombre: colorInput, hex: getColorValue(colorInput) || '#808080' }]
        }));
      }
      setColorInput('');
    } finally {
      setIsDetectingColor(false);
    }
  };

  const handleColorKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      detectColor();
    }
  };

  const removeColor = (colorName) => {
    setFormData(prev => ({
      ...prev,
      colores: prev.colores.filter(c => c.nombre !== colorName)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre del producto es requerido');
      return;
    }

    const totalImages = existingImages.length - imagesToDelete.length + newImages.length;
    if (totalImages === 0) {
      alert('Debes agregar al menos una imagen');
      return;
    }

    setIsSubmitting(true);

    try {
      const coloresForFirebase = formData.colores.map(c => ({
        nombre: c.nombre,
        hex: c.hex
      }));

      // Filtrar imágenes existentes que no se eliminaron
      const remainingExistingImages = existingImages.filter((_, idx) => !imagesToDelete.includes(idx));

      if (editingProduct) {
        await updateProduct(
          editingProduct.id,
          { ...formData, colores: coloresForFirebase, imagenes: remainingExistingImages },
          newImages,
          [] // Ya filtramos las imágenes arriba
        );
      } else {
        await createProduct({ ...formData, colores: coloresForFirebase }, newImages);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    await deleteProduct(product.id);
    setDeleteConfirm(null);
  };

  const renderColorBadge = (color, removable = false) => {
    const colorName = typeof color === 'string' ? color : (color?.nombre || color?.name || '');
    const colorHex = typeof color === 'string' ? getColorValue(color) : (color?.hex || color?.color || getColorValue(colorName));
    
    if (!colorName) return null;
    
    return (
      <span
        key={colorName}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 transition-all duration-200 hover:scale-105 group"
      >
        {colorHex && (
          <span
            className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-500 shadow-sm"
            style={{ background: colorHex }}
          />
        )}
        {colorName}
        {removable && (
          <button
            type="button"
            onClick={() => removeColor(colorName)}
            className="ml-1 text-gray-400 hover:text-red-500 transition-colors duration-200 hover:scale-125"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE6DB] to-[#E5DED3] dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#0f0f23]">
      <ThemeToggle />

      {/* Header */}
      <header className="bg-white/90 dark:bg-[#1a1a2e]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="animate-fadeIn">
              <h1 className="text-2xl sm:text-3xl font-light tracking-wider text-gray-800 dark:text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                jessicaalesuarez
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Panel de Administración</p>
            </div>

            <div className="flex items-center gap-4 animate-fadeIn">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slideUp">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#252542] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all duration-300"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C9A96E] hover:bg-[#B8986A] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos. ¡Crea el primero!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group bg-white dark:bg-[#252542] rounded-2xl overflow-hidden shadow-md hover:shadow-xl dark:shadow-gray-900/30 transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image */}
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-[#1a1a2e] relative">
                  {product.imagenes && product.imagenes.length > 0 ? (
                    <img
                      src={getImageUrl(product.imagenes[0])}
                      alt={product.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => openEditModal(product)}
                      className="w-10 h-10 bg-white dark:bg-[#252542] rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-[#1a1a2e] transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product)}
                      className="w-10 h-10 bg-white dark:bg-[#252542] rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  {product.imagenes && product.imagenes.length > 1 && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded-full text-white text-xs">
                      {product.imagenes.length} fotos
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                  <h3 className="font-medium text-gray-800 dark:text-white truncate">
                    {product.nombre}
                  </h3>
                  
                  {product.colores && product.colores.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {product.colores.map(color => renderColorBadge(color))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#252542] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-gray-900/50 animate-slideIn">
            <div className="sticky top-0 bg-white dark:bg-[#252542] border-b border-gray-200 dark:border-gray-700/50 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1a2e] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Vestido Floral"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all duration-200"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción <span className="text-gray-400">(opcional)</span>
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el producto..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all duration-200 resize-none"
                />
              </div>

              {/* Colores con IA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Colores disponibles
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#C9A96E]">
                    <Sparkles className="w-3 h-3" /> IA detecta colores
                  </span>
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={handleColorKeyDown}
                    placeholder="Escribe un color (ej: madera, cielo, neón rosa...)"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={detectColor}
                    disabled={isDetectingColor || !colorInput.trim()}
                    className="px-4 py-3 bg-[#C9A96E] hover:bg-[#B8986A] text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                  >
                    {isDetectingColor ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {formData.colores.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.colores.map((color) => renderColorBadge(color, true))}
                  </div>
                )}
              </div>

              {/* Imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imágenes * <span className="text-gray-400">(máx. {MAX_IMAGES})</span>
                </label>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-4">
                    {existingImages.map((image, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          imagesToDelete.includes(idx)
                            ? 'border-red-500 opacity-50'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`Imagen ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => 
                            imagesToDelete.includes(idx)
                              ? unmarkImageForDeletion(idx)
                              : markExistingImageForDeletion(idx)
                          }
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                          {imagesToDelete.includes(idx) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-4">
                    {imagePreviews.map((preview, idx) => (
                      <div
                        key={preview.id}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-green-500 animate-fadeIn"
                      >
                        <img
                          src={preview.url}
                          alt={`Nueva imagen ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded">
                          Nueva
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Compression Progress */}
                {isCompressing && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl animate-fadeIn">
                    <div className="flex items-center gap-3 mb-2">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        Comprimiendo y convirtiendo a WebP... {compressionProgress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${compressionProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {(existingImages.length - imagesToDelete.length + newImages.length) < MAX_IMAGES && (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      disabled={isCompressing}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-[#C9A96E] transition-all duration-300 hover:bg-gray-50 dark:hover:bg-[#1a1a2e]/50 group">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-[#C9A96E] transition-colors duration-200" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                        Haz clic o arrastra imágenes aquí
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Se guardan directamente en Firestore (sin Storage)
                      </p>
                    </div>
                  </label>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  Imágenes: {existingImages.length - imagesToDelete.length + newImages.length} / {MAX_IMAGES}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isCompressing}
                className="w-full py-3 px-4 bg-[#C9A96E] hover:bg-[#B8986A] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#252542] rounded-2xl w-full max-w-md p-6 shadow-2xl dark:shadow-gray-900/50 animate-slideIn">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Eliminar producto
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar <strong>{deleteConfirm.nombre}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1a2e] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
