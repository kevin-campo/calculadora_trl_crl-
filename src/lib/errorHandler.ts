/**
 * Error Handling Seguro
 * Manejo de errores sin exponer información sensible
 */

import { logSecurityEvent } from './securityLogger';

/**
 * Tipos de errores personalizados
 */
export class SecurityError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Authorization failed') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Respuesta de error estandarizada (no expone detalles internos)
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  requestId?: string;
}

/**
 * Maneja errores de forma segura
 */
export function handleSecureError(error: unknown, context?: {
  ip?: string;
  userAgent?: string;
  endpoint?: string;
}): ErrorResponse {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);

  // Log del error para debugging interno
  console.error('[Error]', {
    error,
    context,
    requestId,
    timestamp
  });

  // Log de seguridad si es un error de seguridad
  if (error instanceof SecurityError || error instanceof AuthenticationError || error instanceof RateLimitError) {
    logSecurityEvent({
      type: 'auth_failure',
      severity: 'high',
      ip: context?.ip || 'unknown',
      userAgent: context?.userAgent,
      details: {
        errorType: error.constructor.name,
        message: error.message,
        endpoint: context?.endpoint,
        requestId
      }
    });
  }

  // Determinar respuesta basada en tipo de error
  if (error instanceof SecurityError) {
    return {
      error: 'SecurityError',
      message: error.message,
      statusCode: error.statusCode,
      timestamp,
      requestId
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      error: 'AuthenticationError',
      message: 'Authentication required',
      statusCode: 401,
      timestamp,
      requestId
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      error: 'AuthorizationError',
      message: 'Access denied',
      statusCode: 403,
      timestamp,
      requestId
    };
  }

  if (error instanceof ValidationError) {
    return {
      error: 'ValidationError',
      message: error.message,
      statusCode: 400,
      timestamp,
      requestId
    };
  }

  if (error instanceof RateLimitError) {
    return {
      error: 'RateLimitError',
      message: 'Too many requests',
      statusCode: 429,
      timestamp,
      requestId
    };
  }

  // Error genérico (no exponer detalles del error)
  if (process.env.NODE_ENV === 'production') {
    return {
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
      statusCode: 500,
      timestamp,
      requestId
    };
  }

  // En desarrollo, mostrar más detalles
  return {
    error: 'InternalServerError',
    message: error instanceof Error ? error.message : 'Unknown error',
    statusCode: 500,
    timestamp,
    requestId
  };
}

/**
 * Wrapper para funciones async con manejo de errores seguro
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: { ip?: string; userAgent?: string; endpoint?: string }
): Promise<{ success: boolean; data?: T; error?: ErrorResponse }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const errorResponse = handleSecureError(error, context);
    return { success: false, error: errorResponse };
  }
}

/**
 * Sanitiza mensajes de error para no exponer información sensible
 */
export function sanitizeErrorMessage(message: string): string {
  // Eliminar rutas de archivos
  const sanitized = message
    .replace(/\/[a-zA-Z0-9_\-\.\/]+/g, '[REDACTED_PATH]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/password\s*[:=]\s*\S+/gi, 'password=[REDACTED]')
    .replace(/token\s*[:=]\s*\S+/gi, 'token=[REDACTED]')
    .replace(/key\s*[:=]\s*\S+/gi, 'key=[REDACTED]')
    .replace(/secret\s*[:=]\s*\S+/gi, 'secret=[REDACTED]');

  return sanitized;
}

/**
 * Crea una respuesta de error HTTP
 */
export function errorResponse(errorResponse: ErrorResponse): Response {
  return new Response(JSON.stringify(errorResponse), {
    status: errorResponse.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': errorResponse.requestId || ''
    }
  });
}
