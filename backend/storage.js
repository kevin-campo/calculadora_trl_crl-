import imageCompression from "browser-image-compression";

/**
 * Configuración de compresión de imágenes para base64
 */
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.2, // Máximo 200KB para base64
  maxWidthOrHeight: 300, // Máximo 300px para perfil
  useWebWorker: true,
  initialQuality: 0.7, // 70% de calidad para mantener tamaño bajo
};

/**
 * Convertir archivo a base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Comprimir y convertir imagen a base64
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} Base64 de la imagen comprimida
 */
export const compressToBase64 = async (file) => {
  try {
    console.log("� Comprimiendo imagen para base64...");
    console.log("📁 Archivo original:", file.name, "Tamaño:", file.size);

    // Solo comprimir imágenes
    if (!file.type.startsWith('image/')) {
      throw new Error("El archivo debe ser una imagen");
    }

    // Comprimir imagen
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    console.log("✅ Imagen comprimida:", file.size, "->", compressedFile.size);

    // Convertir a base64
    const base64 = await fileToBase64(compressedFile);
    console.log("✅ Base64 generado, longitud:", base64.length);

    // Verificar tamaño del base64 (aprox 33% más grande que el archivo)
    const base64SizeKB = Math.round((base64.length * 0.75) / 1024);
    console.log("📊 Tamaño estimado del base64:", base64SizeKB, "KB");

    if (base64SizeKB > 500) {
      console.warn("⚠️  El base64 es grande, podría causar problemas en Firestore");
    }

    return base64;
  } catch (error) {
    console.error("❌ Error al comprimir a base64:", error);
    throw error;
  }
};

/**
 * Subir foto de perfil como base64
 * @param {File} file - Archivo de foto
 * @param {string} userId - ID del usuario (no usado en base64 pero mantenido por compatibilidad)
 * @returns {Promise<string>} Base64 de la foto
 */
export const uploadProfilePhoto = async (file, userId) => {
  console.log("📸 Iniciando subida de foto de perfil (base64)...");
  console.log("📁 Archivo:", file.name, "Tamaño:", file.size, "Tipo:", file.type);
  console.log("👤 UserID:", userId);

  if (!file) {
    throw new Error("No se proporcionó ningún archivo");
  }

  if (!userId) {
    throw new Error("No se proporcionó el ID del usuario");
  }

  const base64 = await compressToBase64(file);
  return base64;
};

/**
 * Eliminar imagen de Firebase Storage
 * @param {string} url - URL completa de la imagen
 */
export const deleteImage = async (url) => {
  try {
    if (!storage) {
      throw new Error("Firebase Storage no está inicializado");
    }

    // Extraer el path de la URL
    const path = extractPathFromURL(url);
    if (!path) {
      throw new Error("No se pudo extraer el path de la URL");
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log("Imagen eliminada:", path);
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    throw error;
  }
};

/**
 * Extraer path de URL de Firebase Storage
 */
const extractPathFromURL = (url) => {
  try {
    // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token=...
    const match = url.match(/\/o\/([^?]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch (error) {
    console.error("Error al extraer path:", error);
    return null;
  }
};

/**
 * Obtener URL pública de una imagen (si ya está en Storage)
 */
export const getImageURL = async (path) => {
  try {
    if (!storage) {
      throw new Error("Firebase Storage no está inicializado");
    }

    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error al obtener URL:", error);
    throw error;
  }
};
