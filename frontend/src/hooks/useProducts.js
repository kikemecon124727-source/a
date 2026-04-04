import { useState, useEffect, useCallback } from 'react';
import { db, storage } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { compressAndConvertToWebP } from '../lib/imageCompressor';

const PRODUCTS_COLLECTION = 'productos';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subir imagen a Firebase Storage
  const uploadImage = async (file, productId) => {
    try {
      // Comprimir y convertir a WebP
      const compressedFile = await compressAndConvertToWebP(file);
      
      const timestamp = Date.now();
      const fileName = `${productId}_${timestamp}.webp`;
      const storageRef = ref(storage, `productos/${productId}/${fileName}`);
      
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      return { url: downloadURL, path: `productos/${productId}/${fileName}` };
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    }
  };

  // Eliminar imagen de Firebase Storage
  const deleteImage = async (imagePath) => {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    } catch (err) {
      console.error('Error deleting image:', err);
      // No lanzar error si la imagen no existe
    }
  };

  // Crear producto
  const createProduct = async (productData, imageFiles) => {
    try {
      setLoading(true);
      
      // Crear documento primero para obtener ID
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        nombre: productData.nombre,
        descripcion: productData.descripcion || '',
        colores: productData.colores || [],
        imagenes: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Subir imágenes
      const uploadedImages = [];
      for (const file of imageFiles) {
        const imageData = await uploadImage(file, docRef.id);
        uploadedImages.push(imageData);
      }

      // Actualizar documento con las URLs de las imágenes
      await updateDoc(doc(db, PRODUCTS_COLLECTION, docRef.id), {
        imagenes: uploadedImages
      });

      setLoading(false);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Actualizar producto
  const updateProduct = async (productId, productData, newImageFiles = [], imagesToDelete = []) => {
    try {
      setLoading(true);

      // Eliminar imágenes marcadas para borrar
      for (const imagePath of imagesToDelete) {
        await deleteImage(imagePath);
      }

      // Subir nuevas imágenes
      const newUploadedImages = [];
      for (const file of newImageFiles) {
        const imageData = await uploadImage(file, productId);
        newUploadedImages.push(imageData);
      }

      // Filtrar imágenes existentes (quitar las eliminadas)
      const existingImages = productData.imagenes.filter(
        img => !imagesToDelete.includes(img.path)
      );

      // Actualizar documento
      await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
        nombre: productData.nombre,
        descripcion: productData.descripcion || '',
        colores: productData.colores || [],
        imagenes: [...existingImages, ...newUploadedImages],
        updatedAt: serverTimestamp()
      });

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Eliminar producto
  const deleteProduct = async (productId, imagePaths = []) => {
    try {
      setLoading(true);

      // Eliminar todas las imágenes del producto
      for (const imagePath of imagePaths) {
        await deleteImage(imagePath);
      }

      // Eliminar documento
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Buscar productos
  const searchProducts = useCallback((searchTerm) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return products;

    return products.filter(product => {
      const matchName = product.nombre?.toLowerCase().includes(term);
      const matchColors = product.colores?.some(color => 
        color.toLowerCase().includes(term)
      );
      const matchDesc = product.descripcion?.toLowerCase().includes(term);
      return matchName || matchColors || matchDesc;
    });
  }, [products]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
  };
};

export default useProducts;
