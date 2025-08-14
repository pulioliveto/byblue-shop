"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { XCircle, ArrowLeft, RotateCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function CheckoutFailure() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const statusDetail = searchParams.get('status_detail')

  useEffect(() => {
    if (paymentId) {
      setPaymentInfo({
        id: paymentId,
        status: status,
        statusDetail: statusDetail
      })
    }
  }, [paymentId, status, statusDetail])

  const getErrorMessage = (statusDetail: string | null) => {
    switch (statusDetail) {
      case 'cc_rejected_insufficient_amount':
        return 'Fondos insuficientes en la tarjeta'
      case 'cc_rejected_bad_filled_security_code':
        return 'Código de seguridad incorrecto'
      case 'cc_rejected_bad_filled_date':
        return 'Fecha de vencimiento incorrecta'
      case 'cc_rejected_bad_filled_other':
        return 'Datos de la tarjeta incorrectos'
      case 'cc_rejected_call_for_authorize':
        return 'Debes autorizar el pago con tu banco'
      case 'cc_rejected_card_disabled':
        return 'La tarjeta está deshabilitada'
      case 'cc_rejected_card_error':
        return 'Error en la tarjeta'
      default:
        return 'Ha ocurrido un problema con el pago'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4">
            <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Pago no procesado
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          {statusDetail ? getErrorMessage(statusDetail) : 'No se pudo procesar tu pago en este momento.'}
        </p>

        {paymentInfo && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Detalles del intento de pago
            </h3>
            <div className="space-y-2 text-sm">
              {paymentInfo.id && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID de Pago:</span>
                  <span className="font-mono">{paymentInfo.id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {paymentInfo.status === 'rejected' ? 'Rechazado' : 'Fallido'}
                </span>
              </div>
              {paymentInfo.statusDetail && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Detalle:</span>
                  <span className="font-mono text-xs">{paymentInfo.statusDetail}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <RotateCcw className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <div className="text-left">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                ¿Qué puedes hacer?
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Verifica los datos de tu tarjeta o intenta con otro método de pago.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.back()} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Intentar nuevamente
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link href="/shop">
                <RotateCcw className="w-4 h-4 mr-2" />
                Volver a la tienda
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
            Si el problema persiste, por favor{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              contáctanos
            </Link>
            {' '}para recibir ayuda.
          </p>
        </div>
      </Card>
    </div>
  )
}
