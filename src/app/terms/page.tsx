import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Shield, FileText, Users, Clock } from 'lucide-react'

export default function TermsPage() {
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
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Términos y Condiciones
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
                  <Users className="w-6 h-6 mr-2" />
                  1. Aceptación de los Términos
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Al acceder y utilizar el sitio web de ByBlue Shop, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">2. Descripción del Servicio</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  ByBlue Shop es una plataforma de comercio electrónico especializada en la venta de:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Smartphones y dispositivos móviles</li>
                  <li>Laptops y equipos informáticos</li>
                  <li>Accesorios tecnológicos</li>
                  <li>Productos electrónicos premium</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">3. Registro y Cuenta de Usuario</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Para realizar compras, debe crear una cuenta proporcionando información veraz y actualizada.</p>
                  <p>Es responsable de mantener la confidencialidad de su cuenta y contraseña.</p>
                  <p>Debe notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">4. Productos y Precios</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Todos los productos están sujetos a disponibilidad.</p>
                  <p>Los precios pueden cambiar sin previo aviso.</p>
                  <p>Las imágenes de los productos son ilustrativas.</p>
                  <p>Nos reservamos el derecho de limitar las cantidades de compra.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">5. Proceso de Compra y Pago</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Los pedidos están sujetos a confirmación y disponibilidad de stock.</p>
                  <p>Aceptamos los métodos de pago indicados en el sitio web.</p>
                  <p>Los pagos se procesan de forma segura a través de MercadoPago.</p>
                  <p>Los precios incluyen IVA cuando corresponda.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">6. Envíos y Entrega</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Los tiempos de entrega son estimados y pueden variar según la ubicación.</p>
                  <p>Los gastos de envío se calculan según el destino y método elegido.</p>
                  <p>Ofrecemos la opción de retiro en sucursal sin costo adicional.</p>
                  <p>No nos hacemos responsables por demoras causadas por terceros (correos, paqueterías).</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">7. Garantías y Devoluciones</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Todos los productos cuentan con garantía oficial del fabricante.</p>
                  <p>Puede solicitar cambios o devoluciones dentro de los 30 días posteriores a la compra.</p>
                  <p>Los productos deben estar en perfectas condiciones y con embalaje original.</p>
                  <p>Los gastos de envío por devoluciones corren por cuenta del cliente, excepto por defectos de fábrica.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  8. Privacidad y Protección de Datos
                </h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>Respetamos su privacidad y protegemos sus datos personales.</p>
                  <p>Solo recopilamos información necesaria para procesar sus pedidos.</p>
                  <p>No compartimos su información con terceros sin su consentimiento.</p>
                  <p>Para más detalles, consulte nuestra <Link href="/privacy" className="text-primary hover:underline">Política de Privacidad</Link>.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">9. Limitación de Responsabilidad</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>ByBlue Shop no se hace responsable por daños indirectos o consecuenciales.</p>
                  <p>Nuestra responsabilidad se limita al valor del producto adquirido.</p>
                  <p>No garantizamos la disponibilidad ininterrumpida del sitio web.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">10. Modificaciones</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones serán efectivas desde su publicación en el sitio web.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">11. Contacto</h2>
                <div className="text-muted-foreground leading-relaxed">
                  <p className="mb-2">Para consultas sobre estos términos, puede contactarnos:</p>
                  <ul className="space-y-2">
                    <li>• WhatsApp: +54 2281 356862</li>
                    <li>• Email: info@byblue.shop</li>
                    <li>• Página de contacto: <Link href="/contact" className="text-primary hover:underline">byblue.shop/contact</Link></li>
                  </ul>
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
