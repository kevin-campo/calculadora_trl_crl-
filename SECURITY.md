# Documentación de Seguridad

## Parches de Seguridad Implementados

### 1. Headers de Seguridad HTTP
**Archivo:** `next.config.js`

Headers implementados:
- **Strict-Transport-Security (HSTS):** max-age=63072000; includeSubDomains; preload
- **X-Frame-Options:** SAMEORIGIN (previene clickjacking)
- **X-Content-Type-Options:** nosniff (previene MIME-sniffing)
- **X-XSS-Protection:** 1; mode=block (protección XSS)
- **Referrer-Policy:** strict-origin-when-cross-origin
- **Permissions-Policy:** camera=(), microphone=(), geolocation=(), interest-cohort=()
- **Content-Security-Policy (CSP):** Política completa con allowlist de dominios confiables

### 2. Sanitización de Inputs
**Archivo:** `src/lib/security.ts`

Funciones implementadas:
- `sanitizeInput()`: Sanitiza cadenas para prevenir XSS
- `sanitizeObject()`: Sanitiza objetos recursivamente
- `isValidEmail()`: Valida formato de email
- `isValidUrl()`: Valida URLs seguras
- `validateMaxLength()`: Valida longitud máxima
- `validateNotEmpty()`: Valida que no esté vacío
- `escapeHtml()`: Escapa caracteres HTML
- `validateAndSanitizeFormData()`: Validación y sanitización de formularios

### 3. Rate Limiting
**Archivo:** `src/lib/rateLimit.ts`

Implementación:
- `checkRateLimit()`: Rate limiting genérico
- `strictRateLimit()`: 5 solicitudes por 15 minutos (endpoints sensibles)
- `standardRateLimit()`: 100 solicitudes por 15 minutos (endpoints normales)
- `laxRateLimit()`: 1000 solicitudes por hora (endpoints públicos)
- `getRateLimitIdentifier()`: Obtiene IP real detrás de proxies

### 4. Middleware de Seguridad para API
**Archivo:** `src/lib/apiSecurity.ts`

Funcionalidades:
- `securityMiddleware()`: Middleware combinado de seguridad
- `withSecurity()`: Wrapper para API routes con seguridad
- `securityErrorResponse()`: Respuestas de error estandarizadas
- `getSecurityHeaders()`: Headers de seguridad para respuestas API

### 5. Protección CSRF
**Archivo:** `src/lib/csrf.ts`

Implementación:
- `generateCSRFToken()`: Genera token CSRF aleatorio
- `validateCSRFToken()`: Valida token CSRF
- `setCSRFToken()`: Establece token en cookies
- `getCSRFToken()`: Obtiene token de cookies
- `verifyCSRFRequest()`: Verifica token en solicitudes
- `csrfProtection()`: Middleware CSRF

### 6. Configuración CORS
**Archivo:** `src/lib/cors.ts`

Funcionalidades:
- `isOriginAllowed()`: Verifica si origen está permitido
- `getCORSHeaders()`: Headers CORS para respuestas
- `handleCORSPreflight()`: Maneja solicitudes OPTIONS
- `corsMiddleware()`: Middleware CORS

### 7. Logging de Seguridad
**Archivo:** `src/lib/securityLogger.ts`

Funcionalidades:
- `logSecurityEvent()`: Registra eventos de seguridad
- `getSecurityLogs()`: Obtiene logs de seguridad
- `getSecurityStats()`: Estadísticas de seguridad
- `detectSuspiciousActivity()`: Detecta patrones sospechosos

### 8. Error Handling Seguro
**Archivo:** `src/lib/errorHandler.ts`

Funcionalidades:
- `handleSecureError()`: Manejo de errores sin exponer información sensible
- `withErrorHandling()`: Wrapper para funciones async con manejo de errores
- `sanitizeErrorMessage()`: Sanitiza mensajes de error
- Tipos de errores: SecurityError, AuthenticationError, AuthorizationError, ValidationError, RateLimitError

### 9. Validación en Cliente
**Archivo:** `src/lib/clientValidation.ts`

Funcionalidades:
- `validateEmail()`: Validación de email
- `validateTextField()`: Validación de campos de texto
- `validateForm()`: Validación de formularios completos
- `validateUrl()`: Validación de URLs seguras
- `validatePassword()`: Validación de contraseñas fuertes
- `validateFile()`: Validación de archivos (tamaño, tipo)

