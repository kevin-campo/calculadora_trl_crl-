import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import crypto from 'crypto';

admin.initializeApp();

// Configuración
const WEBHOOK_URL = process.env.WEBHOOK_URL || '';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY || '';

/**
 * Cloud Function: onMessageCreated
 * Se dispara cuando se crea un nuevo mensaje en Firestore
 * Envía notificación al webhook externo
 */
export const onMessageCreated = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();

    // Solo notificar mensajes enviados por usuarios (no por el mentor)
    if (message.recipientId === 'mentor') {
      try {
        console.log('📨 Nuevo mensaje detectado, enviando notificación...');

        // Crear firma HMAC
        const payload = JSON.stringify(message);
        const signature = crypto
          .createHmac('sha256', WEBHOOK_SECRET)
          .update(payload)
          .digest('hex');

        // Enviar al webhook
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-API-Key': WEBHOOK_API_KEY
          },
          body: payload
        });

        if (response.ok) {
          console.log('✅ Notificación enviada exitosamente');
        } else {
          console.error('❌ Error al enviar notificación:', response.status);
        }
      } catch (error) {
        console.error('❌ Error en Cloud Function:', error);
        // No lanzar error para no interrumpir el flujo
      }
    }

    return null;
  });
