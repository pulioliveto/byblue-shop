import { NextRequest, NextResponse } from 'next/server'

// Store para rate limiting en memoria (en producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number // Ventana de tiempo en milisegundos
  max: number // Máximo número de requests
  message?: string
}

export function createRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const key = `${ip}-${request.nextUrl.pathname}`
    const now = Date.now()
    
    // Limpiar entradas expiradas
    for (const [storeKey, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(storeKey)
      }
    }
    
    const record = rateLimitStore.get(key)
    
    if (!record) {
      // Primera request
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // Permitir request
    }
    
    if (now > record.resetTime) {
      // Ventana expirada, resetear
      record.count = 1
      record.resetTime = now + config.windowMs
      return null // Permitir request
    }
    
    if (record.count >= config.max) {
      // Límite excedido
      return NextResponse.json(
        { 
          error: config.message || 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
          }
        }
      )
    }
    
    // Incrementar contador
    record.count++
    return null // Permitir request
  }
}

// Configuraciones específicas para Google OAuth
export const googleOAuthRateLimit = createRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 10, // 10 intentos de OAuth cada 10 minutos por IP
  message: 'Demasiados intentos de autenticación con Google. Espera 10 minutos.'
})

export const adminActionsRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // 20 acciones de admin cada 5 minutos
  message: 'Límite de acciones de administrador excedido.'
})

export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP cada 15 minutos
  message: 'Demasiadas solicitudes desde esta IP'
})

// Ya no necesitamos authRateLimit tradicional ya que usamos Google OAuth
export const apiRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto para APIs
  message: 'Límite de API excedido. Intenta en 1 minuto.'
})
