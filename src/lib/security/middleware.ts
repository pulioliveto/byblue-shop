import { NextRequest, NextResponse } from 'next/server'
import { generalRateLimit, googleOAuthRateLimit, adminActionsRateLimit, apiRateLimit } from './rateLimit'
import { detectSuspiciousActivity, sanitizeInput } from './validation'

// Headers de seguridad
export function securityHeaders(response: NextResponse): NextResponse {
  // Prevenir ataques XSS
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Prevenir ataques de clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevenir MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Forzar HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // Controlar referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy (CSP)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://vercel.live wss://ws-us3.pusher.com; " +
    "frame-src 'none';"
  )
  
  // Remover headers que revelan información
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')
  
  return response
}

export async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl
  
  // No aplicar seguridad estricta a rutas de autenticación
  const isAuthRoute = pathname.startsWith('/api/auth/')
  
  if (!isAuthRoute) {
    // 1. Detectar actividad sospechosa solo en rutas no-auth
    const suspiciousActivity = detectSuspiciousActivity(request)
    if (suspiciousActivity.suspicious) {
      console.warn(`Actividad sospechosa detectada:`, {
        ip: request.headers.get('x-forwarded-for'),
        pathname,
        reasons: suspiciousActivity.reasons,
        userAgent: request.headers.get('user-agent')
      })
      
      // Bloquear requests muy sospechosos (solo si tiene más de 3 razones)
      if (suspiciousActivity.reasons.length > 3) {
        return new NextResponse('Acceso bloqueado', { status: 403 })
      }
    }
  }
  
  // 2. Aplicar rate limiting según la ruta
  let rateLimitResult = null
  
  if (pathname.startsWith('/api/auth/')) {
    rateLimitResult = await googleOAuthRateLimit(request)
  } else if (pathname.startsWith('/api/admin/')) {
    rateLimitResult = await adminActionsRateLimit(request)
  } else if (pathname.startsWith('/api/')) {
    rateLimitResult = await apiRateLimit(request)
  } else {
    rateLimitResult = await generalRateLimit(request)
  }
  
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  // 3. Sanitizar parámetros de consulta (solo para rutas no-auth)
  if (!isAuthRoute) {
    const url = request.nextUrl
    let modified = false
    
    for (const [key, value] of url.searchParams.entries()) {
      const sanitized = sanitizeInput(value)
      if (sanitized !== value) {
        url.searchParams.set(key, sanitized)
        modified = true
      }
    }
    
    if (modified) {
      return NextResponse.redirect(url)
    }
  }
  
  return null
}

// Logging de seguridad
export function logSecurityEvent(event: {
  type: 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT' | 'AUTH_FAILURE' | 'XSS_ATTEMPT'
  ip?: string
  userAgent?: string
  url?: string
  details?: any
}) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    ...event
  }
  
  console.warn('[SECURITY]', logEntry)
  
  // En producción, enviar a servicio de logging como Sentry, LogRocket, etc.
}
