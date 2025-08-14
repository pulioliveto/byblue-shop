import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('MercadoPago webhook received:', JSON.stringify(body, null, 2))
    
    // Aquí podrías procesar las notificaciones de MercadoPago
    // Por ejemplo, actualizar el estado de las órdenes en tu base de datos
    
    const { type, data } = body
    
    if (type === 'payment') {
      const paymentId = data.id
      console.log(`Payment notification received for payment ID: ${paymentId}`)
      
      // Aquí podrías obtener los detalles del pago y actualizar tu base de datos
      // const paymentDetails = await fetchPaymentFromMP(paymentId)
      // await updateOrderStatus(paymentDetails)
    }
    
    // MercadoPago espera una respuesta 200 para confirmar que recibiste la notificación
    return NextResponse.json({ status: 'ok' }, { status: 200 })
    
  } catch (error) {
    console.error('Error processing MercadoPago webhook:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}

// También manejar GET para verificación de MercadoPago
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'webhook endpoint active' })
}
