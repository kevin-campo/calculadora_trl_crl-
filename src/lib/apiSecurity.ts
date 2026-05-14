/**
 * Middleware de Seguridad para API Routes
 * Combina rate limiting, sanitización y validación
 */

import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, sanitizeObject, validateAndSanitizeFormData } from './security';
import { checkRateLimit, getRateLimitIdentifier, strictRateLimit, standardRateLimit } from './rateLimit';

/**
 * Opciones de configuración del middleware de seguridad
 */
interface SecurityMiddlewareOptions {
  requireRateLimit?: boolean;
  rateLimitType?: 'strict' | 'standard' | 'lax';
  requireSanitization?: boolean;
  requireValidation?: boolean;
  validationSchema?: Record<string, { required?: boolean; maxLength?: number; sanitize?: boolean }>;
  requireAuth?: boolean;
}

/**
 * Middleware de seguridad para API routes
 */
export async function securityMiddleware(
  request: NextRequest,
  options: SecurityMiddlewareOptions = {}
): Promise<{ success: boolean; error?: string; sanitizedData?: any }> {
  const {
    requireRateLimit = true,
    rateLimitType = 'standard',
    requireSanitization = true,
    requireValidation = false,
    validationSchema,
    requireAuth = false
  } = options;

  // 1. Rate Limiting
  if (requireRateLimit) {
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = 
      rateLimitType === 'strict' ? strictRateLimit(identifier) :
      rateLimitType === 'lax' ? standardRateLimit(identifier) :
      standardRateLimit(identifier);

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'Too Many Requests'
      };
    }
  }

  // 2. Autenticación (si es requerida)
  if (requireAuth) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }
  }

  // 3. Sanitización y validación de datos
  let body: any = {};
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.json();
    }
  } catch (e) {
    // Si no hay body o no es JSON, continuar
  }

  if (requireSanitization && Object.keys(body).length > 0) {
    body = sanitizeObject(body);
  }

  if (requireValidation && validationSchema) {
    const validation = validateAndSanitizeFormData(body, validationSchema);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation Error: ${validation.errors.join(', ')}`
      };
    }
    body = validation.data;
  }

  return {
    success: true,
    sanitizedData: body
  };
}

/**
 * Respuesta de error de seguridad estandarizada
 */
export function securityErrorResponse(error: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { 
      error,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

/**
 * Headers de seguridad para respuestas API
 */
export function getSecurityHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
}

/**
 * Wrapper para API routes con seguridad integrada
 */
export function withSecurity(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: SecurityMiddlewareOptions = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    // Ejecutar middleware de seguridad
    const securityResult = await securityMiddleware(request, options);

    if (!securityResult.success) {
      const status = securityResult.error === 'Too Many Requests' ? 429 :
                     securityResult.error === 'Unauthorized' ? 401 : 400;
      return securityErrorResponse(securityResult.error || 'Security Error', status);
    }

    // Agregar headers de seguridad a la respuesta
    const response = await handler(request, context);
    
    // Clonar la respuesta para agregar headers
    const newResponse = new NextResponse(response.body, response);
    const securityHeaders = getSecurityHeaders();
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value as string);
    });

    return newResponse;
  };
}
