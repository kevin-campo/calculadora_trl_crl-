/**
 * Protección CSRF (Cross-Site Request Forgery)
 * Generación y validación de tokens CSRF
 */

import { cookies } from 'next/headers';

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-secret-change-in-production';
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Genera un token CSRF aleatorio
 */
function generateCSRFToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const signature = Buffer.from(`${CSRF_SECRET}:${timestamp}:${random}`).toString('base64');
  return signature;
}

/**
 * Valida un token CSRF
 */
export function validateCSRFToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [secret, timestamp] = decoded.split(':');

    if (secret !== CSRF_SECRET) {
      return false;
    }

    // Token expira después de 1 hora
    const tokenAge = Date.now() - parseInt(timestamp);
    return tokenAge < 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Genera y establece un token CSRF en las cookies
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hora
    path: '/'
  });
  
  return token;
}

/**
 * Obtiene el token CSRF de las cookies
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * Verifica que el token CSRF en el header coincida con el de las cookies
 */
export async function verifyCSRFRequest(request: Request): Promise<boolean> {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = await getCSRFToken();
  
  if (!headerToken || !cookieToken) {
    return false;
  }
  
  return headerToken === cookieToken && validateCSRFToken(cookieToken);
}

/**
 * Middleware para verificar CSRF en solicitudes que modifican estado
 */
export async function csrfProtection(request: Request): Promise<{ valid: boolean; error?: string }> {
  // Solo verificar para métodos que modifican estado
  const method = request.method.toUpperCase();
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  
  if (safeMethods.includes(method)) {
    return { valid: true };
  }
  
  const isValid = await verifyCSRFRequest(request);
  
  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid CSRF token'
    };
  }
  
  return { valid: true };
}

/**
 * Obtiene el nombre del header CSRF
 */
export function getCSRFHeaderName(): string {
  return CSRF_HEADER_NAME;
}

/**
 * Obtiene el nombre de la cookie CSRF
 */
export function getCSRFCookieName(): string {
  return CSRF_COOKIE_NAME;
}
