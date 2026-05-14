/**
 * Configuración CORS (Cross-Origin Resource Sharing)
 * Controla qué orígenes pueden acceder a la API
 */

/**
 * Orígenes permitidos para CORS
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://localhost:3000',
  process.env.NEXT_PUBLIC_APP_URL || '',
  process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '',
].filter(Boolean);

/**
 * Verifica si un origen está permitido
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  // En desarrollo, permitir localhost
  if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost')) {
    return true;
  }
  
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Headers CORS para respuestas
 */
export function getCORSHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {};

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRF-Token';
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Access-Control-Max-Age'] = '86400'; // 24 horas
  }

  return headers;
}

/**
 * Maneja solicitudes OPTIONS preflight
 */
export function handleCORSPreflight(origin: string | null): Response {
  const headers = getCORSHeaders(origin);
  
  return new Response(null, {
    status: 204,
    headers
  });
}

/**
 * Agrega headers CORS a una respuesta
 */
export function addCORSHeaders(response: Response, origin: string | null): Response {
  const headers = getCORSHeaders(origin);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value as string);
  });
  
  return response;
}

/**
 * Middleware CORS para API routes
 */
export function corsMiddleware(request: Request): { allowed: boolean; headers: HeadersInit } {
  const origin = request.headers.get('origin');
  const headers = getCORSHeaders(origin);
  
  // Si es una solicitud OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return { allowed: true, headers };
  }
  
  // Verificar si el origen está permitido
  if (origin && !isOriginAllowed(origin)) {
    return { allowed: false, headers: {} };
  }
  
  return { allowed: true, headers };
}
