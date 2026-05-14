/**
 * Utilidades de Seguridad
 * Sanitización, validación y protección de datos
 */

/**
 * Sanitiza una cadena de texto para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Eliminar < y >
    .replace(/javascript:/gi, '') // Eliminar javascript: protocol
    .replace(/on\w+=/gi, '') // Eliminar event handlers
    .replace(/data:/gi, '') // Eliminar data: protocol
    .trim();
}

/**
 * Sanitiza un objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
}

/**
 * Valida un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida una URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Valida que un string no sea demasiado largo
 */
export function validateMaxLength(input: string, maxLength: number): boolean {
  return input.length <= maxLength;
}

/**
 * Valida que un string no sea vacío
 */
export function validateNotEmpty(input: string): boolean {
  return input.trim().length > 0;
}

/**
 * Valida que un string sea alfanumérico (letras, números, espacios, puntuación básica)
 */
export function isAlphaNumeric(input: string): boolean {
  return /^[a-zA-Z0-9\s.,!?@#$%^&*()\-_=+[\]{}|;:'"<>/`~]+$/.test(input);
}

/**
 * Escapa HTML para prevenir XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Valida y sanitiza datos de un formulario
 */
export function validateAndSanitizeFormData<T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, { required?: boolean; maxLength?: number; sanitize?: boolean }>
): { valid: boolean; data: T; errors: string[] } {
  const errors: string[] = [];
  const sanitized: any = {};
  
  for (const key in schema) {
    const config = schema[key];
    const value = data[key];
    
    // Validar required
    if (config.required && (value === undefined || value === null || value === '')) {
      errors.push(`${String(key)} es requerido`);
      continue;
    }
    
    // Si no es required y está vacío, saltar
    if (!config.required && (value === undefined || value === null || value === '')) {
      sanitized[key] = value;
      continue;
    }
    
    // Validar maxLength
    if (config.maxLength && typeof value === 'string' && value.length > config.maxLength) {
      errors.push(`${String(key)} excede la longitud máxima de ${config.maxLength}`);
      continue;
    }
    
    // Sanitizar si es string
    if (config.sanitize && typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return {
    valid: errors.length === 0,
    data: sanitized,
    errors
  };
}
