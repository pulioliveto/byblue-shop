"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

const testCards = [
  {
    type: 'success',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    title: 'Pago Aprobado',
    cards: [
      {
        brand: 'Visa',
        number: '4509 9535 6623 3704',
        cvv: '123',
        expiry: '11/25',
        name: 'APRO'
      },
      {
        brand: 'Mastercard',
        number: '5031 7557 3453 0604',
        cvv: '123',
        expiry: '11/25', 
        name: 'APRO'
      }
    ]
  },
  {
    type: 'error',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    title: 'Pago Rechazado',
    cards: [
      {
        brand: 'Visa',
        number: '4013 5406 8274 6260',
        cvv: '123',
        expiry: '11/25',
        name: 'FUND',
        reason: 'Fondos insuficientes'
      },
      {
        brand: 'Mastercard',
        number: '5031 4332 1540 6351',
        cvv: '123',
        expiry: '11/25',
        name: 'SECU',
        reason: 'Código de seguridad inválido'
      }
    ]
  },
  {
    type: 'pending',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    title: 'Pago Pendiente',
    cards: [
      {
        brand: 'Visa',
        number: '4009 1753 3280 7176',
        cvv: '123',
        expiry: '11/25',
        name: 'PEND'
      }
    ]
  }
]

export default function TestingHelper() {
  const [isVisible, setIsVisible] = useState(false)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
  }

  // const fillCard = (cardData: Record<string, unknown>) => {
  //   // Función para llenar automáticamente los campos (si quieres implementar)
  //   toast.info('Puedes copiar cada campo individualmente')
  // }

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="sm"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Tarjetas de Prueba
        </Button>
      ) : (
        <Card className="w-96 max-h-96 overflow-y-auto p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Tarjetas de Prueba MercadoPago
            </h3>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            {testCards.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.type}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${category.color}`} />
                    <h4 className={`font-medium text-sm ${category.color}`}>
                      {category.title}
                    </h4>
                  </div>
                  
                  <div className="space-y-2">
                    {category.cards.map((card, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${category.bgColor} ${category.borderColor}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">{card.brand}</span>
                          {'reason' in card && (
                            <span className="text-xs text-gray-500">{card.reason}</span>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{card.number}</span>
                            <Button
                              onClick={() => copyToClipboard(card.number.replace(/\s/g, ''), 'Número')}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1">
                              <span>CVV: {card.cvv}</span>
                              <Button
                                onClick={() => copyToClipboard(card.cvv, 'CVV')}
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                              >
                                <Copy className="w-2 h-2" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <span>{card.expiry}</span>
                              <Button
                                onClick={() => copyToClipboard(card.expiry, 'Vencimiento')}
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                              >
                                <Copy className="w-2 h-2" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span>Nombre: {card.name}</span>
                            <Button
                              onClick={() => copyToClipboard(card.name, 'Nombre')}
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                            >
                              <Copy className="w-2 h-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            
            <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <strong>💡 Tips de Testing:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Para pagos en efectivo (PagoFácil, Rapipago), simplemente selecciona el método</li>
                <li>• Si el popup está bloqueado, se redirigirá automáticamente</li>
                <li>• Mantén presionado Shift al hacer clic en "Pagar" para redirección directa</li>
                <li>• Revisa la consola del navegador para ver logs detallados</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
