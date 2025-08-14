import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

const preference = new Preference(client)

export async function POST(request: NextRequest) {
  try {
    // Validar variables de entorno
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN no está configurado')
      return NextResponse.json(
        { error: 'Configuración de MercadoPago incompleta' },
        { status: 500 }
      )
    }
    
    if (!process.env.NEXTAUTH_URL) {
      console.error('NEXTAUTH_URL no está configurado')
      return NextResponse.json(
        { error: 'URL base no configurada' },
        { status: 500 }
      )
    }

    console.log('Using MercadoPago token:', process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 20) + '...')
    console.log('Using base URL:', process.env.NEXTAUTH_URL)

    const body = await request.json()
    const { items, payer } = body

    // Validar y limpiar items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Los items son requeridos' },
        { status: 400 }
      )
    }

    // Validar cada item y asegurar que tenga los campos requeridos
    const validItems = items.map(item => ({
      id: item.id || `item_${Date.now()}`,
      title: item.title || 'Producto',
      description: item.description || '',
      picture_url: item.picture_url || '',
      category_id: item.category_id || 'others',
      quantity: parseInt(item.quantity) || 1,
      currency_id: 'ARS',
      unit_price: parseFloat(item.unit_price) || 0
    }))

    // Verificar que al menos un item tenga precio válido
    const totalAmount = validItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'El monto total debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Crear la preferencia simplificada (máxima compatibilidad)
    const externalRef = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const preferenceData: any = {
      items: validItems,
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/checkout/callback`,
        failure: `${process.env.NEXTAUTH_URL}/checkout/callback`,
        pending: `${process.env.NEXTAUTH_URL}/checkout/callback`
      },
      external_reference: externalRef
    }

    // Solo agregar payer si tiene email válido
    if (payer && payer.email && payer.email.includes('@')) {
      preferenceData.payer = {
        email: payer.email
      }
      
      // Agregar nombre solo si está disponible
      if (payer.name && payer.surname) {
        preferenceData.payer.name = payer.name
        preferenceData.payer.surname = payer.surname
      }
    }

    console.log('=== MERCADOPAGO DEBUG ===')
    console.log('Received items:', JSON.stringify(items, null, 2))
    console.log('Received payer:', JSON.stringify(payer, null, 2))
    console.log('Valid items:', JSON.stringify(validItems, null, 2))
    console.log('Total amount:', totalAmount)
    console.log('Final preference data:', JSON.stringify(preferenceData, null, 2))

    const result = await preference.create({
      body: preferenceData
    })

    console.log('MercadoPago preference created successfully:', result.id)
    console.log('Init point:', result.init_point)
    console.log('Sandbox init point:', result.sandbox_init_point)
    console.log('External reference:', externalRef)

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      external_reference: externalRef
    })

  } catch (error) {
    console.error('=== MERCADOPAGO ERROR ===')
    console.error('Full error object:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Si es un error de MercadoPago, extraer más información
    if (error && typeof error === 'object' && 'cause' in error) {
      console.error('MercadoPago API error cause:', error.cause)
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