## Variables de Entorno Requeridas

Agregar al archivo `.env.local`:

```bash
# Seguridad
CSRF_SECRET=tu-secreto-csrf-aleatorio-largo
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Firebase (ya existentes)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
```

## Uso en API Routes

### Ejemplo con middleware de seguridad:

```typescript
import { withSecurity } from '@/lib/apiSecurity';
import { csrfProtection } from '@/lib/csrf';
import { corsMiddleware } from '@/lib/cors';

export async function POST(request: Request) {
  // Verificar CSRF
  const csrfResult = await csrfProtection(request);
  if (!csrfResult.valid) {
    return new Response('Invalid CSRF token', { status: 403 });
  }

  // Verificar CORS
  const corsResult = corsMiddleware(request);
  if (!corsResult.allowed) {
    return new Response('Origin not allowed', { status: 403 });
  }

  // Usar middleware de seguridad
  const securityResult = await securityMiddleware(request, {
    requireRateLimit: true,
    rateLimitType: 'strict',
    requireSanitization: true,
    requireValidation: true,
    validationSchema: {
      email: { required: true, sanitize: true },
      message: { required: true, maxLength: 2000, sanitize: true }
    }
  });

  if (!securityResult.success) {
    return new Response(securityResult.error, { status: 400 });
  }

  // Procesar solicitud con datos sanitizados
  const data = securityResult.sanitizedData;
  // ...
}
```

### Ejemplo con wrapper:

```typescript
import { withSecurity } from '@/lib/apiSecurity';

async function handler(request: Request) {
  // Tu lógica aquí
  return Response.json({ success: true });
}

export const POST = withSecurity(handler, {
  requireRateLimit: true,
  rateLimitType: 'standard',
  requireSanitization: true
});
```

## Recomendaciones Adicionales

### 1. En Producción
- Usar HTTPS obligatoriamente
- Configurar rate limiting con Redis para distribución
- Usar secrets management (AWS Secrets Manager, Azure Key Vault)
- Implementar logging y monitoreo de seguridad
- Configurar WAF (Web Application Firewall)
- Habilitar Firebase App Check

### 2. Firebase Security Rules
Asegurar que las reglas de Firestore sean restrictivas:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /diagnostics/{diagnosisId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Actualización de Dependencias
Ejecutar regularmente:
```bash
npm audit
npm audit fix
npm update
```

### 4. Validación en Cliente
- Validar datos en el cliente antes de enviar
- Usar tipos TypeScript estrictos
- Implementar validación de formularios con Zod o similar

### 5. Monitoreo
- Configurar alertas para intentos de rate limiting
- Monitorear errores de validación CSRF
- Revisar logs de errores de seguridad

## Checklist de Seguridad

- [x] Headers de seguridad HTTP
- [x] Content Security Policy (CSP)
- [x] Sanitización de inputs
- [x] Rate limiting
- [x] Protección CSRF
- [x] Configuración CORS
- [x] Validación de datos
- [x] Variables de entorno protegidas (.env.local en .gitignore)
- [x] Firebase configurado correctamente
- [x] Logging de seguridad
- [x] Error handling seguro
- [x] Validación en cliente
- [ ] Firebase App Check (recomendado para producción)
- [ ] WAF configurado (recomendado para producción)
- [ ] Integración con servicio de logging externo (Sentry, LogRocket)

## Archivos de Seguridad Creados

1. `src/lib/security.ts` - Utilidades de sanitización y validación
2. `src/lib/rateLimit.ts` - Implementación de rate limiting
3. `src/lib/apiSecurity.ts` - Middleware de seguridad para API routes
4. `src/lib/csrf.ts` - Protección CSRF
5. `src/lib/cors.ts` - Configuración CORS
6. `src/lib/securityLogger.ts` - Logging de eventos de seguridad
7. `src/lib/errorHandler.ts` - Error handling seguro
8. `src/lib/clientValidation.ts` - Validación en cliente
9. `next.config.js` - Headers de seguridad y CSP actualizados

## Contacto

Para reportar vulnerabilidades de seguridad, contactar al equipo de desarrollo.
