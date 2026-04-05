import React, { useState, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ThemeToggle } from './ThemeToggle';
import { getColorValue } from '../lib/colorDictionary';

const Catalogo = () => {
  const { products, loading, searchProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCatalog, setShowCatalog] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(searchProducts(searchTerm));
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products, searchProducts]);

  const handleWhatsApp = () => {
    window.open('https://wa.me/527297441082', '_blank');
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProduct && selectedProduct.imagenes) {
      setCurrentImageIndex((prev) => 
        prev === selectedProduct.imagenes.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct && selectedProduct.imagenes) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProduct.imagenes.length - 1 : prev - 1
      );
    }
  };

  // Get image URL - supports both base64 and URL formats
  const getImageUrl = (image) => {
    if (!image) return null;
    // Si es un objeto con url
    if (image.url) return image.url;
    // Si es un objeto con data (base64)
    if (image.data) return image.data;
    // Si es string directo (base64 o url)
    if (typeof image === 'string') return image;
    return null;
  };

  const renderColorBadge = (color) => {
    const colorName = typeof color === 'string' ? color : (color?.nombre || color?.name || '');
    const colorHex = typeof color === 'string' ? getColorValue(color) : (color?.hex || color?.color || getColorValue(colorName));
    
    if (!colorName) return null;
    
    return (
      <span
        key={colorName}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 transition-all duration-200 hover:scale-105"
      >
        {colorHex && (
          <span
            className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-500 shadow-sm"
            style={{ background: colorHex }}
          />
        )}
        {colorName}
      </span>
    );
  };

  // Hero/Landing Page
  if (!showCatalog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F0E8] via-[#EDE6DB] to-[#E5DED3] dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#0f0f23] px-4 relative overflow-hidden">
        <ThemeToggle />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center space-y-8 z-10 animate-fadeIn">
          {/* Main Title - Large and elegant */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight tracking-[0.2em] sm:tracking-[0.3em] text-gray-800 dark:text-white uppercase">
            JESSICAALESUAREZ
          </h1>
          
          {/* Subtitle */}
          <p className="text-gray-500 dark:text-gray-400 tracking-[0.15em] sm:tracking-[0.2em] uppercase text-xs sm:text-sm animate-fadeIn" style={{ animationDelay: '200ms' }}>
            Descubre todo nuestro catálogo
          </p>
          
          {/* CTA Button */}
          <button
            onClick={() => setShowCatalog(true)}
            className="mt-8 px-10 sm:px-14 py-4 sm:py-5 bg-[#C9A96E] hover:bg-[#B8986A] text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 tracking-[0.15em] sm:tracking-wider uppercase text-xs sm:text-sm hover:scale-105 active:scale-95 animate-fadeIn"
            style={{ animationDelay: '400ms' }}
          >
            Explorar Catálogo
          </button>
        </div>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 hover:scale-110 active:scale-95"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      </div>
    );
  }

  // Catalog View
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE6DB] to-[#E5DED3] dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#0f0f23]">
      <ThemeToggle />

      {/* Header with Logo and Search */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1a1a2e]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo - clickable to go back */}
            <button
              onClick={() => setShowCatalog(false)}
              className="text-2xl sm:text-3xl font-light tracking-wider text-gray-800 dark:text-white hover:opacity-70 transition-all duration-300"
              style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
            >
              jessicaalesuarez
            </button>

            {/* Search Bar */}
            <div className="relative w-full sm:w-80 lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por nombre o color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#252542] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos en el catálogo'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                onClick={() => openProductModal(product)}
                className="group bg-white dark:bg-[#252542] rounded-2xl overflow-hidden shadow-md hover:shadow-xl dark:shadow-gray-900/30 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image */}
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-[#1a1a2e]">
                  {product.imagenes && product.imagenes.length > 0 ? (
                    <img
                      src={getImageUrl(product.imagenes[0])}
                      alt={product.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full items-center justify-center text-gray-400 dark:text-gray-600 ${product.imagenes && product.imagenes.length > 0 ? 'hidden' : 'flex'}`}>
                    Sin imagen
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <h3 className="font-medium text-gray-800 dark:text-white truncate group-hover:text-[#C9A96E] transition-colors duration-200">
                    {product.nombre}
                  </h3>
                  
                  {product.colores && product.colores.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {product.colores.map(renderColorBadge)}
                    </div>
                  )}

                  {product.imagenes && product.imagenes.length > 1 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {product.imagenes.length} imágenes
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={closeProductModal}
        >
          <div 
            className="bg-white dark:bg-[#252542] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl dark:shadow-gray-900/50 animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeProductModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 dark:bg-[#1a1a2e]/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-[#252542] transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Image Carousel */}
              <div className="relative flex-1 aspect-square md:aspect-auto md:h-[70vh] bg-gray-100 dark:bg-[#1a1a2e]">
                {selectedProduct.imagenes && selectedProduct.imagenes.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(selectedProduct.imagenes[currentImageIndex])}
                      alt={`${selectedProduct.nombre} - ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain transition-opacity duration-300"
                    />

                    {/* Navigation Arrows */}
                    {selectedProduct.imagenes.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-[#252542]/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-[#252542] transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                          <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-[#252542]/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-[#252542] transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                          <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {selectedProduct.imagenes.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-[#C9A96E] w-6' : 'bg-white/60 w-2.5 hover:bg-white/80'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-6 md:w-80 flex flex-col">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  {selectedProduct.nombre}
                </h2>

                {selectedProduct.descripcion && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedProduct.descripcion}
                  </p>
                )}

                {selectedProduct.colores && selectedProduct.colores.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Colores disponibles:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colores.map(renderColorBadge)}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleWhatsApp}
                  className="mt-auto w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Consultar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsApp}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 hover:scale-110 active:scale-95"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
};

export default Catalogo;
