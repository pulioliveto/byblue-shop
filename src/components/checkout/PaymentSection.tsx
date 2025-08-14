"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { CreditCard, Shield, Banknote, Building2, ExternalLink } from "lucide-react"
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

export interface PaymentData {
  method: 'card' | 'transfer' | 'mercadopago'
  cardData?: {
    number: string
    name: string
    expiry: string
    cvv: string
  }
}

const paymentMethods = [
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    description: 'Tarjetas, efectivo, transferencia',
    icon: CreditCard,
    popular: true
  },
  {
    id: 'card',
    name: 'Tarjeta de Crédito/Débito',
    description: 'Visa, Mastercard, American Express',
    icon: CreditCard,
    popular: false
  },
  {
    id: 'transfer',
    name: 'Transferencia Bancaria',
    description: 'CBU/CVU/Alias',
    icon: Building2,
    popular: false
  }
]

export default function PaymentSection({ onSubmit, shippingData, shippingMethod, orderTotal }: PaymentSectionProps) {
  const { state } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'mercadopago'>('mercadopago')
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null)
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false)
  const [preferenceId, setPreferenceId] = useState<string>('')
  const [paymentCheckTimer, setPaymentCheckTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('=== PAYMENT MESSAGE RECEIVED ===')
      console.log('Event origin:', event.origin)
      console.log('Window origin:', window.location.origin)
      console.log('Message data:', event.data)
      
      // Verificar que el mensaje venga de nuestro dominio
      if (event.origin !== window.location.origin) {
        console.log('Message rejected - wrong origin')
        return
      }
      
      if (event.data.type === 'MERCADOPAGO_PAYMENT_RESULT') {
        console.log('Processing MercadoPago payment result')
        const { paymentId, status, externalReference, success, isPending } = event.data.data
        
        console.log('Payment data:', { paymentId, status, externalReference, success, isPending })
        
        setIsWaitingForPayment(false)
        setPaymentWindow(null)
        
        if (success) {
          toast.success('¡Pago completado exitosamente!')
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

  const validateCardData = () => {
    const newErrors: Record<string, string> = {}

    if (paymentMethod === 'card') {
      if (!cardData.number.replace(/\s/g, '').match(/^\d{16}$/)) {
        newErrors['number'] = 'Número de tarjeta inválido'
      }
      if (!cardData.name.trim()) {
        newErrors['name'] = 'Nombre del titular requerido'
      }
      if (!cardData.expiry.match(/^\d{2}\/\d{2}$/)) {
        newErrors['expiry'] = 'Fecha inválida (MM/YY)'
      }
      if (!cardData.cvv.match(/^\d{3,4}$/)) {
        newErrors['cvv'] = 'CVV inválido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (paymentMethod === 'card' && !validateCardData()) {
      toast.error('Por favor completa correctamente los datos de la tarjeta')
      return
    }

    setIsProcessing(true)

    try {
      if (paymentMethod === 'mercadopago') {
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

        const response = await fetch('/api/mercadopago/create-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferenceData)
        })

        const data = await response.json()

        if (response.ok) {
          console.log('=== OPENING MERCADOPAGO POPUP ===')
          console.log('MercadoPago URL:', data.init_point)
          console.log('Preference ID:', data.id)
          console.log('External Reference:', data.external_reference)
          
          // Guardar el preference ID para checking
          setPreferenceId(data.external_reference || data.id)
          
          // Para testing, también permitir redirección directa presionando Shift
          if (window.event && (window.event as KeyboardEvent).shiftKey) {
            console.log('Shift key detected, redirecting directly instead of popup')
            window.location.href = data.init_point
            return
          }
          
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
            
            // Iniciar polling para verificar el estado del pago
            startPaymentPolling(data.external_reference || data.id)
            
            // Monitorear cuando se cierra la ventana
            const timer = setInterval(() => {
              if (newWindow.closed) {
                console.log('Popup window was closed')
                clearInterval(timer)
                setIsWaitingForPayment(false)
                setPaymentWindow(null)
                
                // Dar un poco más de tiempo para el polling
                setTimeout(() => {
                  checkPaymentStatus()
                }, 2000)
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
          console.error('Error from MercadoPago API:', data)
          throw new Error(data.error || 'Error creando preferencia de pago')
        }
      } else {
        // Simular procesamiento para otros métodos
        await new Promise(resolve => setTimeout(resolve, 2000))

        const paymentData: PaymentData = {
          method: paymentMethod,
          ...(paymentMethod === 'card' && { cardData })
        }

        onSubmit(paymentData)
        toast.success('¡Pago procesado correctamente!')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error(error instanceof Error ? error.message : 'Error al procesar el pago')
    } finally {
      if (paymentMethod !== 'mercadopago' || !paymentWindow) {
        setIsProcessing(false)
      }
    }
  }

  const checkPaymentStatus = async () => {
    console.log('=== CHECKING PAYMENT STATUS ===')
    try {
      // En este punto, si la ventana se cerró sin mensaje, puede que el usuario haya cerrado manualmente
      // o que haya habido un problema con la comunicación
      toast.info('Verificando el estado de tu pago...', {
        duration: 3000
      })
      
      // Si tenemos preference ID, verificar el estado del pago
      if (preferenceId) {
        console.log('Checking preference:', preferenceId)
        checkPaymentByPreference(preferenceId)
      } else {
        // Simular verificación después de 3 segundos
        setTimeout(() => {
          console.log('Payment status check completed')
          toast.info('Si completaste el pago, serás redirigido automáticamente. Si no, puedes intentar nuevamente.', {
            duration: 5000
          })
        }, 3000)
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }

  const startPaymentPolling = (preferenceId: string) => {
    console.log('Starting payment polling for:', preferenceId)
    
    // Verificar cada 3 segundos por hasta 2 minutos
    let attempts = 0
    const maxAttempts = 40 // 2 minutos
    
    const timer = setInterval(async () => {
      attempts++
      console.log(`Payment polling attempt ${attempts}/${maxAttempts}`)
      
      try {
        const success = await checkPaymentByPreference(preferenceId)
        if (success || attempts >= maxAttempts) {
          clearInterval(timer)
          setPaymentCheckTimer(null)
          if (!success && attempts >= maxAttempts) {
            console.log('Payment polling timeout')
          }
        }
      } catch (error) {
        console.error('Error in polling:', error)
      }
    }, 3000)
    
    setPaymentCheckTimer(timer)
  }

  const checkPaymentByPreference = async (preferenceId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/mercadopago/check-preference?preference_id=${preferenceId}`)
      const data = await response.json()
      
      console.log('Payment check result:', data)
      
      if (data.found && data.payment) {
        const { status, id: paymentId } = data.payment
        console.log('Payment found:', { status, paymentId })
        
        // Limpiar el polling
        if (paymentCheckTimer) {
          clearInterval(paymentCheckTimer)
          setPaymentCheckTimer(null)
        }
        
        // Redirigir según el estado
        if (status === 'approved') {
          toast.success('¡Pago completado exitosamente!')
          const params = new URLSearchParams()
          params.set('payment_id', paymentId.toString())
          params.set('status', status)
          params.set('external_reference', preferenceId)
          
          window.location.href = `/checkout/success?${params.toString()}`
          return true
        } else if (status === 'pending' || status === 'in_process') {
          toast.info('Tu pago está pendiente de confirmación')
          const params = new URLSearchParams()
          params.set('payment_id', paymentId.toString())
          params.set('status', status)
          params.set('external_reference', preferenceId)
          
          window.location.href = `/checkout/pending?${params.toString()}`
          return true
        } else if (status === 'rejected' || status === 'cancelled') {
          toast.error('El pago fue rechazado')
          const params = new URLSearchParams()
          params.set('payment_id', paymentId.toString())
          params.set('status', status)
          params.set('external_reference', preferenceId)
          
          window.location.href = `/checkout/failure?${params.toString()}`
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Error checking payment by preference:', error)
      return false
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <div className="space-y-6">
      {/* Resumen del pedido */}
      {shippingData && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Resumen de tu pedido
          </h4>
          <div className="text-sm space-y-1">
            <p><strong>Nombre:</strong> {shippingData.personalInfo.firstName} {shippingData.personalInfo.lastName}</p>
            <p><strong>Email:</strong> {shippingData.personalInfo.email}</p>
            <p><strong>Teléfono:</strong> {shippingData.personalInfo.phone}</p>
            
            {shippingData.shippingMethod !== 'pickup' ? (
              <p><strong>Dirección:</strong> {shippingData.address.street} {shippingData.address.number}, {shippingData.address.city}, {shippingData.address.province}</p>
            ) : (
              <p><strong>Método:</strong> Retiro en sucursal</p>
            )}
            
            <div className="pt-3 border-t border-gray-300 dark:border-gray-600 mt-3 space-y-2">
              <div className="flex justify-between">
                <span>Productos:</span>
                <span>{formatPrice(orderTotal - shippingMethod.cost)}</span>
              </div>
              <div className="flex justify-between">
                <span>{shippingMethod.name}:</span>
                <span>{shippingMethod.cost === 0 ? 'Gratis' : formatPrice(shippingMethod.cost)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-green-600 dark:text-green-400 pt-2 border-t border-gray-300 dark:border-gray-600">
                <span>Total a pagar:</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métodos de pago */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Método de Pago
        </h3>

        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <Card
                key={method.id}
                className={`p-4 cursor-pointer transition-all relative ${
                  paymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod(method.id as any)}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-6 h-6 ${
                    paymentMethod === method.id
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{method.name}</h4>
                      {method.popular && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Recomendado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                  <div className={`w-4 h-4 border-2 rounded-full ${
                    paymentMethod === method.id
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Formulario según método de pago */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {paymentMethod === 'mercadopago' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 rounded-lg p-2">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Pago con MercadoPago
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {isWaitingForPayment 
                    ? 'Completa tu pago en la ventana de MercadoPago que se abrió'
                    : 'Se abrirá una nueva ventana para completar tu pago de forma segura'
                  }
                </p>
              </div>
            </div>
            
            {isWaitingForPayment && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                  <span className="text-orange-800 dark:text-orange-200 font-medium">
                    Esperando confirmación de pago...
                  </span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Complete su pago en la ventana de MercadoPago. No cierre esta página hasta confirmar el pago.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (paymentWindow && !paymentWindow.closed) {
                      paymentWindow.focus()
                    }
                  }}
                  className="mt-2 text-sm text-orange-600 hover:text-orange-800 underline"
                >
                  Volver a la ventana de pago
                </button>
              </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total a pagar:</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatPrice(orderTotal)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Incluye productos ({formatPrice(orderTotal - shippingMethod.cost)}) + {shippingMethod.name.toLowerCase()} ({shippingMethod.cost === 0 ? 'gratis' : formatPrice(shippingMethod.cost)})
              </p>
            </div>

            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Tarjetas de crédito y débito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Transferencia bancaria</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Pago en efectivo (Rapipago, Pago Fácil)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Hasta 12 cuotas sin interés</span>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Tarjeta *
                </label>
                <Input
                  type="text"
                  value={cardData.number}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    number: formatCardNumber(e.target.value) 
                  }))}
                  className={errors['number'] ? 'border-red-500' : ''}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                {errors['number'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['number']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Titular *
                </label>
                <Input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    name: e.target.value.toUpperCase() 
                  }))}
                  className={errors['name'] ? 'border-red-500' : ''}
                  placeholder="JUAN PÉREZ"
                />
                {errors['name'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['name']}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vencimiento *
                  </label>
                  <Input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => setCardData(prev => ({ 
                      ...prev, 
                      expiry: formatExpiry(e.target.value) 
                    }))}
                    className={errors['expiry'] ? 'border-red-500' : ''}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  {errors['expiry'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['expiry']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVV *
                  </label>
                  <Input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => setCardData(prev => ({ 
                      ...prev, 
                      cvv: e.target.value.replace(/\D/g, '').substring(0, 4) 
                    }))}
                    className={errors['cvv'] ? 'border-red-500' : ''}
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors['cvv'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['cvv']}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'transfer' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Transferencia Bancaria
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Realiza la transferencia a nuestra cuenta bancaria
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Banco:</span>
                <span className="font-medium">Banco Nación</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">CBU:</span>
                <span className="font-mono">0110599520000012345678</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Alias:</span>
                <span className="font-mono">BYBLUE.SHOP.MP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Titular:</span>
                <span className="font-medium">ByBlue Shop S.A.</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 mt-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Importe:</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatPrice(orderTotal)}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Una vez realizada la transferencia, envía el comprobante a pedidos@byblue-shop.com con tu número de pedido.
            </p>
          </div>
        )}

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
                {paymentMethod === 'mercadopago' ? 'Abriendo ventana de pago...' : 'Procesando...'}
              </div>
            ) : isWaitingForPayment ? (
              <div className="flex items-center gap-2">
                <div className="animate-pulse w-4 h-4 bg-white rounded-full"></div>
                Esperando pago en MercadoPago...
              </div>
            ) : paymentMethod === 'mercadopago' ? (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Pagar con MercadoPago - {formatPrice(orderTotal)}
              </div>
            ) : (
              `Pagar ${formatPrice(orderTotal)}`
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
