"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, Instagram, Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/components/animations/variants'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Crear mensaje de WhatsApp con los datos del formulario
    const whatsappMessage = `Hola! Me contacto desde la web de ByBlue Shop.

Nombre: ${formData.name}
Email: ${formData.email}
Asunto: ${formData.subject}

Mensaje:
${formData.message}`

    const whatsappUrl = `https://wa.me/542281356862?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 pt-20">
      <motion.div 
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div className="text-center mb-16" variants={fadeInUp}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Contactanos
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Estamos aquí para ayudarte. Ponte en contacto con nosotros a través de cualquiera de nuestros canales.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Información de contacto */}
          <motion.div className="space-y-8" variants={fadeInUp}>
            <Card className="p-8 glass-effect">
              <h2 className="text-2xl font-bold mb-6 text-primary">Información de Contacto</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">WhatsApp</h3>
                    <p className="text-muted-foreground mb-2">Respuesta inmediata</p>
                    <Button
                      asChild
                      className="bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      <a
                        href="https://wa.me/542281356862?text=Hola! Me interesa conocer más sobre sus productos."
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        +54 2281 356862
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Instagram className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Instagram</h3>
                    <p className="text-muted-foreground mb-2">Síguenos para novedades</p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-pink-500 text-pink-500 hover:bg-pink-50"
                    >
                      <a
                        href="https://instagram.com/byblue.shop"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        @byblue.shop
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground mb-2">Consultas generales</p>
                    <p className="text-sm text-primary">info@byblue.shop</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Horarios de Atención</h3>
                    <div className="text-muted-foreground text-sm space-y-1">
                      <p>Lunes a Viernes: 9:00 - 18:00</p>
                      <p>Sábados: 9:00 - 13:00</p>
                      <p>Domingos: Cerrado</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 glass-effect">
              <h3 className="text-xl font-semibold mb-4">¿Por qué elegir ByBlue Shop?</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Productos originales con garantía oficial</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Envíos seguros a todo el país</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Atención personalizada y especializada</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Más de 5 años de experiencia</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Formulario de contacto */}
          <motion.div variants={fadeInUp}>
            <Card className="p-8 glass-effect">
              <h2 className="text-2xl font-bold mb-6 text-primary">Envíanos un Mensaje</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Nombre *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Asunto *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Cuéntanos tu consulta en detalle..."
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold group"
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Enviar por WhatsApp
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Al enviar este formulario, serás redirigido a WhatsApp con tu mensaje pre-cargado.
                </p>
              </form>
            </Card>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div className="text-center mt-16" variants={fadeInUp}>
          <Card className="p-8 glass-effect bg-gradient-to-r from-primary/10 to-accent/10">
            <h3 className="text-2xl font-bold mb-4">¿Listo para encontrar tu próximo dispositivo?</h3>
            <p className="text-muted-foreground mb-6">
              Explora nuestra colección de productos premium y encuentra exactamente lo que necesitas.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-white">
              <a href="/shop">Ver Productos</a>
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
