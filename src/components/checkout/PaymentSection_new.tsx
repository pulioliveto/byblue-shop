"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreditCard, Shield, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import { ShippingData } from "./ShippingForm"
import { useCart } from "@/contexts/CartContext"

interface PaymentSectionProps {
  onSubmit: (data: PaymentData) => void
  shippingData: ShippingData | null
  shippingMethod: {
    type: string
    cost: number
    name: string
  }
  orderTotal: number
}

interface PaymentData {
  method: string
}

const paymentMethods = [
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    description: 'Tarjetas, efectivo, transferencia bancaria y más',
    icon: CreditCard,
    popular: true
  }
]

export default function PaymentSection({ onSubmit, shippingData, shippingMethod, orderTotal }: PaymentSectionProps) {
  console.log("=== PAYMENT SECTION PROPS ===", { shippingData, shippingMethod, orderTotal })
  
  const { state } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago'>('mercadopago')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false)
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null)
  const [preferenceId, setPreferenceId] = useState<string>('')
  const [paymentCheckTimer, setPaymentCheckTimer] = useState<NodeJS.Timeout | null>(null)

  // Limpiar cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (paymentCheckTimer) {
        clearInterval(paymentCheckTimer)
      }
    }
  }, [])

  // Listener para el callback del popup de MercadoPago
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('=== POPUP CALLBACK RECEIVED ===', event.data)
      
      if (event.origin !== 'https://www.mercadopago.com.ar') {
        console.log('Message from unknown origin:', event.origin)
        return
      }

      const { paymentId, status, externalReference } = event.data

      if (paymentId && status) {
        console.log('Payment data received from popup:', { paymentId, status, externalReference })
        
        const isSuccess = status === 'approved'
        const isPending = status === 'pending' || status === 'in_process'
        
        if (isSuccess) {
          toast.success('¡Pago completado exitosamente!')
          
          // Guardar datos completos del checkout en sessionStorage para la página de éxito
          console.log('=== CALLBACK: SHIPPING METHOD BEING SAVED ===', shippingMethod)
          console.log('=== CALLBACK: SHIPPING DATA BEING SAVED ===', shippingData)
          
          const checkoutData = {
            payment: {
              method: 'mercadopago',
              mercadoPagoId: paymentId,
              externalReference: externalReference,
              status: 'approved'
            },
            shipping: {
              method: shippingMethod.name || shippingMethod.type,
              type: shippingMethod.type,
              cost: shippingMethod.cost,
              address: shippingData || {}
            },
            totals: {
              subtotal: orderTotal - shippingMethod.cost,
              shipping: shippingMethod.cost,
              total: orderTotal
            }
          }
          
          sessionStorage.setItem('byblue-checkout-data', JSON.stringify(checkoutData))
          console.log('Checkout data saved to sessionStorage (callback):', checkoutData)
          
          // Redirigir a la página de éxito con los datos del pago
          const params = new URLSearchParams()
          if (paymentId) params.set('payment_id', paymentId)
          if (status) params.set('status', status)
          if (externalReference) params.set('external_reference', externalReference)
          
          const successUrl = `/checkout/success?${params.toString()}`
          console.log('Redirecting to success:', successUrl)
          window.location.href = successUrl
        } else if (isPending) {
          toast.info('Tu pago está pendiente. Te hemos generado un código para completarlo.')
          // Redirigir a la página de pago pendiente
          const params = new URLSearchParams()
          if (paymentId) params.set('payment_id', paymentId)
          if (status) params.set('status', status)
          if (externalReference) params.set('external_reference', externalReference)
          
          const pendingUrl = `/checkout/pending?${params.toString()}`
          console.log('Redirecting to pending:', pendingUrl)
          window.location.href = pendingUrl
        } else {
          console.log('Payment failed or rejected')
          toast.error('El pago no pudo ser procesado. Inténtalo nuevamente.')
        }
      }
    }

    console.log('Adding message event listener')
    window.addEventListener('message', handleMessage)
    
    return () => {
      console.log('Removing message event listener')
      window.removeEventListener('message', handleMessage)
      
      // Limpiar timer de polling si existe
      if (paymentCheckTimer) {
        clearInterval(paymentCheckTimer)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Crear preferencia de MercadoPago con datos validados
      const items = state.items.map(item => ({
        id: String(item._id),
        title: String(item.name || 'Producto'),
        description: `${item.brand || 'Sin marca'} - ${item.category || 'Sin categoría'}`,
        picture_url: item.image || '',
        category_id: item.category || 'others',
        quantity: Number(item.quantity) || 1,
        currency_id: 'ARS',
        unit_price: Number(item.price) || 0
      }))

      // Agregar el envío como un item adicional si tiene costo
      if (shippingMethod.cost > 0) {
        items.push({
          id: 'shipping',
          title: String(shippingMethod.name),
          description: 'Costo de envío',
          picture_url: '',
          category_id: 'shipping',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: Number(shippingMethod.cost)
        })
      }

      // Preparar datos del comprador
      const payerData: any = {}
      if (shippingData?.personalInfo?.email) {
        payerData.email = String(shippingData.personalInfo.email)
      }
      if (shippingData?.personalInfo?.firstName) {
        payerData.name = String(shippingData.personalInfo.firstName)
      }
      if (shippingData?.personalInfo?.lastName) {
        payerData.surname = String(shippingData.personalInfo.lastName)
      }
      if (shippingData?.personalInfo?.phone) {
        payerData.phone = {
          area_code: '',
          number: String(shippingData.personalInfo.phone)
        }
      }

      // Crear el objeto de preferencia
      const preferenceData = {
        items,
        payer: Object.keys(payerData).length > 0 ? payerData : undefined
      }

      console.log('=== SENDING TO MERCADOPAGO API ===')
      console.log('Items being sent:', JSON.stringify(items, null, 2))
      console.log('Payer being sent:', JSON.stringify(payerData, null, 2))
      console.log('Full preference data:', JSON.stringify(preferenceData, null, 2))

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferenceData)
      })

      console.log('=== MERCADOPAGO API RESPONSE ===')
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        console.log('=== OPENING MERCADOPAGO POPUP ===')
        console.log('MercadoPago URL:', data.init_point)
        console.log('Preference ID:', data.id)
        console.log('External Reference:', data.external_reference)
        
        // Guardar el preference ID para checking
        setPreferenceId(data.external_reference || data.id)
        
        // Abrir MercadoPago en nueva ventana
        const newWindow = window.open(
          data.init_point,
          'mercadopago',
          'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
        )
        
        if (newWindow) {
          console.log('Popup window opened successfully')
          setPaymentWindow(newWindow)
          setIsWaitingForPayment(true)
          setIsProcessing(false)
          
          // Monitorear cuando se cierra la ventana
          const timer = setInterval(() => {
            if (newWindow.closed) {
              console.log('Popup window was closed')
              clearInterval(timer)
              setIsWaitingForPayment(false)
              setPaymentWindow(null)
            }
          }, 1000)
        } else {
          console.error('Failed to open popup window')
          console.log('Popup blocked, redirecting directly')
          // Si el popup está bloqueado, redirigir directamente
          window.location.href = data.init_point
        }
        return
      } else {
        console.error('=== MERCADOPAGO ERROR RESPONSE ===')
        console.error('Error status:', response.status)
        console.error('Error data:', data)
        console.error('Error message:', data.error || 'Error desconocido')
        console.error('Error details:', data.details || 'Sin detalles')
        
        let errorMessage = 'Error creando preferencia de pago'
        if (data.error) {
          errorMessage = data.error
        }
        if (data.details) {
          errorMessage += ': ' + data.details
        }
        
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error(error instanceof Error ? error.message : 'Error al procesar el pago')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Métodos de pago */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Método de pago
          </h3>

          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <Card
                  key={method.id}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod(method.id as 'mercadopago')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Icon className={`w-6 h-6 ${
                        paymentMethod === method.id
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`} />
                      <div>
                        <h4 className={`font-semibold ${
                          paymentMethod === method.id
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {method.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {method.description}
                        </p>
                      </div>
                    </div>
                    {method.popular && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                        Recomendado
                      </span>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Información de MercadoPago */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                Pago seguro con MercadoPago
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Paga de forma segura con todos los medios de pago disponibles
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Shield className="w-4 h-4" />
                <span>Compra protegida</span>
              </div>
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <CreditCard className="w-4 h-4" />
                <span>Todas las tarjetas</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <span>💰</span>
                <span>Efectivo disponible</span>
              </div>
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <span>🏦</span>
                <span>Hasta 12 cuotas sin interés</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Resumen del pedido
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span>{formatPrice(orderTotal - shippingMethod.cost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Envío ({shippingMethod.name}):</span>
              <span>{shippingMethod.cost === 0 ? 'Gratis' : formatPrice(shippingMethod.cost)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2 mt-3">
              <span>Total:</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </div>

        {/* Botón de pago */}
        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            size="lg"
            disabled={isProcessing || isWaitingForPayment}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 min-w-[200px]"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Abriendo MercadoPago...
              </div>
            ) : isWaitingForPayment ? (
              <div className="flex items-center gap-2">
                <div className="animate-pulse w-4 h-4 bg-white rounded-full"></div>
                Esperando pago en MercadoPago...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Pagar con MercadoPago - {formatPrice(orderTotal)}
              </div>
            )}
          </Button>
        </div>
      </form>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Conexión SSL segura</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <CreditCard className="w-4 h-4 text-blue-600" />
          <span>Datos encriptados</span>
        </div>
      </div>
    </div>
  )
}
