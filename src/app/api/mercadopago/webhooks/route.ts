import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

const payment = new Payment(client)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('MercadoPago Webhook received:', body)

    // Verificar que sea una notificación de pago
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id
      
      try {
        // Obtener los detalles del pago
        const paymentInfo = await payment.get({
          id: paymentId
        })

        console.log('Payment info:', paymentInfo)

        // Aquí puedes procesar el pago según su estado
        switch (paymentInfo.status) {
          case 'approved':
            console.log('Pago aprobado:', paymentId)
            // Actualizar la orden en tu base de datos
            // Enviar email de confirmación
            // Etc.
            break
          
          case 'pending':
            console.log('Pago pendiente:', paymentId)
            // Actualizar estado del pedido
            break
          
          case 'rejected':
            console.log('Pago rechazado:', paymentId)
            // Manejar pago rechazado
            break
          
          case 'cancelled':
            console.log('Pago cancelado:', paymentId)
            // Manejar pago cancelado
            break
        }

      } catch (error) {
        console.error('Error getting payment info:', error)
      }
    }

    // Responder a MercadoPago que recibimos la notificación
    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}
