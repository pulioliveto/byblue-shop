# 🛡️ Documentación de Seguridad - ByBlue Shop (Google OAuth)

## Medidas de Seguridad Implementadas

### 1. **Protección Anti-DDoS y Rate Limiting** 🚫
- **Rate limiting global**: 100 requests por IP cada 15 minutos
- **Rate limiting Google OAuth**: 10 intentos de OAuth cada 10 minutos  
- **Rate limiting de admin**: 20 acciones de admin cada 5 minutos
- **Rate limiting de API**: 30 requests por minuto para endpoints
- Respuestas con headers `Retry-After` y información de límites

### 2. **Autenticación con Google OAuth** 🔐
- **Autenticación exclusiva con Google** - Sin registro manual
- **Sesiones seguras** con NextAuth.js
- **Sistema de roles** (USER, ADMIN, CREADOR)
- **Tracking de sesiones activas** y dispositivos
- **Detección de accesos simultáneos sospechosos**

### 3. **Validación y Sanitización de Datos** 🧹
- Sanitización automática de inputs para prevenir XSS
- Validación de emails con regex robusto
- Detección de patrones maliciosos (SQL injection, XSS, path traversal)
- Filtrado de User Agents sospechosos
- **Sin validación de contraseñas** (no aplica con Google OAuth)

### 4. **Headers de Seguridad** 📋
- `X-XSS-Protection`: Previene ataques XSS
- `X-Frame-Options`: Previene clickjacking  
- `X-Content-Type-Options`: Previene MIME sniffing
- `Strict-Transport-Security`: Fuerza HTTPS
- `Content-Security-Policy`: Controla recursos permitidos
- `Referrer-Policy`: Controla información de referrer

### 5. **Logging y Monitoreo** 📊
- Logging automático de actividad sospechosa
- Tracking de intentos de login fallidos
- Registro de IPs y User Agents sospechosos
- Alertas de seguridad en consola

### 6. **Modelo de Usuario Optimizado** 👤
- **Solo campos necesarios** para Google OAuth
- Tracking de login count y última conexión
- **Sesiones activas** por dispositivo/IP
- **Detección de accesos simultáneos** sospechosos
- Historial de actividad sospechosa específico
- **Sin campos de contraseñas** (innecesarios con OAuth)

## Configuración para Google OAuth

### Variables de Entorno Críticas
\`\`\`bash
# Google OAuth (OBLIGATORIO)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=clave-nextauth-super-secreta

# Base de datos
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Rate Limiting (usar Redis en producción)
REDIS_URL=redis://localhost:6379
\`\`\`

### Configuración de Google Console
1. **Crear proyecto** en Google Cloud Console
2. **Habilitar Google+ API** 
3. **Configurar OAuth Consent Screen**
4. **Crear credenciales OAuth 2.0**
5. **Agregar dominios autorizados**

### URLs de Callback
- Desarrollo: `http://localhost:3000/api/auth/callback/google`
- Producción: `https://tu-dominio.com/api/auth/callback/google`

### Configuración de Servidor
1. **Usar HTTPS siempre** - Configurar SSL/TLS
2. **Firewall** - Bloquear puertos innecesarios
3. **Fail2ban** - Bloquear IPs después de múltiples intentos
4. **Backup regular** - Base de datos y archivos críticos
5. **Monitoreo** - Usar servicios como Sentry, LogRocket

### Servicios Externos Recomendados
- **Cloudflare**: Protección DDoS adicional y CDN
- **Sentry**: Logging y monitoreo de errores  
- **reCAPTCHA**: Protección adicional en formularios
- **Redis**: Store para rate limiting en producción

## Uso de las Funciones de Seguridad

### Rate Limiting para Google OAuth
\`\`\`typescript
import { googleOAuthRateLimit } from '@/lib/security/rateLimit'

export async function POST(request: NextRequest) {
  const rateLimitResult = await googleOAuthRateLimit(request)
  if (rateLimitResult) return rateLimitResult
  
  // Continuar con OAuth...
}
\`\`\`

### Autenticación con Google OAuth
\`\`\`typescript
import { requireAuth, requireAdmin, hasPermission } from '@/lib/security/auth'

export async function GET(request: NextRequest) {
  const user = await requireAuth(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Debes iniciar sesión con Google' }, 
      { status: 401 }
    )
  }
  
  // Usuario autenticado con Google...
}
\`\`\`

### Verificación de Permisos
\`\`\`typescript
const user = await requireAuth(request)
if (!hasPermission(user, 'DELETE_PRODUCT')) {
  return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
}
\`\`\`

## Checklist de Seguridad ✅

- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET cambiado en producción
- [ ] HTTPS configurado
- [ ] Rate limiting activado
- [ ] Headers de seguridad aplicados
- [ ] Validación en todos los endpoints
- [ ] Logging de seguridad configurado
- [ ] Backup automático configurado
- [ ] Monitoreo de errores activo
- [ ] Tests de seguridad ejecutados

## Próximos Pasos de Mejora

1. **Implementar 2FA** con Google Authenticator
2. **Integrar reCAPTCHA** en formularios críticos
3. **Usar Redis** para rate limiting distribuido
4. **Implementar CSRF tokens** para formularios
5. **Agregar IP geolocalización** para detección de anomalías
6. **Configurar WAF** (Web Application Firewall)
7. **Implementar audit logs** completos
8. **Tests de penetración** regulares

---

⚠️ **IMPORTANTE**: Esta es una implementación básica pero robusta. Para aplicaciones críticas, considera contratar un audit de seguridad profesional.
