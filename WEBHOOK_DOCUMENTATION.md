# Webhook de Notificaciones de Mentoría

## Visión General

El sistema de mentoría incluye un webhook seguro que notifica al sistema externo de la empresa cuando se crean nuevos mensajes en el chat de mentoría.

## Seguridad Implementada

### 1. Autenticación con API Key
- Cada solicitud debe incluir el header `X-API-Key`
- La API key se configura en la variable de entorno `WEBHOOK_API_KEY`

### 2. Verificación de Firma HMAC
- Cada solicitud debe incluir el header `X-Webhook-Signature`
- La firma se genera usando HMAC-SHA256 con el secreto configurado
- Esto garantiza que el payload no fue modificado en tránsito

### 3. Rate Limiting
- Máximo 100 solicitudes por minuto por IP
- Previene ataques de fuerza bruta y abuso del webhook

### 4. Sanitización de Datos
- Todos los strings se sanitizan para prevenir ataques XSS
- Solo se permiten campos específicos en el payload

### 5. Validación de Campos
- Se validan campos requeridos (conversationId, content)
- Se rechazan payloads inválidos

## Variables de Entorno

Configura estas variables en tu archivo `.env.local`:

```bash
# Webhook Security
WEBHOOK_SECRET=tu_secreto_muy_seguro_aqui
WEBHOOK_API_KEY=tu_api_key_unica_aqui

# Sistema Externo
EXTERNAL_WEBHOOK_URL=https://tu-sistema-externo.com/api/webhook
EXTERNAL_API_KEY=tu_api_key_del_sistema_externo
```

## Endpoint del Webhook

### URL
```
POST /api/webhook/messages
```

### Headers Requeridos
```
Content-Type: application/json
X-API-Key: tu_api_key_unica_aqui
X-Webhook-Signature: firma_hmac_del_payload
```

### Payload del Mensaje
```json
{
  "conversationId": "diagnosis_id",
  "senderId": "user_uid",
  "senderName": "Nombre del Usuario",
  "senderEmail": "usuario@email.com",
  "content": "Contenido del mensaje",
  "recipientId": "mentor",
  "recipientName": "Mentor",
  "diagnosisTitle": "Título del Diagnóstico",
  "diagnosisOrg": "Organización",
  "createdAt": "timestamp",
  "read": false
}
```

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "messageId": "diagnosis_id"
}
```

### Errores Comunes

**401 Unauthorized** - API key inválida o firma incorrecta
```json
{
  "error": "Unauthorized",
  "message": "Invalid API key" o "Invalid signature"
}
```

**429 Too Many Requests** - Rate limit excedido
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded"
}
```

**400 Bad Request** - Payload inválido o campos faltantes
```json
{
  "error": "Bad Request",
  "message": "Invalid JSON" o "Missing required fields"
}
```

## Firebase Cloud Functions

### Configuración

1. Instalar Firebase Functions:
```bash
npm install -g firebase-tools
firebase login
```

2. Inicializar Functions en el proyecto:
```bash
cd functions
npm install
```

3. Configurar variables de entorno de Firebase:
```bash
firebase functions:config:set webhook.url="https://tu-sistema-externo.com/api/webhook"
firebase functions:config:set webhook.secret="tu_secreto_muy_seguro"
firebase functions:config:set webhook.api_key="tu_api_key_unica"
```

4. Desplegar Cloud Functions:
```bash
firebase deploy --only functions
```

### Función: onMessageCreated

Se dispara automáticamente cuando se crea un nuevo mensaje en Firestore:

- Solo notifica mensajes enviados por usuarios (recipientId === 'mentor')
- Genera firma HMAC del payload
- Envía notificación al webhook externo
- No interrumpe el flujo si falla la notificación

## Generación de Firma HMAC

Para generar la firma del payload en tu sistema externo:

```javascript
const crypto = require('crypto');
const WEBHOOK_SECRET = 'tu_secreto_muy_seguro_aqui';

function generateSignature(payload) {
  return crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
}

// Uso
const payload = { /* datos del mensaje */ };
const signature = generateSignature(payload);
```

## Flujo Completo

1. **Usuario envía mensaje** → Se guarda en Firestore
2. **Cloud Function se dispara** → Detecta nuevo mensaje
3. **Cloud Function genera firma** → HMAC-SHA256 del payload
4. **Cloud Function envía al webhook** → Con headers de autenticación
5. **Webhook valida** → API key, firma, rate limiting
6. **Webhook sanitiza** → Limpia datos peligrosos
7. **Webhook reenvía** → Al sistema externo configurado
8. **Sistema externo procesa** → Recibe notificación segura

## Pruebas

### Probar el webhook localmente

```bash
curl -X POST http://localhost:3000/api/webhook/messages \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu_api_key_unica_aqui" \
  -H "X-Webhook-Signature: firma_generada" \
  -d '{
    "conversationId": "test",
    "senderId": "test_user",
    "senderName": "Test User",
    "senderEmail": "test@example.com",
    "content": "Mensaje de prueba",
    "recipientId": "mentor",
    "recipientName": "Mentor",
    "diagnosisTitle": "Test Diagnosis",
    "diagnosisOrg": "Test Org"
  }'
```

### Verificar webhook activo

```bash
curl http://localhost:3000/api/webhook/messages
```

## Recomendaciones de Seguridad

1. **Usar secrets fuertes**: Generar strings aleatorios largos (mínimo 32 caracteres)
2. **Rotar secrets periódicamente**: Cambiar API keys y secrets cada 3-6 meses
3. **Usar HTTPS obligatorio**: Nunca enviar datos sensibles por HTTP
4. **Monitorear logs**: Revisar logs de Firebase Functions y del webhook
5. **Implementar IP whitelist**: Solo permitir IPs específicas si es posible
6. **Validar origen**: Verificar que las solicitudes vienen de Firebase

## Soporte

Para problemas o preguntas sobre el webhook:
- Revisar logs de Firebase Console
- Revisar logs de Next.js (Vercel)
- Verificar variables de entorno configuradas
- Validar firma HMAC con el mismo secreto
