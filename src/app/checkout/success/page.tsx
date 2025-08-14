"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCart } from '@/contexts/CartContext'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Link from 'next/link'

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, clearCart } = useCart()
  const { data: session, status } = useSession()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [orderCreated, setOrderCreated] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<Record<string, unknown> | null>(null)
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false)
  const [checkoutData, setCheckoutData] = useState<any>(null)

  const paymentId = searchParams.get('payment_id')
  const status_param = searchParams.get('status')
  const externalReference = searchParams.get('external_reference')

  console.log('CheckoutSuccess render:', {
    sessionStatus: status,
    hasSession: !!session,
    userEmail: session?.user?.email,
    itemsLength: state.items.length,
    orderCreated
  })

  useEffect(() => {
    console.log('=== MAIN EFFECT TRIGGERED ===')
    console.log('Session status:', status, 'Session:', !!session)
    
    // No hacer nada hasta que la sesión se haya cargado
    if (status === 'loading') {
      console.log('Session is loading, waiting...')
      return
    }

    // Recuperar datos del checkout desde sessionStorage
    const savedCheckoutData = sessionStorage.getItem('byblue-checkout-data')
    if (savedCheckoutData) {
      try {
        const parsedData = JSON.parse(savedCheckoutData)
        setCheckoutData(parsedData)
        console.log('Checkout data recovered from sessionStorage:', parsedData)
        console.log('Checkout data details:', JSON.stringify(parsedData, null, 2))
      } catch (error) {
        console.error('Error parsing checkout data:', error)
      }
    } else {
      console.log('No checkout data found in sessionStorage')
    }

    console.log('Current state:', {
      itemsLength: state.items.length,
      orderCreated,
      sessionEmail: session?.user?.email,
      paymentId
    })

    if (paymentId) {
      setPaymentInfo({
        id: paymentId,
        status: status_param,
        reference: externalReference
      })
      
      // Obtener detalles del pago de MercadoPago
      fetchPaymentDetails(paymentId)
    }
  }, [paymentId, status_param, externalReference, session, status])

  // UseEffect separado para manejar la creación de la orden cuando todos los datos estén listos
  useEffect(() => {
    console.log('=== ORDER CREATION EFFECT TRIGGERED ===')
    console.log('Session status:', status)
    
    // No hacer nada si la sesión aún está cargando
    if (status === 'loading') {
      console.log('Session still loading, skipping order creation')
      return
    }
    
    // NUEVA CONDICIÓN: Solo crear la orden si el checkoutData ya está disponible
    // O si hemos esperado lo suficiente y no hay checkoutData
    const shouldCreateOrder = checkoutData !== null || (paymentId && !checkoutData)
    
    console.log('Checking conditions for order creation:', {
      hasSession: !!session?.user?.email,
      hasItems: state.items.length > 0,
      orderNotCreated: !orderCreated,
      hasPaymentId: !!paymentId,
      sessionStatus: status,
      hasCheckoutData: !!checkoutData,
      shouldCreateOrder
    })

    if (session?.user?.email && state.items.length > 0 && !orderCreated && paymentId && shouldCreateOrder) {
      console.log('All conditions met for order creation, calling createOrderAndClearCart')
      createOrderAndClearCart()
    } else {
      console.log('Order creation skipped. Detailed reasons:', {
        noSession: !session?.user?.email,
        sessionEmail: session?.user?.email,
        noItems: state.items.length === 0,
        itemsCount: state.items.length,
        orderAlreadyCreated: orderCreated,
        noPaymentId: !paymentId,
        paymentId: paymentId,
        sessionStatus: status,
        checkoutDataStatus: checkoutData ? 'available' : 'null',
        shouldCreateOrder
      })
    }
  }, [session, state.items, orderCreated, paymentId, status, checkoutData]) // Agregar checkoutData como dependencia

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
    console.log('=== createOrderAndClearCart STARTED ===')
    console.log('Session check:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      itemsCount: state.items.length
    })

    if (!session?.user?.email) {
      console.error('No user session found')
      return
    }

    if (state.items.length === 0) {
      console.error('No items in cart')
      return
    }

    console.log('=== PROCEEDING WITH ORDER CREATION ===')

    try {
        console.log('Creating order with data:', { 
        items: state.items, 
        checkoutData,
        paymentId,
        status: status_param 
      })
      
      console.log('=== CHECKOUT DATA ANALYSIS ===')
      console.log('checkoutData from state:', checkoutData)
      console.log('checkoutData exists:', !!checkoutData)
      console.log('checkoutData.shipping exists:', !!checkoutData?.shipping)
      console.log('checkoutData.shipping details:', checkoutData?.shipping)
      
      // Usar datos del checkout si están disponibles, si no usar valores por defecto
      const shipping = checkoutData?.shipping || {
        method: 'Envío estándar',
        type: 'standard',
        cost: 5000,
        address: {
          firstName: 'Por actualizar',
          lastName: 'Por actualizar',
          email: session.user.email,
          phone: 'Por actualizar',
          street: 'Por actualizar',
          number: '',
          apartment: '',
          city: 'Por actualizar',
          province: 'Por actualizar',
          postalCode: '0000',
          country: 'Argentina'
        }
      }

      console.log('=== FINAL SHIPPING DATA FOR ORDER CREATION ===')
      console.log('shipping object:', shipping)
      console.log('shipping method:', shipping.method)
      console.log('shipping type:', shipping.type)
      console.log('shipping cost:', shipping.cost)

      const payment = checkoutData?.payment || {
        method: 'mercadopago',
        mercadoPagoId: paymentId || '',
        externalReference: externalReference || '',
        status: 'approved'
      }

      const totals = checkoutData?.totals || {
        subtotal: state.total,
        shipping: shipping.cost,
        total: state.total + shipping.cost
      }

      // Crear la orden con el formato correcto según el modelo Order
      const orderData = {
        items: state.items.map(item => ({
          productId: item._id,
          name: item.name,
          brand: item.brand || 'Sin marca',
          category: item.category || 'General',
          image: item.image || '/placeholder.jpg',
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        shipping,
        payment,
        totals,
        notes: ''
      }

      console.log('Order data being sent:', orderData)

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      const result = await response.json()
      console.log('Order creation response:', result)

      if (response.ok && result.success) {
        // Limpiar el carrito después de crear la orden exitosamente
        clearCart()
        setOrderCreated(true)
        
        // Limpiar datos del checkout de sessionStorage
        sessionStorage.removeItem('byblue-checkout-data')
        
        toast.success('¡Orden creada exitosamente!')
        console.log('Order created successfully:', result.order)
      } else {
        console.error('Error creating order:', result)
        throw new Error(result.error || 'Error creating order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Error al crear la orden, pero tu pago fue exitoso')
      
      // Aún así limpiar el carrito si el pago fue exitoso
      clearCart()
      setOrderCreated(true)
      
      // Limpiar datos del checkout de sessionStorage
      sessionStorage.removeItem('byblue-checkout-data')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {status === 'loading' ? (
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Cargando...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Estamos procesando tu compra
          </p>
        </Card>
      ) : (
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
      )}
    </div>
  )
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Cargando...
          </h1>
        </Card>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
