"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Clock, MapPin, Copy, CreditCard, Download, Home, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCart } from '@/contexts/CartContext'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CheckoutPending() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, clearCart } = useCart()
  const { data: session } = useSession()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [orderCreated, setOrderCreated] = useState(false)
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false)

  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const externalReference = searchParams.get('external_reference')

  useEffect(() => {
    // Limpiar el carrito y crear orden
    if (state.items.length > 0 && !orderCreated) {
      createOrderAndClearCart()
    }

    if (paymentId) {
      setPaymentInfo({
        id: paymentId,
        status: status,
        reference: externalReference
      })
      
      // Obtener detalles del pago de MercadoPago
      fetchPaymentDetails(paymentId)
    }
  }, [paymentId, status, externalReference, state.items, orderCreated])

  const fetchPaymentDetails = async (paymentId: string) => {
    setLoadingPaymentDetails(true)
    try {
      const response = await fetch(`/api/mercadopago/payment-status?payment_id=${paymentId}`)
      if (response.ok) {
        const details = await response.json()
        setPaymentDetails(details)
      }
    } catch (error) {
      console.error('Error fetching payment details:', error)
    } finally {
      setLoadingPaymentDetails(false)
    }
  }

  const createOrderAndClearCart = async () => {
    if (!session?.user?.email || state.items.length === 0) return

    try {
      const orderData = {
        items: state.items.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '/placeholder.jpg'
        })),
        total: state.total,
        shippingAddress: {
          street: 'Dirección por actualizar',
          city: 'Ciudad por actualizar',
          state: 'Estado por actualizar',
          zipCode: '00000',
          country: 'Argentina'
        },
        paymentStatus: 'pending',
        paymentId: paymentId || '',
        paymentMethod: 'mercadopago'
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        clearCart()
        setOrderCreated(true)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      clearCart()
      setOrderCreated(true)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Código copiado al portapapeles')
  }

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      'pagofacil': 'Pago Fácil',
      'rapipago': 'Rapipago',
      'bapropagos': 'Bapro Pagos',
      'redlink': 'Red Link',
      'carga_virtual': 'Carga Virtual',
      'pix': 'PIX',
      'bank_transfer': 'Transferencia Bancaria'
    }
    return methods[method] || 'Efectivo'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 dark:bg-orange-900/20 rounded-full p-4">
            <Clock className="w-16 h-16 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ¡Pago Pendiente!
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Tu pedido ha sido registrado exitosamente. Para completar el pago, dirígete a cualquier punto de pago con el código que aparece abajo.
        </p>

        {/* Loading state para detalles del pago */}
        {loadingPaymentDetails && paymentId && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 justify-center">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-blue-800 dark:text-blue-200">
                Obteniendo código de pago...
              </span>
            </div>
          </div>
        )}

        {/* Código de pago */}
        {paymentDetails && (
          <div className="bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Código de Pago
              </h3>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-4">
              <div className="text-3xl font-mono font-bold text-orange-800 dark:text-orange-200 mb-2">
                {paymentId}
              </div>
              <Button
                onClick={() => copyToClipboard(paymentId || '')}
                variant="outline"
                size="sm"
                className="mx-auto"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Código
              </Button>
            </div>

            <div className="text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Método de pago:</span>
                <span className="font-semibold">
                  {getPaymentMethodName(paymentDetails.payment_method)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Monto a pagar:</span>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  ${paymentDetails.transaction_amount?.toLocaleString('es-AR')} {paymentDetails.currency_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vencimiento:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  3 días desde hoy
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="text-left">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                ¿Cómo completar el pago?
              </h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
                <li>Dirígete a cualquier {paymentDetails ? getPaymentMethodName(paymentDetails.payment_method) : 'punto de pago'}</li>
                <li>Presenta el código: <strong>{paymentId}</strong></li>
                <li>Paga el monto: <strong>${paymentDetails?.transaction_amount?.toLocaleString('es-AR')} ARS</strong></li>
                <li>Guarda tu comprobante de pago</li>
                <li>Procesaremos tu pedido una vez confirmado el pago</li>
              </ol>
            </div>
          </div>

          <div className="text-xs text-blue-600 dark:text-blue-300 mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded">
            <strong>Importante:</strong> Tienes 3 días para realizar el pago. Después de este tiempo, deberás realizar un nuevo pedido.
          </div>
        </div>

        {/* Información del pedido */}
        {paymentInfo && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Información del Pedido
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">ID de Pago:</span>
                <span className="font-mono">{paymentInfo.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  Pendiente de Pago
                </span>
              </div>
              {paymentInfo.reference && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Referencia:</span>
                  <span className="font-mono">{paymentInfo.reference}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
              <Link href="/orders">
                <Package className="w-4 h-4 mr-2" />
                Ver mis pedidos
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/shop">
                Seguir comprando
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Ir al inicio
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¿Problemas con tu pago? {' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contáctanos
            </Link> {' '} 
            o consulta el estado en {' '}
            <Link href="/orders" className="text-blue-600 hover:underline">
              mis pedidos
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
