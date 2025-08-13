import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin, hasPermission } from '@/lib/security/auth'
import { sanitizeInput, validateEmail } from '@/lib/security/validation'
import { logSecurityEvent } from '@/lib/security/middleware'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación con Google OAuth
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión con Google' },
        { status: 401 }
      )
    }
    
    // Usuario autenticado, devolver datos protegidos
    return NextResponse.json({
      message: 'Datos protegidos (Google OAuth)',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    logSecurityEvent({
      type: 'AUTH_FAILURE',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      url: request.nextUrl.pathname,
      details: error
    })
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión con Google' },
        { status: 401 }
      )
    }
    
    // Obtener y sanitizar datos
    const body = await request.json()
    const message = sanitizeInput(body.message || '')
    
    // Procesar datos seguros...
    console.log('Datos procesados de forma segura:', { 
      user: user.email, 
      message 
    })
    
    return NextResponse.json({
      message: 'Datos procesados exitosamente',
      sanitized: { message },
      processedBy: user.email
    })
    
  } catch (error) {
    logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      url: request.nextUrl.pathname,
      details: error
    })
    
    return NextResponse.json(
      { error: 'Error procesando datos' },
      { status: 500 }
    )
  }
}

// Endpoint que requiere permisos de admin
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // Verificar permisos específicos
    if (!hasPermission(user, 'DELETE_PRODUCT')) {
      logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        url: request.nextUrl.pathname,
        details: `Usuario ${user.email} intentó acceder sin permisos`
      })
      
      return NextResponse.json(
        { error: 'No tienes permisos para esta acción' },
        { status: 403 }
      )
    }
    
    return NextResponse.json({
      message: 'Acción de admin ejecutada correctamente',
      executedBy: user.email,
      role: user.role
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
