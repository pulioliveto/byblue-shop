"use client"

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PaymentCallback() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    console.log('=== PAYMENT CALLBACK ===')
    console.log('All search params:', Array.from(searchParams.entries()))
    
    // Obtener los parámetros de la URL
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const externalReference = searchParams.get('external_reference')
    const preferenceId = searchParams.get('preference_id')
    const merchantOrder = searchParams.get('merchant_order_id')
    
    console.log('Extracted params:', {
      paymentId,
      status,
      externalReference,
      preferenceId,
      merchantOrder
    })
    console.log('Window opener exists:', !!window.opener)
    
    // Enviar los datos a la ventana padre
    if (window.opener) {
      console.log('Sending message to parent window')
      const messageData = {
        type: 'MERCADOPAGO_PAYMENT_RESULT',
        data: {
          paymentId,
          status,
          externalReference,
          preferenceId,
          merchantOrder,
          success: status === 'approved',
          isPending: status === 'pending' || status === 'in_process'
        }
      }
      
      console.log('Message data:', messageData)
      window.opener.postMessage(messageData, window.location.origin)
      
      // Cerrar esta ventana después de un pequeño delay
      setTimeout(() => {
        console.log('Closing popup window')
        window.close()
      }, 1000)
    } else {
      console.log('No parent window, redirecting directly')
      // Si no hay ventana padre, redirigir según el estado
      const params = new URLSearchParams()
      if (paymentId) params.set('payment_id', paymentId)
      if (status) params.set('status', status)
      if (externalReference) params.set('external_reference', externalReference)
      
      // Redirigir a la página correspondiente según el estado
      let redirectPath = '/checkout/success'
      if (status === 'pending' || status === 'in_process') {
        redirectPath = '/checkout/pending'
      } else if (status === 'rejected' || status === 'cancelled') {
        redirectPath = '/checkout/failure'
      }
      
      console.log('Redirecting to:', redirectPath)
      window.location.href = `${redirectPath}?${params.toString()}`
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center max-w-md">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Procesando pago...
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Estamos confirmando tu pago con MercadoPago. Esta ventana se cerrará automáticamente.
        </p>
      </div>
    </div>
  )
}
