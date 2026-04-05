import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown, MessageCircle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ThemeToggle } from './ThemeToggle';
import { getColorValue } from '../lib/colorDictionary';

const Catalogo = () => {
  const { products, loading, searchProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);
  const productsRef = useRef(null);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Search in real-time for the overlay
  useEffect(() => {
    if (searchTerm.trim()) {
      const results = searchProducts(searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, searchProducts]);

  const handleWhatsApp = () => {
    window.open('https://wa.me/527297441082', '_blank');
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setIsSearchOpen(false);
    document.body.style.overflow = 'hidden';
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'auto';
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

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.url) return image.url;
    if (image.data) return image.data;
    if (typeof image === 'string') return image;
    return null;
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSearchSelect = (product) => {
    openProductModal(product);
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderColorBadge = (color) => {
    let colorName = typeof color === 'string' ? color : (color?.nombre || color?.name || '');
    colorName = colorName.replace(/\s*\d+$/, '').trim();
    const colorHex = typeof color === 'string' ? getColorValue(colorName) : (color?.hex || color?.color || getColorValue(colorName));
    
    if (!colorName) return null;
    
    return (
      <span
        key={colorName}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
      >
        {colorHex && (
          <span
            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-gray-200 dark:border-gray-500 flex-shrink-0"
            style={{ background: colorHex }}
          />
        )}
        <span className="truncate max-w-[50px] sm:max-w-[70px]">{colorName}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F5F0E8] to-[#EDE6DB] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a]">
      
      {/* Elegant Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0f172a]/98 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <h1 
              className="text-base sm:text-lg md:text-xl font-light tracking-[0.15em] text-gray-800 dark:text-white uppercase"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <span className="hidden sm:inline">JESSICAALESUAREZ</span>
              <span className="sm:hidden">JESSICA</span>
            </h1>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search Button */}
              <button
                onClick={openSearch}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              
              <ThemeToggle inline />
            </div>
          </div>
        </div>
      </header>

      {/* Elegant Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#0f172a] animate-fadeIn">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Search Header */}
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="¿Qué estás buscando?"
                className="flex-1 text-lg sm:text-xl bg-transparent text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none"
                autoFocus
              />
              <button
                onClick={closeSearch}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Results */}
            <div className="mt-6 max-h-[70vh] overflow-y-auto">
              {searchTerm.trim() === '' ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Escribe para buscar productos por nombre o color
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No se encontraron productos para "{searchTerm}"
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-wide">
                    {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSearchSelect(product)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {product.imagenes && product.imagenes.length > 0 ? (
                          <img
                            src={getImageUrl(product.imagenes[0])}
                            alt={product.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 dark:text-white truncate group-hover:text-[#C9A96E] transition-colors">
                          {product.nombre}
                        </h4>
                        {product.colores && product.colores.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.colores.slice(0, 3).map(renderColorBadge)}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-14 sm:pt-16">
        <div className="text-center space-y-6 sm:space-y-8 animate-fadeIn">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight tracking-[0.08em] sm:tracking-[0.15em] text-gray-800 dark:text-white uppercase leading-tight">
            <span className="block">JESSICA</span>
            <span className="block">ALESUAREZ</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 tracking-[0.1em] sm:tracking-[0.15em] uppercase text-[10px] sm:text-xs">
            Descubre nuestro catálogo
          </p>
          
          {/* Scroll Down Button */}
          <button
            onClick={scrollToProducts}
            className="mt-6 sm:mt-8 group"
            aria-label="Ver productos"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto border border-[#C9A96E] rounded-full flex items-center justify-center group-hover:bg-[#C9A96E] transition-all duration-300">
              <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#C9A96E] group-hover:text-white transition-colors animate-bounce" />
            </div>
          </button>
        </div>
      </section>

      {/* Products Section */}
      <section ref={productsRef} className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-800 dark:text-white tracking-[0.1em] uppercase mb-4">
              Nuestros Productos
            </h3>
            <div className="w-16 sm:w-24 h-[1px] bg-[#C9A96E] mx-auto"></div>
          </div>

          {/* Products Grid - Elegant Responsive */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                No hay productos disponibles
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => openProductModal(product)}
                  className="group cursor-pointer animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image */}
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-[#1e293b] rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                    {product.imagenes && product.imagenes.length > 0 ? (
                      <img
                        src={getImageUrl(product.imagenes[0])}
                        alt={product.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs sm:text-sm">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white truncate group-hover:text-[#C9A96E] transition-colors duration-300">
                      {product.nombre}
                    </h4>
                    
                    {product.colores && product.colores.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.colores.slice(0, 2).map(renderColorBadge)}
                        {product.colores.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{product.colores.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-[#0f172a]/95 border-t border-gray-100 dark:border-gray-800/50 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm tracking-wide">
            © 2026 JESSICAALESUAREZ
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs italic">
            Gracias por su preferencia ♥
          </p>
        </div>
      </footer>

      {/* Product Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={closeProductModal}
        >
          <div className="min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4">
            <div 
              className="bg-white dark:bg-[#1e293b] w-full sm:max-w-4xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slideIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeProductModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-[#0f172a]/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <div className="flex flex-col sm:flex-row">
                {/* Image Carousel */}
                <div className="relative w-full sm:flex-1 aspect-square sm:aspect-auto sm:min-h-[400px] bg-gray-50 dark:bg-[#0f172a]">
                  {selectedProduct.imagenes && selectedProduct.imagenes.length > 0 ? (
                    <>
                      <img
                        src={getImageUrl(selectedProduct.imagenes[currentImageIndex])}
                        alt={`${selectedProduct.nombre} - ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain"
                      />

                      {selectedProduct.imagenes.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-[#1e293b]/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                          >
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 rotate-90" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-[#1e293b]/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                          >
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 -rotate-90" />
                          </button>

                          {/* Image Indicators */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {selectedProduct.imagenes.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-[#C9A96E] w-5' : 'bg-gray-400/50 w-1.5 hover:bg-gray-400'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-5 sm:p-6 sm:w-72 lg:w-80 flex flex-col">
                  <h2 className="text-lg sm:text-xl font-medium text-gray-800 dark:text-white mb-3">
                    {selectedProduct.nombre}
                  </h2>

                  {selectedProduct.descripcion && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      {selectedProduct.descripcion}
                    </p>
                  )}

                  {selectedProduct.colores && selectedProduct.colores.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Colores</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.colores.map(renderColorBadge)}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleWhatsApp}
                    className="mt-auto w-full py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Floating Button */}
      <button
        onClick={handleWhatsApp}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 hover:scale-110 active:scale-95"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default Catalogo;
