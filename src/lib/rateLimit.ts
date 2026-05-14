/**
 * Rate Limiting - Limitación de solicitudes por IP
 * Previene ataques de fuerza bruta y DDoS
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Almacenamiento en memoria para rate limiting
// En producción, usar Redis o base de datos
const rateLimitStore: RateLimitStore = {};

/**
 * Configuración de rate limiting
 */
interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en milisegundos
  maxRequests: number; // Máximo de solicitudes por ventana
  skipSuccessfulRequests?: boolean; // No contar solicitudes exitosas
}

/**
 * Verifica si una IP ha excedido el límite de solicitudes
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 15 * 60 * 1000, maxRequests: 100 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const { windowMs, maxRequests } = config;

  // Limpiar entradas expiradas
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });

  const record = rateLimitStore[identifier];

  if (!record || record.resetTime < now) {
    // Nueva ventana o ventana expirada
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + windowMs
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }

  if (record.count >= maxRequests) {
    // Límite excedido
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime
    };
  }

  // Incrementar contador
  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime
  };
}

/**
 * Rate limit más estricto para endpoints sensibles (login, registro)
 */
export function strictRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  return checkRateLimit(identifier, {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5 // Solo 5 intentos
  });
}

/**
 * Rate limit moderado para endpoints normales
 */
export function standardRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  return checkRateLimit(identifier, {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100 // 100 solicitudes
  });
}

/**
 * Rate limit laxo para endpoints públicos
 */
export function laxRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  return checkRateLimit(identifier, {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 1000 // 1000 solicitudes
  });
}

/**
 * Obtiene el identificador único para rate limiting
 */
export function getRateLimitIdentifier(request: Request): string {
  // Intentar obtener IP real detrás de proxies
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  const ip = cfConnectingIp || realIp || forwarded || 'unknown';
  
  // Si es una lista de IPs (x-forwarded-for), usar la primera
  const ipList = ip.split(',').map(i => i.trim());
  return ipList[0] || 'unknown';
}

/**
 * Limpia el almacenamiento de rate limiting (para testing)
 */
export function clearRateLimitStore(): void {
  Object.keys(rateLimitStore).forEach(key => {
    delete rateLimitStore[key];
  });
}
