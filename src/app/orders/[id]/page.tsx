"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  User, 
  Calendar,
  CheckCircle,
  Clock,
  X,
  FileText,
  Download,
  Eye,
  Copy,
  Phone,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  const orderId = params.id

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.email) {
      router.push('/auth/signin')
      return
    }
    
    fetchOrderDetails()
  }, [orderId, session, status])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
        
        // Si tiene payment ID de MercadoPago, obtener detalles
        if (data.order.payment?.mercadoPagoId) {
          fetchPaymentDetails(data.order.payment.mercadoPagoId)
        }
      } else {
        toast.error('Error al cargar los detalles de la orden')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Error al cargar la orden')
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentDetails = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/mercadopago/payment-status?payment_id=${paymentId}`)
      if (response.ok) {
        const data = await response.json()
        setPaymentDetails(data)
      }
    } catch (error) {
      console.error('Error fetching payment details:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100 border-green-200'
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'shipped': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'delivered': return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle
      case 'pending': return Clock
      case 'shipped': return Truck
      case 'delivered': return Package
      case 'cancelled': return X
      default: return Package
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado'
      case 'pending': return 'Pendiente'
      case 'shipped': return 'Enviado'
      case 'delivered': return 'Entregado'
      case 'cancelled': return 'Cancelado'
      default: return 'Desconocido'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando detalles de la orden...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Orden no encontrada
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No se pudo encontrar la orden solicitada.
          </p>
          <Button asChild>
            <Link href="/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a mis órdenes
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(order.status)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Orden #{order.orderNumber}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Realizada el {new Date(order.createdAt).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${getStatusColor(order.status)}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="font-medium">{getStatusText(order.status)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Productos */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Productos ({order.items.length})
              </h2>

              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.brand} • {item.category}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Cantidad: {item.quantity}
                        </span>
                        <div className="text-right">
                          <p className="font-medium">
                            ${item.subtotal.toLocaleString('es-AR')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ${item.price.toLocaleString('es-AR')} c/u
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Información de Envío */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Información de Envío
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Método de Envío
                  </h3>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    {order.shipping.type === 'pickup' ? (
                      <MapPin className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Truck className="w-4 h-4 text-blue-600" />
                    )}
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {order.shipping.method}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {order.shipping.cost > 0 
                          ? `$${order.shipping.cost.toLocaleString('es-AR')}`
                          : 'Gratis'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {order.shipping.address && Object.keys(order.shipping.address).length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      Dirección de Entrega
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.shipping.address.firstName} {order.shipping.address.lastName}
                      </p>
                      <p>{order.shipping.address.street} {order.shipping.address.number}</p>
                      {order.shipping.address.apartment && (
                        <p>Dpto: {order.shipping.address.apartment}</p>
                      )}
                      <p>{order.shipping.address.city}, {order.shipping.address.province}</p>
                      <p>CP: {order.shipping.address.postalCode}</p>
                      <p>{order.shipping.address.country}</p>
                      <div className="mt-2 space-y-1">
                        {order.shipping.address.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {order.shipping.address.phone}
                          </p>
                        )}
                        {order.shipping.address.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {order.shipping.address.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Información de Pago */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Información de Pago
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Pago {order.payment.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {order.payment.method} • ID: {order.payment.mercadoPagoId}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(order.payment.mercadoPagoId)}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                {/* Detalles completos de MercadoPago */}
                {paymentDetails && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Detalles de la Transacción
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                          <span className="font-medium">
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
                      </div>
                      
                      <div className="space-y-2">
                        {paymentDetails.date_approved && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                            <span>{new Date(paymentDetails.date_approved).toLocaleDateString('es-AR')}</span>
                          </div>
                        )}
                        {paymentDetails.card && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Tarjeta:</span>
                            <span>****{paymentDetails.card.last_four_digits}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {paymentDetails.receipt_url && (
                      <div className="mt-4">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <a
                            href={paymentDetails.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Comprobante de MercadoPago
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumen de la Orden */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Resumen
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium">
                    ${order.totals.subtotal.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Envío:</span>
                  <span className="font-medium">
                    {order.totals.shipping > 0 
                      ? `$${order.totals.shipping.toLocaleString('es-AR')}`
                      : 'Gratis'
                    }
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      ${order.totals.total.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Acciones */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Acciones
              </h2>

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => copyToClipboard(order.orderNumber)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar número de orden
                </Button>

                {paymentDetails?.receipt_url && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                  >
                    <a
                      href={paymentDetails.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar comprobante
                    </a>
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                >
                  <Link href="/support">
                    <User className="w-4 h-4 mr-2" />
                    Contactar soporte
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Información de contacto */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ¿Necesitas ayuda?
              </h2>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>
                  Si tienes preguntas sobre tu pedido, no dudes en contactarnos.
                </p>
                <div className="space-y-1">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    soporte@byblue.com
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    +54 11 1234-5678
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
