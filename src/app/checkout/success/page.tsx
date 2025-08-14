"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCart } from '@/contexts/CartContext'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function CheckoutSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, clearCart } = useCart()
  const { data: session } = useSession()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [orderCreated, setOrderCreated] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false)

  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const externalReference = searchParams.get('external_reference')

  useEffect(() => {
    // Limpiar el carrito inmediatamente cuando llegue a esta página
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
      // Crear la orden en la base de datos
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
        paymentStatus: 'completed',
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
        // Limpiar el carrito después de crear la orden exitosamente
        clearCart()
        setOrderCreated(true)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      // Aún así limpiar el carrito si el pago fue exitoso
      clearCart()
      setOrderCreated(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ¡Pago exitoso!
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Tu compra ha sido procesada correctamente. Recibirás un email de confirmación con los detalles de tu pedido.
        </p>

        {paymentInfo && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Detalles de tu compra
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">ID de Pago:</span>
                <span className="font-mono">{paymentInfo.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Aprobado
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

        {/* Detalles completos de MercadoPago */}
        {paymentDetails && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Factura de MercadoPago
              </h3>
              {paymentDetails.receipt_url && (
                <a
                  href={paymentDetails.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Ver Factura Completa
                </a>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                  <span className="font-semibold">
                    ${paymentDetails.transaction_amount?.toLocaleString('es-AR')} {paymentDetails.currency_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Método:</span>
                  <span className="capitalize">{paymentDetails.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cuotas:</span>
                  <span>{paymentDetails.installments}x</span>
                </div>
                {paymentDetails.date_approved && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                    <span>{new Date(paymentDetails.date_approved).toLocaleDateString('es-AR')}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {paymentDetails.payer && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span>{paymentDetails.payer.email}</span>
                    </div>
                    {paymentDetails.payer.first_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                        <span>{paymentDetails.payer.first_name} {paymentDetails.payer.last_name}</span>
                      </div>
                    )}
                  </>
                )}
                {paymentDetails.card && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tarjeta:</span>
                    <span>****{paymentDetails.card.last_four_digits}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading state para detalles del pago */}
        {loadingPaymentDetails && paymentId && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-blue-800 dark:text-blue-200">
                Obteniendo detalles de la factura de MercadoPago...
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                ¿Qué sigue?
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Prepararemos tu pedido y te notificaremos cuando esté listo para envío.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/orders">
                <Package className="w-4 h-4 mr-2" />
                Ver mis órdenes
              </Link>
            </Button>

            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/shop">
                <ArrowRight className="w-4 h-4 mr-2" />
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
            Si tienes alguna pregunta sobre tu pedido, no dudes en{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              contactarnos
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
