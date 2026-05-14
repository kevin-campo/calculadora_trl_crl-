/**
 * Logger de Seguridad
 * Registra eventos de seguridad para monitoreo y auditoría
 */

interface SecurityEvent {
  timestamp: string;
  type: 'rate_limit_exceeded' | 'csrf_failure' | 'invalid_input' | 'auth_failure' | 'cors_violation' | 'xss_attempt' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent?: string;
  details: Record<string, any>;
}

// Almacenamiento en memoria para logs (en producción usar servicio de logging)
const securityLogs: SecurityEvent[] = [];
const MAX_LOGS = 1000;

/**
 * Registra un evento de seguridad
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const logEntry: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString()
  };

  // Agregar al inicio (más recientes primero)
  securityLogs.unshift(logEntry);

  // Mantener solo los últimos MAX_LOGS
  if (securityLogs.length > MAX_LOGS) {
    securityLogs.pop();
  }

  // En producción, enviar a servicio de logging (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    console.warn('[Security Event]', JSON.stringify(logEntry));
  }
}

/**
 * Obtiene logs de seguridad
 */
export function getSecurityLogs(limit: number = 100): SecurityEvent[] {
  return securityLogs.slice(0, limit);
}

/**
 * Limpia logs antiguos
 */
export function clearSecurityLogs(): void {
  securityLogs.length = 0;
}

/**
 * Obtiene estadísticas de seguridad
 */
export function getSecurityStats(): {
  totalEvents: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  last24Hours: number;
} {
  const now = Date.now();
  const last24Hours = securityLogs.filter(
    log => now - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000
  ).length;

  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  securityLogs.forEach(log => {
    byType[log.type] = (byType[log.type] || 0) + 1;
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
  });

  return {
    totalEvents: securityLogs.length,
    byType,
    bySeverity,
    last24Hours
  };
}

/**
 * Detecta patrones sospechosos (múltiples eventos de la misma IP)
 */
export function detectSuspiciousActivity(ip: string, windowMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const recentEvents = securityLogs.filter(
    log => log.ip === ip && now - new Date(log.timestamp).getTime() < windowMs
  );

  // Si hay más de 10 eventos en 5 minutos, es sospechoso
  return recentEvents.length > 10;
}
