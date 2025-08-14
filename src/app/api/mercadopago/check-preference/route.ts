import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

const payment = new Payment(client)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const preferenceId = searchParams.get('preference_id')
    
    if (!preferenceId) {
      return NextResponse.json(
        { error: 'preference_id es requerido' },
        { status: 400 }
      )
    }

    console.log('Checking payments for preference:', preferenceId)

    // Buscar pagos asociados a la preferencia usando external_reference
    const searchResult = await payment.search({
      options: {
        external_reference: preferenceId,
        sort: 'date_created',
        criteria: 'desc'
      }
    })

    console.log('Search result:', JSON.stringify(searchResult, null, 2))

    if (searchResult.results && searchResult.results.length > 0) {
      // Tomar el pago más reciente
      const latestPayment = searchResult.results[0]
      
      return NextResponse.json({
        found: true,
        payment: {
          id: latestPayment.id,
          status: latestPayment.status,
          status_detail: latestPayment.status_detail,
          transaction_amount: latestPayment.transaction_amount,
          currency_id: latestPayment.currency_id,
          date_created: latestPayment.date_created,
          date_approved: latestPayment.date_approved,
          payment_method_id: latestPayment.payment_method_id,
          external_reference: latestPayment.external_reference
        }
      })
    } else {
      return NextResponse.json({
        found: false,
        message: 'No se encontraron pagos para esta preferencia'
      })
    }

  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
