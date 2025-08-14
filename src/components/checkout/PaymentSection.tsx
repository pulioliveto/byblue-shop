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
  const cartItems = state.items
  const customerData = {
    name: shippingData?.personalInfo?.firstName || '',
    surname: shippingData?.personalInfo?.lastName || '',
    email: shippingData?.personalInfo?.email || '',
    phone: shippingData?.personalInfo?.phone || ''
  }
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mercadopago'>('mercadopago')
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

  // Función para iniciar polling de verificación de pago
  const startPaymentPolling = (preferenceId: string) => {
    console.log('=== STARTING PAYMENT POLLING ===')
    console.log('Preference ID for polling:', preferenceId)
    let attempts = 0
    const maxAttempts = 40 // 2 minutos máximo (40 * 3 segundos)
    
    const timer = setInterval(async () => {
      attempts++
      console.log(`=== POLLING ATTEMPT ${attempts}/${maxAttempts} ===`)
      
      try {
        const success = await checkPaymentByPreference(preferenceId)
        console.log('Polling result:', success)
        
        if (success) {
          console.log('=== PAYMENT DETECTED BY POLLING - STOPPING TIMER ===')
          clearInterval(timer)
          setPaymentCheckTimer(null)
          return
        }
        
        if (attempts >= maxAttempts) {
          console.log('=== PAYMENT POLLING TIMEOUT REACHED ===')
          clearInterval(timer)
          setPaymentCheckTimer(null)
          setIsWaitingForPayment(false)
          toast.info('No detectamos el pago automáticamente. Puedes verificar el estado en tus órdenes.')
        }
      } catch (error) {
        console.error('Error in payment polling:', error)
        if (attempts >= maxAttempts) {
          clearInterval(timer)
          setPaymentCheckTimer(null)
          setIsWaitingForPayment(false)
        }
      }
    }, 3000) // Cada 3 segundos
    
    setPaymentCheckTimer(timer)
    console.log('=== POLLING TIMER STARTED ===')
  }

  // Función para verificar pago por preference ID
  const checkPaymentByPreference = async (preferenceId: string): Promise<boolean> => {
    try {
      console.log('=== CHECKING PAYMENT BY PREFERENCE ===')
      console.log('Preference ID:', preferenceId)
      
      const response = await fetch(`/api/mercadopago/check-payment-by-preference?preference_id=${preferenceId}`)
      console.log('API Response status:', response.status, response.statusText)
      
      const result = await response.json()
      console.log('=== API RESPONSE DATA ===', result)
      
      if (result.found && result.payment) {
        const { payment_id: paymentId, status } = result.payment
        console.log('=== PAYMENT FOUND ===', { paymentId, status })
        
        // Redirigir según el estado
        if (status === 'approved') {
          console.log('=== PAYMENT APPROVED - REDIRECTING TO SUCCESS ===')
          toast.success('¡Pago completado exitosamente!')
          
          // Guardar datos completos del checkout en sessionStorage para la página de éxito
          console.log('=== POLLING: SHIPPING METHOD BEING SAVED ===', shippingMethod)
          console.log('=== POLLING: SHIPPING DATA BEING SAVED ===', shippingData)
          
          const checkoutData = {
            payment: {
              method: 'mercadopago',
              mercadoPagoId: paymentId.toString(),
              externalReference: preferenceId, // Este ahora será el external_reference
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
          console.log('Checkout data saved to sessionStorage:', checkoutData)
          
          const params = new URLSearchParams()
          params.set('payment_id', paymentId.toString())
          params.set('status', status)
          params.set('external_reference', preferenceId) // Este ahora será el external_reference
          
          const successUrl = `/checkout/success?${params.toString()}`
          console.log('=== REDIRECTING TO SUCCESS URL ===', successUrl)
          
          // Usar setTimeout para asegurar que la redirección se ejecute
          setTimeout(() => {
            window.location.href = successUrl
          }, 100)
          
          return true
        } else if (status === 'pending' || status === 'in_process') {
          console.log('=== PAYMENT PENDING - REDIRECTING ===')
          toast.info('Tu pago está pendiente de confirmación')
          const params = new URLSearchParams()
          params.set('payment_id', paymentId.toString())
          params.set('status', status)
          params.set('external_reference', preferenceId) // Este ahora será el external_reference
          
          setTimeout(() => {
            window.location.href = `/checkout/pending?${params.toString()}`
          }, 100)
          return true
        } else if (status === 'rejected' || status === 'cancelled') {
          console.log('=== PAYMENT REJECTED - REDIRECTING ===')
          toast.error('El pago fue rechazado')
          const params = new URLSearchParams()
          params.set('payment_id', paymentId.toString())
          params.set('status', status)
          params.set('external_reference', preferenceId) // Este ahora será el external_reference
          
          setTimeout(() => {
            window.location.href = `/checkout/failure?${params.toString()}`
          }, 100)
          return true
        }
      }
      
      console.log('=== NO PAYMENT FOUND OR PROCESSED YET ===')
      return false
    } catch (error) {
      console.error('=== ERROR CHECKING PAYMENT BY PREFERENCE ===', error)
      return false
    }
  }

  // Listener para el callback del popup de MercadoPago (respaldo)
  useEffect(() => {
    return () => {
      // Limpiar timer de polling si existe
      if (paymentCheckTimer) {
        clearInterval(paymentCheckTimer)
      }
      
      // Cerrar ventana de pago si existe
      if (paymentWindow) {
        paymentWindow.close()
      }
    }
  }, [paymentCheckTimer, paymentWindow])

  const processPayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Por favor selecciona un método de pago')
      return
    }

    setIsProcessing(true)

    try {
      // Solo procesamos MercadoPago
      if (selectedPaymentMethod === 'mercadopago') {
        // Crear preferencia de pago usando el formato que espera la API actual
        const items = cartItems.map(item => ({
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
        if (customerData.email) {
          payerData.email = String(customerData.email)
        }
        if (customerData.name) {
          payerData.name = String(customerData.name)
        }
        if (customerData.surname) {
          payerData.surname = String(customerData.surname)
        }
        if (customerData.phone) {
          payerData.phone = {
            area_code: '',
            number: String(customerData.phone)
          }
        }

        // Crear el objeto de preferencia
        const preferenceData = {
          items,
          payer: Object.keys(payerData).length > 0 ? payerData : undefined
        }

        const response = await fetch('/api/mercadopago/create-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferenceData)
        })

        if (!response.ok) {
          const errorData = await response.text()
          console.error('Error response:', errorData)
          throw new Error(`Error creating preference: ${response.status}`)
        }

        const data = await response.json()
        console.log('MercadoPago preference created:', data)

        if (data.sandbox_init_point || data.init_point) {
          const paymentUrl = data.sandbox_init_point || data.init_point
          const preferenceId = data.id
          const externalReference = data.external_reference // Este es el que necesitamos para el polling

          console.log('Opening payment popup:', paymentUrl)
          console.log('Preference ID:', preferenceId)
          console.log('External Reference:', externalReference)

          // Abrir popup de pago
          const popup = window.open(
            paymentUrl,
            'mercadopago_payment',
            'width=800,height=600,scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no'
          )

          if (!popup) {
            toast.error('Por favor permite las ventanas emergentes para continuar con el pago')
            setIsProcessing(false)
            return
          }

          // Mostrar estado de espera
          setIsWaitingForPayment(true)

          // Configurar listener para mensajes del popup
          const handlePopupMessage = async (event: MessageEvent) => {
            console.log('Received popup message:', event)
            
            if (event.origin !== window.location.origin && 
                !event.origin.includes('mercadopago') && 
                !event.origin.includes('mercadolibre')) {
              console.log('Ignoring message from unknown origin:', event.origin)
              return
            }

            if (event.data && typeof event.data === 'object') {
              const { type, payment_id, status, external_reference } = event.data

              if (type === 'payment_process' && payment_id) {
                console.log('Payment completed via popup message:', {
                  payment_id,
                  status,
                  external_reference
                })

                // Limpiar timer si existe
                if (paymentCheckTimer) {
                  clearInterval(paymentCheckTimer)
                  setPaymentCheckTimer(null)
                }

                window.removeEventListener('message', handlePopupMessage)
                popup?.close()

                // Procesar según el estado
                if (status === 'approved') {
                  toast.success('¡Pago completado exitosamente!')
                  
                  // Guardar datos del checkout
                  console.log('=== POPUP: SHIPPING METHOD BEING SAVED ===', shippingMethod)
                  console.log('=== POPUP: SHIPPING DATA BEING SAVED ===', shippingData)
                  
                  const checkoutData = {
                    payment: {
                      method: 'mercadopago',
                      mercadoPagoId: payment_id,
                      externalReference: external_reference || externalReference,
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
                  
                  const params = new URLSearchParams()
                  params.set('payment_id', payment_id)
                  params.set('status', status)
                  params.set('external_reference', external_reference || externalReference)
                  
                  window.location.href = `/checkout/success?${params.toString()}`
                } else if (status === 'pending' || status === 'in_process') {
                  toast.info('Tu pago está pendiente de confirmación')
                  const params = new URLSearchParams()
                  params.set('payment_id', payment_id)
                  params.set('status', status)
                  params.set('external_reference', external_reference || preferenceId)
                  
                  window.location.href = `/checkout/pending?${params.toString()}`
                } else if (status === 'rejected' || status === 'cancelled') {
                  toast.error('El pago fue rechazado')
                  setIsWaitingForPayment(false)
                  setIsProcessing(false)
                }
                return
              }
            }
          }

          // Agregar listener para mensajes
          window.addEventListener('message', handlePopupMessage)

          // Iniciar polling como respaldo
          console.log('=== SCHEDULING POLLING START IN 5 SECONDS ===')
          setTimeout(() => {
            console.log('=== STARTING POLLING NOW ===')
            startPaymentPolling(externalReference) // Usar external_reference en lugar de preferenceId
          }, 5000) // Esperar 5 segundos antes de iniciar polling

          // Detectar cuando se cierra el popup manualmente
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed)
              window.removeEventListener('message', handlePopupMessage)
              
              // Si no se completó el pago, continuar con polling por un tiempo
              setTimeout(() => {
                if (!window.location.pathname.includes('/checkout/success')) {
                  console.log('Popup closed without completion, continuing polling...')
                }
              }, 2000)
            }
          }, 1000)

        } else {
          throw new Error('No se pudo obtener la URL de pago de MercadoPago')
        }
      }

    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Error al procesar el pago. Por favor intenta nuevamente.')
      setIsProcessing(false)
      setIsWaitingForPayment(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await processPayment()
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
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id as 'mercadopago')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Icon className={`w-6 h-6 ${
                        selectedPaymentMethod === method.id
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`} />
                      <div>
                        <h4 className={`font-semibold ${
                          selectedPaymentMethod === method.id
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
