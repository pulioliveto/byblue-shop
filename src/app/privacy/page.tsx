import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Política de Privacidad
              </span>
            </h1>
            <p className="text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>

        <Card className="p-8 glass-effect">
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <div className="space-y-8">
              
              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                  <UserCheck className="w-6 h-6 mr-2" />
                  1. Introducción
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  En ByBlue Shop valoramos y respetamos su privacidad. Esta política explica cómo recopilamos, utilizamos, almacenamos y protegemos su información personal cuando utiliza nuestro sitio web y servicios.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                  <Database className="w-6 h-6 mr-2" />
                  2. Información que Recopilamos
                </h2>
                
                <h3 className="text-xl font-medium mb-3">Información Personal</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                  <li>Nombre completo</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono</li>
                  <li>Dirección de entrega</li>
                  <li>Información de pago (procesada de forma segura)</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Información de Navegación</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de navegación</li>
                  <li>Cookies y tecnologías similares</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">3. Cómo Utilizamos su Información</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p><strong>Para procesar sus pedidos:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Confirmar y procesar transacciones</li>
                    <li>Gestionar envíos y entregas</li>
                    <li>Enviar confirmaciones y actualizaciones de pedidos</li>
                  </ul>

                  <p><strong>Para mejorar nuestros servicios:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Analizar patrones de uso y preferencias</li>
                    <li>Personalizar su experiencia de compra</li>
                    <li>Desarrollar nuevos productos y servicios</li>
                  </ul>

                  <p><strong>Para comunicación:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Responder a consultas y solicitudes de soporte</li>
                    <li>Enviar actualizaciones sobre productos (solo si consiente)</li>
                    <li>Notificaciones importantes sobre su cuenta</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">4. Cookies y Tecnologías Similares</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Utilizamos cookies para:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio</li>
                    <li><strong>Cookies de rendimiento:</strong> Nos ayudan a entender cómo los usuarios interactúan con el sitio</li>
                    <li><strong>Cookies de funcionalidad:</strong> Recuerdan sus preferencias y configuraciones</li>
                  </ul>
                  <p>Puede controlar las cookies a través de la configuración de su navegador.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-2" />
                  5. Seguridad de la Información
                </h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Encriptación SSL/TLS para todas las transmisiones de datos</li>
                    <li>Sistemas de autenticación segura</li>
                    <li>Acceso restringido a información personal</li>
                    <li>Monitoreo regular de seguridad</li>
                    <li>Backups seguros y regulares</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">6. Compartir Información con Terceros</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Solo compartimos su información con terceros en las siguientes circunstancias:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Procesadores de pago:</strong> MercadoPago para procesar transacciones</li>
                    <li><strong>Servicios de envío:</strong> Empresas de logística para entregas</li>
                    <li><strong>Proveedores de servicios:</strong> Que nos ayudan a operar el sitio web</li>
                    <li><strong>Requerimientos legales:</strong> Cuando sea requerido por ley</li>
                  </ul>
                  <p><strong>Nunca vendemos su información personal a terceros.</strong></p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-2" />
                  7. Sus Derechos
                </h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Tiene derecho a:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Acceso:</strong> Solicitar una copia de su información personal</li>
                    <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                    <li><strong>Eliminación:</strong> Solicitar la eliminación de su información</li>
                    <li><strong>Portabilidad:</strong> Recibir su información en un formato estructurado</li>
                    <li><strong>Oposición:</strong> Oponerse al procesamiento de su información</li>
                    <li><strong>Limitación:</strong> Solicitar la limitación del procesamiento</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">8. Retención de Datos</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Conservamos su información personal solo durante el tiempo necesario para:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Cumplir con los fines para los que fue recopilada</li>
                    <li>Cumplir con obligaciones legales y contables</li>
                    <li>Resolver disputas y hacer cumplir nuestros acuerdos</li>
                  </ul>
                  <p>Generalmente, conservamos los datos de cuenta durante 7 años después de la última actividad.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">9. Transferencias Internacionales</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Sus datos se procesan principalmente en Argentina. En caso de transferencias internacionales, nos aseguramos de que existan garantías adecuadas para proteger su información.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">10. Menores de Edad</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos intencionalmente información personal de menores sin el consentimiento de los padres o tutores.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">11. Cambios en esta Política</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos actualizar esta política periódicamente. Los cambios significativos serán notificados a través de nuestro sitio web o por correo electrónico.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">12. Contacto</h2>
                <div className="text-muted-foreground leading-relaxed">
                  <p className="mb-4">Para ejercer sus derechos o consultas sobre esta política, contáctenos:</p>
                  <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                    <p><strong>Email:</strong> privacy@byblue.shop</p>
                    <p><strong>WhatsApp:</strong> +54 2281 356862</p>
                    <p><strong>Página de contacto:</strong> <Link href="/contact" className="text-primary hover:underline">byblue.shop/contact</Link></p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-white">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
