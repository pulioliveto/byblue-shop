import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID de pago requerido' },
        { status: 400 }
      )
    }

    // Aquí harías la llamada a la API de MercadoPago para verificar el estado
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Error al consultar el estado del pago')
    }

    const paymentData = await response.json()
    
    return NextResponse.json({
      id: paymentData.id,
      status: paymentData.status,
      status_detail: paymentData.status_detail,
      transaction_amount: paymentData.transaction_amount,
      currency_id: paymentData.currency_id,
      date_created: paymentData.date_created,
      date_approved: paymentData.date_approved,
      payment_method: paymentData.payment_method_id,
      installments: paymentData.installments,
      payer: {
        email: paymentData.payer?.email,
        first_name: paymentData.payer?.first_name,
        last_name: paymentData.payer?.last_name
      },
      card: paymentData.card ? {
        last_four_digits: paymentData.card.last_four_digits,
        cardholder_name: paymentData.card.cardholder?.name
      } : null,
      receipt_url: `https://www.mercadopago.com.ar/activities/receipt?payment-id=${paymentData.id}`
    })

  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
