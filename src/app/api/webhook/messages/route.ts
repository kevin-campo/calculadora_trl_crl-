import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Configuración de seguridad
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key-change-in-production';
const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY || 'your-api-key-change-in-production';
const EXTERNAL_WEBHOOK_URL = process.env.EXTERNAL_WEBHOOK_URL || '';
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100;

// Rate limiting en memoria (para producción usar Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Verificar API Key en el header
 */
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === WEBHOOK_API_KEY;
}

/**
 * Verificar firma HMAC del payload
 */
function verifySignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Verificar rate limiting
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Sanitizar datos del mensaje
 */
function sanitizeMessageData(data: any): any {
  const sanitized: any = {};

  // Campos permitidos
  const allowedFields = [
    'conversationId',
    'senderId',
    'senderName',
    'senderEmail',
    'content',
    'recipientId',
    'recipientName',
    'diagnosisTitle',
    'diagnosisOrg',
    'createdAt',
    'read'
  ];

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      // Sanitizar strings para prevenir XSS
      if (typeof data[field] === 'string') {
        sanitized[field] = data[field]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      } else {
        sanitized[field] = data[field];
      }
    }
  });

  return sanitized;
}

/**
 * POST /api/webhook/messages
 * Recibe notificaciones de nuevos mensajes y las reenvía al sistema externo
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar API Key
    if (!verifyApiKey(request)) {
      console.error('❌ Webhook: API Key inválida');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API key' },
        { status: 401 }
      );
    }

    // 2. Verificar rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      console.error('❌ Webhook: Rate limit excedido para IP:', ip);
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // 3. Obtener y verificar payload
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature');

    if (!signature) {
      console.error('❌ Webhook: Firma no proporcionada');
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing signature' },
        { status: 400 }
      );
    }

    if (!verifySignature(rawBody, signature)) {
      console.error('❌ Webhook: Firma inválida');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 4. Parsear y sanitizar datos
    let messageData;
    try {
      messageData = JSON.parse(rawBody);
    } catch (error) {
      console.error('❌ Webhook: JSON inválido');
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const sanitizedData = sanitizeMessageData(messageData);

    // 5. Validar campos requeridos
    if (!sanitizedData.conversationId || !sanitizedData.content) {
      console.error('❌ Webhook: Campos requeridos faltantes');
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 6. Reenviar al sistema externo (si está configurado)
    if (EXTERNAL_WEBHOOK_URL) {
      try {
        const externalResponse = await fetch(EXTERNAL_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Source': 'trl-crl-mentorship',
            'Authorization': `Bearer ${process.env.EXTERNAL_API_KEY || ''}`
          },
          body: JSON.stringify({
            event: 'new_message',
            data: sanitizedData,
            timestamp: new Date().toISOString()
          })
        });

        if (!externalResponse.ok) {
          console.error('⚠️  Webhook: Error al reenviar al sistema externo', externalResponse.status);
          // No fallar el webhook si el sistema externo falla
        } else {
          console.log('✅ Webhook: Notificación reenviada al sistema externo');
        }
      } catch (error) {
        console.error('⚠️  Webhook: Error al conectar con sistema externo', error);
        // No fallar el webhook si el sistema externo falla
      }
    }

    // 7. Respuesta exitosa
    console.log('✅ Webhook: Mensaje procesado correctamente');
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      messageId: sanitizedData.conversationId
    });

  } catch (error) {
    console.error('❌ Webhook: Error interno del servidor', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhook/messages
 * Endpoint para verificar que el webhook está activo
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
