"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { CreditCard, Shield, Banknote, Building2 } from "lucide-react"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import { ShippingData } from "./ShippingForm"

interface PaymentSectionProps {
  onSubmit: (data: PaymentData) => void
  shippingData: ShippingData | null
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

export default function PaymentSection({ onSubmit, shippingData, orderTotal }: PaymentSectionProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'mercadopago'>('mercadopago')
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

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
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000))

      const paymentData: PaymentData = {
        method: paymentMethod,
        ...(paymentMethod === 'card' && { cardData })
      }

      onSubmit(paymentData)
      toast.success('¡Pago procesado correctamente!')
    } catch (error) {
      toast.error('Error al procesar el pago')
    } finally {
      setIsProcessing(false)
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
            
            <div className="pt-2 border-t border-gray-300 dark:border-gray-600 mt-3">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                <strong>Total a pagar: {formatPrice(orderTotal)}</strong>
              </p>
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
                  Serás redirigido a MercadoPago para completar tu pago de forma segura
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total a pagar:</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatPrice(orderTotal)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Podrás pagar con tarjetas de crédito/débito, efectivo, transferencia bancaria y más
              </p>
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
            disabled={isProcessing}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 min-w-[200px]"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Procesando...
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
