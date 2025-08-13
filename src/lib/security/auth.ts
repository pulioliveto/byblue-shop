import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export interface AuthUser {
  id: string
  email: string
  name: string
  image?: string
  role: 'USER' | 'ADMIN' | 'CREADOR'
}

// Verificar sesión de Google OAuth
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return null
    }
    
    // Aquí puedes hacer una consulta a la base de datos para obtener el rol
    // Por ahora retornamos la información básica
    return {
      id: session.user.id || session.user.email,
      email: session.user.email,
      name: session.user.name || 'Usuario',
      image: session.user.image || undefined,
      role: 'USER' // Por defecto, luego se puede actualizar desde la BD
    }
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return null
  }
}

// Middleware para requerir autenticación
export async function requireAuth(request: NextRequest): Promise<AuthUser | null> {
  return await getAuthUser(request)
}

// Middleware para requerir rol de admin
export async function requireAdmin(request: NextRequest): Promise<AuthUser | null> {
  const user = await getAuthUser(request)
  
  if (!user || user.role !== 'ADMIN') {
    return null
  }
  
  return user
}

// Verificar si el usuario tiene permisos específicos
export function hasPermission(user: AuthUser | null, permission: 'CREATE_PRODUCT' | 'DELETE_PRODUCT' | 'MANAGE_USERS'): boolean {
  if (!user) return false
  
  switch (permission) {
    case 'CREATE_PRODUCT':
    case 'DELETE_PRODUCT':
      return user.role === 'ADMIN' || user.role === 'CREADOR'
    case 'MANAGE_USERS':
      return user.role === 'ADMIN'
    default:
      return false
  }
}
