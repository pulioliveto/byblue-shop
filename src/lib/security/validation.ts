import { NextRequest } from 'next/server'

// Patrones maliciosos comunes
const MALICIOUS_PATTERNS = [
  /(<script[^>]*>.*?<\/script>)/gi, // Scripts XSS
  /(javascript:|data:|vbscript:)/gi, // Protocolos peligrosos
  /(<iframe[^>]*>.*?<\/iframe>)/gi, // IFrames
  /(onload|onerror|onclick|onmouseover)=/gi, // Event handlers
  /(union\s+select|drop\s+table|insert\s+into)/gi, // SQL Injection
  /(\.\.\/|\.\.\\)/g, // Path traversal
  /(<\?php|\?>|<%|%>)/gi, // Server-side code
]

// Lista de IPs sospechosas (en producción usar servicio externo)
const SUSPICIOUS_IPS = new Set<string>([
  // Agregar IPs conocidas como maliciosas
])

// User agents sospechosos (solo bots obvios, no navegadores legítimos)
const SUSPICIOUS_USER_AGENTS = [
  /^bot$/i,
  /^crawler$/i,
  /^spider$/i,
  /^scraper$/i,
  /^curl\//i,
  /^wget\//i,
  /^python-/i,
  /^php\//i,
  // Excluir navegadores populares que pueden incluir "bot" en su string
]

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  let sanitized = input
  
  // Remover patrones maliciosos
  MALICIOUS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })
  
  // Escapar caracteres HTML
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
  
  return sanitized.trim()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos una letra minúscula' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos una letra mayúscula' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos un número' }
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos un carácter especial (@$!%*?&)' }
  }
  
  return { valid: true }
}

export function detectSuspiciousActivity(request: NextRequest): {
  suspicious: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  const userAgent = request.headers.get('user-agent') || ''
  const ip = request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown'
  
  // Verificar IP sospechosa
  if (SUSPICIOUS_IPS.has(ip)) {
    reasons.push('IP en lista negra')
  }
  
  // Verificar User Agent sospechoso (más específico)
  if (SUSPICIOUS_USER_AGENTS.some(pattern => pattern.test(userAgent))) {
    // Solo si el User Agent es obviamente un bot, no un navegador
    if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome') && !userAgent.includes('Safari') && !userAgent.includes('Firefox')) {
      reasons.push('User Agent sospechoso')
    }
  }
  
  // No verificar headers para rutas de autenticación ya que OAuth puede no incluirlos
  const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth/')
  if (!isAuthRoute) {
    // Verificar falta de headers comunes solo para rutas no-auth
    if (!request.headers.get('accept') && !userAgent.includes('Mozilla')) {
      reasons.push('Falta header Accept')
    }
  }
  
  // Verificar patrones de request sospechosos
  const url = request.nextUrl.pathname
  if (url.includes('..') || url.includes('\\') || url.includes('%2e%2e')) {
    reasons.push('Intento de path traversal')
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons
  }
}

export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}
