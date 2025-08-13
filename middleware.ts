import { NextRequest, NextResponse } from 'next/server'
import { securityMiddleware, securityHeaders } from './src/lib/security/middleware'

export async function middleware(request: NextRequest) {
  // Aplicar middleware de seguridad
  const securityResult = await securityMiddleware(request)
  if (securityResult) {
    return securityHeaders(securityResult)
  }
  
  // Continuar con el request normal
  const response = NextResponse.next()
  
  // Aplicar headers de seguridad a todas las respuestas
  return securityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
