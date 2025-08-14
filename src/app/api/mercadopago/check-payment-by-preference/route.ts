import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const preferenceId = searchParams.get('preference_id')

    if (!preferenceId) {
      return NextResponse.json(
        { error: 'Preference ID is required' },
        { status: 400 }
      )
    }

    console.log('Checking payment for preference:', preferenceId)

    // Buscar pagos por external_reference usando la API REST de MercadoPago
    const searchUrl = `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(preferenceId)}&sort=date_created&criteria=desc`
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('MercadoPago API error:', response.status, response.statusText)
      throw new Error(`MercadoPago API error: ${response.status}`)
    }

    const searchResult = await response.json()

    console.log('Payment search result:', {
      paging: searchResult.paging,
      results_count: searchResult.results?.length || 0,
      results: searchResult.results?.map((p: any) => ({
        id: p.id,
        status: p.status,
        external_reference: p.external_reference
      }))
    })

    if (searchResult.results && searchResult.results.length > 0) {
      // Tomar el pago más reciente
      const latestPayment = searchResult.results[0]
      
      return NextResponse.json({
        found: true,
        payment: {
          payment_id: latestPayment.id,
          status: latestPayment.status,
          external_reference: latestPayment.external_reference,
          status_detail: latestPayment.status_detail,
          payment_method: latestPayment.payment_method_id,
          transaction_amount: latestPayment.transaction_amount
        }
      })
    }

    return NextResponse.json({
      found: false,
      message: 'No payment found for this preference'
    })

  } catch (error) {
    console.error('Error checking payment by preference:', error)
    
    return NextResponse.json(
      { 
        error: 'Error checking payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
