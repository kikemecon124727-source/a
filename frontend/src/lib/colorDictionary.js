// Diccionario de colores con procesador de tonos inteligente
export const colorDictionary = {
  // Rojos
  'rojo': '#FF0000',
  'rojo oscuro': '#8B0000',
  'rojo claro': '#FF6B6B',
  'carmesí': '#DC143C',
  'escarlata': '#FF2400',
  'coral': '#FF7F50',
  'tomate': '#FF6347',
  'salmon': '#FA8072',
  'vino': '#722F37',
  'burdeos': '#800020',
  'cereza': '#DE3163',
  'frambuesa': '#E30B5D',
  'granate': '#800000',
  'bermellón': '#E34234',
  
  // Rosas
  'rosa': '#FFC0CB',
  'rosa claro': '#FFB6C1',
  'rosa fuerte': '#FF69B4',
  'rosa mexicano': '#E4007C',
  'fucsia': '#FF00FF',
  'magenta': '#FF0090',
  'rosa palo': '#FADADD',
  'rosa pastel': '#FFD1DC',
  'rosa chicle': '#FF66B2',
  'rosa viejo': '#C08081',
  
  // Naranjas
  'naranja': '#FFA500',
  'naranja oscuro': '#FF8C00',
  'naranja claro': '#FFCC99',
  'durazno': '#FFCBA4',
  'melocotón': '#FFDAB9',
  'mandarina': '#FF9966',
  'zanahoria': '#ED9121',
  'calabaza': '#FF7518',
  'terracota': '#E2725B',
  'cobre': '#B87333',
  
  // Amarillos
  'amarillo': '#FFFF00',
  'amarillo oscuro': '#FFD700',
  'amarillo claro': '#FFFFE0',
  'dorado': '#FFD700',
  'oro': '#D4AF37',
  'mostaza': '#FFDB58',
  'limón': '#FFF44F',
  'canario': '#FFEF00',
  'ámbar': '#FFBF00',
  'miel': '#EB9605',
  'crema': '#FFFDD0',
  'vainilla': '#F3E5AB',
  'champagne': '#F7E7CE',
  'marfil': '#FFFFF0',
  
  // Verdes
  'verde': '#008000',
  'verde oscuro': '#006400',
  'verde claro': '#90EE90',
  'verde lima': '#32CD32',
  'verde menta': '#98FF98',
  'verde oliva': '#808000',
  'verde militar': '#4B5320',
  'verde esmeralda': '#50C878',
  'verde jade': '#00A86B',
  'verde bosque': '#228B22',
  'verde pino': '#01796F',
  'verde agua': '#66CDAA',
  'verde manzana': '#8DB600',
  'verde pistache': '#93C572',
  'verde musgo': '#8A9A5B',
  'verde salvia': '#9DC183',
  'aguacate': '#568203',
  'caqui': '#C3B091',
  'teal': '#008080',
  
  // Azules
  'azul': '#0000FF',
  'azul oscuro': '#00008B',
  'azul claro': '#ADD8E6',
  'azul marino': '#000080',
  'azul rey': '#4169E1',
  'azul cielo': '#87CEEB',
  'azul bebé': '#89CFF0',
  'azul celeste': '#B2FFFF',
  'azul turquesa': '#40E0D0',
  'azul cobalto': '#0047AB',
  'azul acero': '#4682B4',
  'azul petróleo': '#006A6A',
  'azul pato': '#007BA7',
  'azul zafiro': '#0F52BA',
  'azul índigo': '#4B0082',
  'azul eléctrico': '#7DF9FF',
  'aqua': '#00FFFF',
  'cian': '#00FFFF',
  'turquesa': '#40E0D0',
  'aguamarina': '#7FFFD4',
  
  // Morados
  'morado': '#800080',
  'morado claro': '#DDA0DD',
  'morado oscuro': '#301934',
  'violeta': '#EE82EE',
  'púrpura': '#9B30FF',
  'lila': '#C8A2C8',
  'lavanda': '#E6E6FA',
  'malva': '#E0B0FF',
  'orquídea': '#DA70D6',
  'ciruela': '#8E4585',
  'berenjena': '#614051',
  'amatista': '#9966CC',
  'uva': '#6F2DA8',
  'índigo': '#4B0082',
  
  // Marrones
  'marrón': '#8B4513',
  'marrón claro': '#D2691E',
  'marrón oscuro': '#5C4033',
  'café': '#6F4E37',
  'chocolate': '#7B3F00',
  'canela': '#D2691E',
  'caramelo': '#FFD59A',
  'castaño': '#954535',
  'avellana': '#8E7618',
  'nuez': '#5D432C',
  'roble': '#806517',
  'madera': '#966F33',
  'bronce': '#CD7F32',
  'siena': '#A0522D',
  'sepia': '#704214',
  'tabaco': '#71553D',
  'ocre': '#CC7722',
  'arena': '#C2B280',
  'beige': '#F5F5DC',
  'tostado': '#D2B48C',
  'tan': '#D2B48C',
  
  // Blancos y Grises
  'blanco': '#FFFFFF',
  'blanco hueso': '#FFFFF0',
  'blanco perla': '#F0EAD6',
  'blanco nieve': '#FFFAFA',
  'gris': '#808080',
  'gris claro': '#D3D3D3',
  'gris oscuro': '#A9A9A9',
  'gris perla': '#C0C0C0',
  'gris plata': '#C0C0C0',
  'plata': '#C0C0C0',
  'gris ceniza': '#B2BEB5',
  'gris pizarra': '#708090',
  'gris marengo': '#4C5866',
  'gris carbón': '#36454F',
  'humo': '#738276',
  'platino': '#E5E4E2',
  
  // Negros
  'negro': '#000000',
  'negro azabache': '#0A0A0A',
  'ébano': '#555D50',
  'carbón': '#36454F',
  'onix': '#353839',
  
  // Multicolores y especiales
  'multicolor': 'linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #8B00FF)',
  'arcoíris': 'linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #8B00FF)',
  'degradado': 'linear-gradient(90deg, #667eea, #764ba2)',
  'transparente': 'transparent',
  'nude': '#E3BC9A',
  'piel': '#FFCBA4',
};

/**
 * Busca colores que coincidan con el término de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 * @returns {string[]} - Lista de nombres de colores que coinciden
 */
export const searchColors = (searchTerm) => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return [];
  
  return Object.keys(colorDictionary).filter(color => 
    color.toLowerCase().includes(term)
  );
};

/**
 * Obtiene el valor hexadecimal de un color por nombre
 * @param {string} colorName - Nombre del color
 * @returns {string|null} - Valor hexadecimal o null si no se encuentra
 */
export const getColorValue = (colorName) => {
  if (!colorName || typeof colorName !== 'string') return null;
  const name = colorName.toLowerCase().trim();
  return colorDictionary[name] || null;
};

/**
 * Obtiene todos los colores disponibles
 * @returns {Object} - Diccionario completo de colores
 */
export const getAllColors = () => colorDictionary;

export default colorDictionary;
