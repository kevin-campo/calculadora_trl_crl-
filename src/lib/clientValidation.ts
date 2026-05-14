/**
 * Validación en Cliente
 * Validación de datos en el frontend antes de enviar al servidor
 */

/**
 * Valida un email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { valid: false, error: 'El email es requerido' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Email inválido' };
  }
  return { valid: true };
}

/**
 * Valida un campo de texto
 */
export function validateTextField(
  value: string,
  options: { required?: boolean; minLength?: number; maxLength?: number; fieldName?: string }
): { valid: boolean; error?: string } {
  const { required = false, minLength, maxLength, fieldName = 'Campo' } = options;

  if (required && !value.trim()) {
    return { valid: false, error: `${fieldName} es requerido` };
  }

  if (minLength && value.length < minLength) {
    return { valid: false, error: `${fieldName} debe tener al menos ${minLength} caracteres` };
  }

  if (maxLength && value.length > maxLength) {
    return { valid: false, error: `${fieldName} no puede exceder ${maxLength} caracteres` };
  }

  return { valid: true };
}

/**
 * Valida un formulario completo
 */
export function validateForm(
  formData: Record<string, string>,
  schema: Record<string, { required?: boolean; minLength?: number; maxLength?: number; type?: 'email' | 'text' }>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [field, config] of Object.entries(schema)) {
    const value = formData[field] || '';

    if (config.type === 'email') {
      const validation = validateEmail(value);
      if (!validation.valid) {
        errors[field] = validation.error || 'Email inválido';
      }
    } else {
      const validation = validateTextField(value, {
        required: config.required,
        minLength: config.minLength,
        maxLength: config.maxLength,
        fieldName: field
      });
      if (!validation.valid) {
        errors[field] = validation.error || 'Campo inválido';
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valida que una URL sea segura
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url) {
    return { valid: false, error: 'La URL es requerida' };
  }

  try {
    const urlObj = new URL(url);
    
    // Solo permitir http y https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { valid: false, error: 'Solo se permiten URLs http y https' };
    }

    // Prevenir javascript: protocol
    if (url.toLowerCase().startsWith('javascript:')) {
      return { valid: false, error: 'Protocolo no permitido' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'URL inválida' };
  }
}

/**
 * Sanitiza input en el cliente
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Valida que un número esté en un rango
 */
export function validateNumber(
  value: number,
  options: { min?: number; max?: number; required?: boolean; fieldName?: string }
): { valid: boolean; error?: string } {
  const { min, max, required = false, fieldName = 'Valor' } = options;

  if (required && (value === null || value === undefined || isNaN(value))) {
    return { valid: false, error: `${fieldName} es requerido` };
  }

  if (min !== undefined && value < min) {
    return { valid: false, error: `${fieldName} debe ser al menos ${min}` };
  }

  if (max !== undefined && value > max) {
    return { valid: false, error: `${fieldName} no puede exceder ${max}` };
  }

  return { valid: true };
}

/**
 * Valida un archivo
 */
export function validateFile(
  file: File,
  options: { maxSizeMB?: number; allowedTypes?: string[]; fieldName?: string }
): { valid: boolean; error?: string } {
  const { maxSizeMB = 5, allowedTypes, fieldName = 'Archivo' } = options;

  if (!file) {
    return { valid: false, error: `${fieldName} es requerido` };
  }

  // Validar tamaño
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `${fieldName} no puede exceder ${maxSizeMB}MB` };
  }

  // Validar tipo
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `Tipo de archivo no permitido` };
  }

  return { valid: true };
}

/**
 * Valida que una contraseña sea fuerte
 */
export function validatePassword(password: string): { valid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } {
  if (!password) {
    return { valid: false, error: 'La contraseña es requerida', strength: 'weak' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres', strength: 'weak' };
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaMet = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (criteriaMet >= 4) {
    strength = 'strong';
  } else if (criteriaMet >= 3) {
    strength = 'medium';
  }

  if (criteriaMet < 2) {
    return { valid: false, error: 'La contraseña debe incluir letras, números y caracteres especiales', strength };
  }

  return { valid: true, strength };
}

/**
 * Valida que dos campos coincidan (ej. confirmar contraseña)
 */
export function validateMatch(
  value1: string,
  value2: string,
  fieldName: string = 'Confirmación'
): { valid: boolean; error?: string } {
  if (value1 !== value2) {
    return { valid: false, error: `${fieldName} no coincide` };
  }
  return { valid: true };
}
